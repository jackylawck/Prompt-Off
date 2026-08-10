// engine.js - Prompt Sanitizer Core v3.8 (Bilingual Isolation & Boundary Guarded)

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
                const activeRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
                const matches = [...result.matchAll(activeRegex)];
                let idx = this.mapping.size;

                matches.forEach(m => {
                    // 若有捕獲組且非整體，優先選取有效內容，否則取完整匹配字串
                    const rawVal = (m[1] && m[1].length > 1 ? m[1] : m[0]).trim();
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

        // 階段 1: 依優先順序執行結構化 PII 比對 (含 API Key, 護照, HKID, 英文職稱人名等)
        this.allRules.forEach(rule => {
            if (rule && rule.regex) {
                applyRule(rule.regex, rule.tokenPrefix, rule.validator);
            }
        });

        // 階段 2: 複姓與單字姓氏精準比對 (含嚴格黑名單防禦)
        if (this.rules.contextual && Array.isArray(this.rules.contextual.surnames)) {
            const surnamePattern = this.rules.contextual.surnames.join('|');
            const nameRegex = new RegExp(`(?:${surnamePattern})[\\u4e00-\\u9fa5]{1,2}`, 'g');
            const orgSuffixes = this.rules.contextual.orgSuffixes || [];
            
            applyRule(nameRegex, 'EMPLOYEE_NAME', (val) => {
                if (val.length < 2 || val.length > 4 || /\d/.test(val)) return false;
                if (orgSuffixes.some(s => val === s)) return false;
                
                // 全面擴充中英文非人名黑名單（新增單字姓「公/高/夏/方」之常用詞，杜絕「公開」、「辦公室」誤殺）
                const blacklist = [
                    '高達', '高階', '高管', '方案', '代表', '表達', '要求', '說明', '指示', '安排', 
                    '計畫', '計劃', '項目', '專案', '合約', '公司', '集團', '部門', '銀行', 
                    '帳號', '金額', '績效', '評核', '條例', '框架', '開發', '聯絡人', '負責人', 
                    '辦公室', '交割', '進行', '處理', '報告', '主管', '經理', '董事', '處置', '通知',
                    '決議', '處分', '管理', '公告', '股票', '公開', '辦公', '公務', '公式', '公佈', 
                    '公營', '公有', '公務員', '公安', '公平', '公佈欄', '公文', '方舟', '夏日'
                ];
                if (blacklist.some(b => val.includes(b) || val === b)) return false;
                
                return true;
            });
        }

        // 階段 3: 字串長度遞減全域替換 (防止子字串碎裂)
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
