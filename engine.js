// engine.js - Clean & Deterministic Sanitizer Core v2.0
// 純本地端、無狀態的去識別化引擎 (相容 Enterprise Plus 規則)

class PromptSanitizerEngine {
    constructor(rulesConfig) {
        this.rules = rulesConfig;
        this.mapping = new Map();
        this.reverseMapping = new Map();
        
        // 動態扁平化所有規則群組
        this.allRules = [
            ...(rulesConfig.structured || []),
            ...(rulesConfig.financial || []),
            ...(rulesConfig.organizational || []),
            ...(rulesConfig.temporal || [])
        ];
        
        // 若有自訂規則 (custom)，一併匯入
        if (rulesConfig.custom) {
            Object.values(rulesConfig.custom).forEach(group => {
                if (Array.isArray(group)) this.allRules.push(...group);
            });
        }
    }

    resetSession() {
        this.mapping.clear();
        this.reverseMapping.clear();
    }

    sanitize(text) {
        this.resetSession();
        let result = text;

        // 輔助函式：套用規則並生成 Token
        const applyRule = (regex, prefix, validator = () => true) => {
            const matches = [...result.matchAll(regex)];
            let idx = 0;
            matches.forEach(m => {
                const rawVal = m[0].trim();
                if (!this.reverseMapping.has(rawVal) && rawVal.length > 0 && validator(rawVal)) {
                    // 若為公司、人名、專案等，使用字母 A, B, C... 否則使用數字 1, 2, 3...
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
        };

        // 階段 1: 遍歷所有 Taxonomy 規則 (Structured, Financial, Organizational, Temporal)
        this.allRules.forEach(rule => {
            applyRule(rule.regex, rule.tokenPrefix, rule.validator);
        });

        // 階段 2: 處理上下文中文人名 (Contextual Cues + Surnames)
        const titlePattern = this.rules.contextual.titles.join('|');
        const verbPattern = this.rules.contextual.verbs.join('|');
        const surnamePattern = this.rules.contextual.surnames.join('|');
        
        // 改良人名正則：考慮姓氏或職稱/動作提示
        const nameRegex = new RegExp(`(?:(?:${surnamePattern})[\\u4e00-\\u9fa5]{1,2}|[\\u4e00-\\u9fa5]{2,4})(?=\\s*[（\\(]?(?:${titlePattern})|[\\s，,、。.．]|(?:${verbPattern})|$)`, 'g');
        
        const nameMatches = [...result.matchAll(nameRegex)];
        let nameIdx = 0;
        nameMatches.forEach(m => {
            const nameVal = m[0].trim();
            // 排除機構後綴、純數字與已知特徵，確認是合理的名字長度
            const isValidName = nameVal.length >= 2 && 
                                !this.rules.contextual.orgSuffixes.some(s => nameVal.includes(s)) &&
                                !/\d/.test(nameVal);

            if (isValidName && !this.reverseMapping.has(nameVal)) {
                const token = `[EMPLOYEE_NAME_${String.fromCharCode(65 + nameIdx % 26)}]`;
                this.mapping.set(token, nameVal);
                this.reverseMapping.set(nameVal, token);
                nameIdx++;
            }
        });

        // 階段 3: 執行字串替換 (依照 rawValue 長度遞減，防止部分字串被錯誤切碎)
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
