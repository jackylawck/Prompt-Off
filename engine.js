// engine.js - Clean & Deterministic Sanitizer Core v3.0 (Fixed Bug Version)

class PromptSanitizerEngine {
    constructor(rulesConfig) {
        this.rules = rulesConfig || {};
        this.mapping = new Map();
        this.reverseMapping = new Map();
        
        // 安全扁平化所有類別的規則
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

    // 同時支援重置 Session (雙重方法相容 index.html 的呼叫)
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
                // 為避免全域正則 lastIndex 狀態殘留，建立新正則執行
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

        // 階段 1: 執行所有結構化與分類規則
        this.allRules.forEach(rule => {
            if (rule && rule.regex) {
                applyRule(rule.regex, rule.tokenPrefix, rule.validator);
            }
        });

        // 階段 2: 中文百家姓非貪婪比對
        if (this.rules.contextual && Array.isArray(this.rules.contextual.surnames)) {
            const surnamePattern = this.rules.contextual.surnames.join('|');
            const nameRegex = new RegExp(`\\b(?:${surnamePattern})[\\u4e00-\\u9fa5]{1,2}\\b`, 'g');
            
            applyRule(nameRegex, 'EMPLOYEE_NAME', (val) => {
                const orgSuffixes = this.rules.contextual.orgSuffixes || [];
                return val.length >= 2 && !orgSuffixes.some(s => val.includes(s)) && !/\d/.test(val);
            });
        }

        // 階段 3: 全域精準長度遞減替換
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
