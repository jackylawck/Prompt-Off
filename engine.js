// engine.js - Prompt Sanitizer Core v3.1 (Name Match Fix)

class PromptSanitizerEngine {
    constructor(rulesConfig) {
        this.rules = rulesConfig || {};
        this.mapping = new Map();
        this.reverseMapping = new Map();
        
        this.allRules = [
            ...(this.rules.structured || []),
            ...(this.rules.financial || []),
            ...(this.rules.organizational || []),
            ...(this.rules.temporal || [])
        ];
        
        if (this.rules.custom) {
            Object.values(this.rules.custom).forEach(group => {
                if (Array.isArray(group)) this.allRules.push(...group);
            });
        }
    }

    resetSession() {
        this.mapping.clear();
        this.reverseMapping.clear();
    }

    clearSession() {
        this.resetSession();
    }

    sanitize(text) {
        if (!text) return { sanitizedText: '', mappingTable: {} };
        let result = text;

        const applyRule = (regex, prefix, validator) => {
            try {
                const flags = regex.flags.includes('g') ? regex.flags : regex.flags + 'g';
                const activeRegex = new RegExp(regex.source, flags);
                const matches = [...result.matchAll(activeRegex)];
                let idx = this.mapping.size;

                matches.forEach(m => {
                    const rawVal = (m[1] ? m[1] : m[0]).trim();
                    const isValid = (typeof validator === 'function') ? validator(rawVal) : true;

                    if (isValid && !this.reverseMapping.has(rawVal) && rawVal.length > 0) {
                        let key = '';
                        if (['EMPLOYEE_NAME', 'ENTERPRISE_CLIENT', 'CONFIDENTIAL_PROJECT'].includes(prefix)) {
                            key = `[${prefix}_${String.fromCharCode(65 + idx % 26)}${idx >= 26 ? Math.floor(idx / 26) : ''}]`;
                        } else {
                            key = `[${prefix}_${idx + 1}]`;
                        }
                        this.mapping.set(key, rawVal);
                        this.reverseMapping.set(rawVal, key);
                        idx++;
                    }
                });
            } catch (err) {
                console.warn(`Rule execution failed for ${prefix}:`, err);
            }
        };

        // 階段 1: 執行結構化與分類規則 (優先度高的 PII)
        this.allRules.forEach(rule => {
            if (rule && rule.regex) {
                applyRule(rule.regex, rule.tokenPrefix, rule.validator);
            }
        });

        // 階段 2: 精準中文人名識別 (修正「王大明」、「李四」被誤殺問題)
        if (this.rules.contextual && Array.isArray(this.rules.contextual.surnames)) {
            const surnamePattern = this.rules.contextual.surnames.join('|');
            // 比對 姓氏 + 1~2 個中文字
            const nameRegex = new RegExp(`(?:${surnamePattern})[\\u4e00-\\u9fa5]{1,2}`, 'g');
            const orgSuffixes = this.rules.contextual.orgSuffixes || [];
            
            applyRule(nameRegex, 'EMPLOYEE_NAME', (val) => {
                // 排除長度不合、含數字、或整詞就是機構後綴 (例如「黃頁」、「陳設」)
                if (val.length < 2 || val.length > 4 || /\d/.test(val)) return false;
                if (orgSuffixes.some(s => val === s)) return false;
                
                // 確保不是常見非人名詞彙
                const blacklist = ['專案', '計畫', '計劃', '合約', '公司', '集團', '部門', '銀行', '帳號', '金額', '績效', '評核', '條例', '框架', '開發'];
                if (blacklist.some(b => val.includes(b))) return false;
                
                return true;
            });
        }

        // 階段 3: 字串遞減長度全域替換
        const sortedRawValues = [...this.reverseMapping.keys()].sort((a, b) => b.length - a.length);
        sortedRawValues.forEach(rawVal => {
            const token = this.reverseMapping.get(rawVal);
            const escaped = rawVal.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            result = result.replace(new RegExp(escaped, 'g'), token);
        });

        return {
            sanitizedText: result,
            mappingTable: Object.fromEntries(this.mapping)
        };
    }

    restore(safeAIText) {
        if (!safeAIText) return '';
        let restored = safeAIText;
        const sortedTokens = [...this.mapping.keys()].sort((a, b) => b.length - a.length);
        
        sortedTokens.forEach(token => {
            const rawVal = this.mapping.get(token);
            const escaped = token.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            restored = restored.replace(new RegExp(escaped, 'gi'), rawVal);
        });
        return restored;
    }
}
