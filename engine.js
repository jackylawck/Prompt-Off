// engine.js - Clean & Deterministic Sanitizer Core v3.0 (Incremental & Resilient)

class PromptSanitizerEngine {
    constructor(rulesConfig) {
        this.rules = rulesConfig;
        this.mapping = new Map();
        this.reverseMapping = new Map();
        
        // 扁平化所有類別的規則
        this.allRules = [
            ...(rulesConfig.structured || []),
            ...(rulesConfig.financial || []),
            ...(rulesConfig.organizational || []),
            ...(rulesConfig.temporal || [])
        ];
        
        // 如果未來有加 custom 自訂規則，自動納入
        if (rulesConfig.custom) {
            Object.values(rulesConfig.custom).forEach(group => {
                if (Array.isArray(group)) this.allRules.push(...group);
            });
        }
    }

    // 將清空邏輯獨立，由 UI (index.html) 的 btnClearInput 觸發
    resetSession() {
        this.mapping.clear();
        this.reverseMapping.clear();
    }

    sanitize(text) {
        let result = text; // 注意：這裡不再呼叫 resetSession()，支援連續增量貼上！

        const applyRule = (regex, prefix, validator = () => true) => {
            const matches = [...result.matchAll(regex)];
            let idx = this.mapping.size; // 延續目前的數量，防止覆蓋
            matches.forEach(m => {
                // 如果有 capturing group 就取第一個，否則取全域匹配
                const rawVal = (m[1] ? m[1] : m[0]).trim();
                if (!this.reverseMapping.has(rawVal) && rawVal.length > 0 && validator(rawVal)) {
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

        // 階段 1: 遍歷執行所有 Taxonomy 規則
        this.allRules.forEach(rule => {
            applyRule(rule.regex, rule.tokenPrefix, rule.validator);
        });

        // 階段 2: 人名處理優化 (放寬斷言，利用強大的百家姓庫進行非貪婪匹配)
        const surnamePattern = this.rules.contextual.surnames.join('|');
        const nameRegex = new RegExp(`\\b(?:${surnamePattern})[\\u4e00-\\u9fa5]{1,2}\\b`, 'g');
        
        applyRule(nameRegex, 'EMPLOYEE_NAME', (val) => {
            return val.length >= 2 && !this.rules.contextual.orgSuffixes.some(s => val.includes(s)) && !/\d/.test(val);
        });

        // 階段 3: 執行字串全域替換
        const sortedRawValues = [...this.reverseMapping.keys()].sort((a, b) => b.length - a.length);
        sortedRawValues.forEach(rawVal => {
            const token = this.reverseMapping.get(rawVal);
            // 改用正則全域替換 (g)，移除舊版 .replace(/\s+/g, ' ')，100% 保留原始合約/程式碼排版
            result = result.replace(new RegExp(rawVal.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g'), token);
        });

        return {
            sanitizedText: result.trim(),
            mappingTable: Object.fromEntries(this.mapping)
        };
    }

    restore(safeAIText) {
        let restored = safeAIText;
        const sortedTokens = [...this.mapping.keys()].sort((a, b) => b.length - a.length);
        sortedTokens.forEach(token => {
            const rawVal = this.mapping.get(token);
            // 使用忽略大小寫 (gi) 替換，防範 LLM 擅自改變 Token 的大小寫 (例如回傳 [employee_name_a])
            restored = restored.replace(new RegExp(token.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'gi'), rawVal);
        });
        return restored;
    }
}
