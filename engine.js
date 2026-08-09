// engine.js - Clean & Deterministic Sanitizer Core
// 純本地端、無狀態的去識別化引擎

class PromptSanitizerEngine {
    constructor(rulesConfig) {
        this.rules = rulesConfig;
        this.mapping = new Map();        // Token -> Raw Data
        this.reverseMapping = new Map(); // Raw Data -> Token
    }

    resetSession() {
        this.mapping.clear();
        this.reverseMapping.clear();
    }

    sanitize(text) {
        this.resetSession();
        let result = text;

        // 輔助函式：套用規則並生成 Token
        const applyRule = (regex, prefix, validator = () => true, useIndexGroup = false) => {
            const matches = [...result.matchAll(regex)];
            let idx = 0;
            matches.forEach(m => {
                const rawVal = (useIndexGroup && m[1] ? m[1] : m[0]).trim();
                if (!this.reverseMapping.has(rawVal) && rawVal.length > 0 && validator(rawVal)) {
                    // 若為公司、人名、專案等，使用字母 A, B, C... 否則使用數字 1, 2, 3...
                    let key = '';
                    if (['EMPLOYEE_NAME', 'ENTERPRISE_CLIENT_NAME', 'CONFIDENTIAL_PROJECT_CODE'].includes(prefix)) {
                        key = `[${prefix}_${String.fromCharCode(65 + idx % 26)}${idx >= 26 ? Math.floor(idx / 26) : ''}]`;
                    } else {
                        key = `[${prefix}_${idx + 1}]`;
                    }
                    this.mapping.set(key, rawVal);
                    this.reverseMapping.set(rawVal, key);
                    idx++;
                }
            });
        };

        // 階段 1: 結構化 PII
        this.rules.structured.forEach(rule => {
            const useGroup = rule.id === 'COMPANY';
            applyRule(rule.regex, rule.tokenPrefix, rule.validator, useGroup);
        });

        // 階段 2: 企業自訂專案代號
        this.rules.customKeywords.forEach(rule => {
            applyRule(rule.regex, rule.tokenPrefix, rule.validator);
        });

        // 階段 3: 上下文中文人名
        const titlePattern = this.rules.contextual.titles.join('|');
        const verbPattern = this.rules.contextual.verbs.join('|');
        const nameRegex = new RegExp(`([\\u4e00-\\u9fa5]{2,4})(?=\\s*[（\\(]?(?:${titlePattern})|[\\s，,、。.．]|(?:${verbPattern})|$)`, 'g');
        
        applyRule(nameRegex, 'EMPLOYEE_NAME', (val) => {
            return val.length >= 2 && !this.rules.contextual.orgSuffixes.some(s => val.includes(s));
        }, true);

        // 階段 4: 執行替換 (依照 rawValue 長度遞減，防止部分字串被錯誤切碎)
        const sortedRawValues = [...this.reverseMapping.keys()].sort((a, b) => b.length - a.length);
        sortedRawValues.forEach(rawVal => {
            const token = this.reverseMapping.get(rawVal);
            result = result.replaceAll(rawVal, token);
        });

        return {
            sanitizedText: result.replace(/\s+/g, ' ').trim(),
            mappingTable: Object.fromEntries(this.mapping)
        };
    }

    restore(safeAIText) {
        let restored = safeAIText;
        // 依照 Token 長度遞減排序進行還原
        const sortedTokens = [...this.mapping.keys()].sort((a, b) => b.length - a.length);
        sortedTokens.forEach(token => {
            const rawVal = this.mapping.get(token);
            restored = restored.replaceAll(token, rawVal);
        });
        return restored;
    }
}
