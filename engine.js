/**
 * PromptSanitizerEngine (v4.3.4 Ultra-Hardened Edition)
 * High-Performance, Deterministic, Single-Pass Local Pseudonymization Sandbox
 * 
 * Author: 羅子淇 Jacky Law
 * Compliance: ISO/IEC 42001, IAPP AIGP, HK PDPO DPP3/DPP4
 */

(function(global) {
    'use strict';

    // 輔助工具：安全轉義正則特殊字元，防止 ReDoS 與注入攻擊
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    class PromptSanitizerEngine {
        constructor(rulesConfig = {}, options = {}) {
            this.rulesConfig = rulesConfig || {};
            this.maxMappingSize = options.maxMappingSize || 1000;   // 記憶體上限防護 (防止 OOM)
            this.maxReplacements = options.maxReplacements || 500; // 單次最大替換量防護 (防止巨型正則回溯)
            this.onError = typeof options.onError === 'function' ? options.onError : null; // 自訂日誌回呼
            
            this.mapping = new Map();         // Token -> RawValue
            this.reverseMapping = new Map();  // RawValue -> Token
            this.compileErrors = [];          // 規則編譯錯誤觀測紀錄
            
            // 構建高效黑名單 Set (含廣東話口語及常見被動/拆解防禦詞)
            const userBlacklist = this.rulesConfig.contextual?.blacklist || [];
            const defaultBlacklist = [
                '本公司', '貴公司', '該公司', '有限公司', '股份有限公司',
                '話事', '諗住', '點知', '睇醫生', '賣咗', '流出', '公務員', '公關',
                '處理', '違反', '因為', '比公司', '畀公司', '被公司', '正式比', '正式畀', '正式被',
                '公室', '公台', '高管', '員工', '經理', '主管', '同事', '老闆'
            ];
            this.blacklist = new Set([...defaultBlacklist, ...userBlacklist]);

            // 預編譯所有規則
            this.compiledRules = this._compileRules(this.rulesConfig);
        }

        /**
         * 預編譯規則，加入錯誤觀測與日誌回呼，防止規則靜默失效
         */
        _compileRules(config) {
            const rules = [];
            const categories = ['structured', 'financial', 'organizational', 'temporal'];

            categories.forEach(cat => {
                if (Array.isArray(config[cat])) {
                    config[cat].forEach(rule => {
                        try {
                            if (!rule.regex || !(rule.regex instanceof RegExp)) {
                                throw new Error(`Invalid regex format in rule ID: ${rule.id}`);
                            }
                            const flags = rule.regex.flags.includes('g') ? rule.regex.flags : rule.regex.flags + 'g';
                            rules.push({
                                id: rule.id,
                                tokenPrefix: rule.tokenPrefix,
                                regex: new RegExp(rule.regex.source, flags),
                                validator: typeof rule.validator === 'function' ? rule.validator : null
                            });
                        } catch (err) {
                            const errObj = { id: rule.id, error: err.message };
                            this.compileErrors.push(errObj);
                            if (this.onError) {
                                this.onError(errObj);
                            } else if (typeof console !== 'undefined' && console.warn) {
                                console.warn(`[Prompt-Off Engine] 規則編譯警告 (${rule.id}):`, err.message);
                            }
                        }
                    });
                }
            });

            // 預編譯中文姓名規則 (支援 100 大姓氏與邊界防禦)
            if (config.contextual?.surnames && Array.isArray(config.contextual.surnames)) {
                const surnamesPattern = config.contextual.surnames.map(escapeRegExp).join('|');
                const nameRegex = new RegExp(`(?<![\\u4e00-\\u9fa5a-zA-Z0-9])(?:${surnamesPattern})[\\u4e00-\\u9fa5]{1,2}(?![\\u4e00-\\u9fa5a-zA-Z0-9])`, 'g');
                rules.push({
                    id: 'ZH_NAME_CONTEXTUAL',
                    tokenPrefix: 'EMPLOYEE_NAME',
                    regex: nameRegex,
                    validator: (val) => {
                        const trimmed = val.trim();
                        return trimmed.length >= 2 && trimmed.length <= 4 && !this.blacklist.has(trimmed);
                    }
                });
            }

            return rules;
        }

        /**
         * 生成唯一、防碰撞的 Token (格式: [PREFIX_1], [PREFIX_2])
         */
        _generateToken(prefix, index) {
            return `[${prefix}_${index + 1}]`;
        }

        /**
         * 單次遍歷脫敏主函數 (修正 trim Bug，加入批次上限與防錯)
         */
        sanitize(text) {
            if (!text || typeof text !== 'string') {
                return { sanitizedText: '', mappingTable: {} };
            }

            // 超過設定上限時自動實施記憶體保護
            if (this.mapping.size >= this.maxMappingSize) {
                this.resetSession();
            }

            const rawText = text;
            let matches = [];

            // 1. 執行預編譯正則收集候選匹配
            for (const rule of this.compiledRules) {
                rule.regex.lastIndex = 0;
                let match;
                while ((match = rule.regex.exec(rawText)) !== null) {
                    const rawVal = match[0];          // 保留原始匹配字串（用於 replace 的 Map key）
                    const trimmedVal = rawVal.trim();  // 僅供驗證與黑名單過濾

                    if (!trimmedVal || this.blacklist.has(trimmedVal)) continue;

                    // 執行驗證器 (如 Luhn 演算法、證件模數)
                    if (rule.validator && !rule.validator(trimmedVal)) continue;

                    matches.push({
                        raw: rawVal,
                        prefix: rule.tokenPrefix,
                        length: rawVal.length
                    });
                }
            }

            if (matches.length === 0) {
                return { 
                    sanitizedText: rawText, 
                    mappingTable: Object.fromEntries(this.mapping) 
                };
            }

            // 2. 按匹配長度降序排序，長詞優先代換避免子字串錯位
            matches.sort((a, b) => b.length - a.length);

            // 2.1 批次上限防護：避免極端惡意輸入造成正則回溯
            if (matches.length > this.maxReplacements) {
                matches = matches.slice(0, this.maxReplacements);
            }

            // 3. 註冊新 Token 到記憶體對照表 (使用 rawVal 作為唯一 Key)
            const activeReplacements = new Map();
            for (const item of matches) {
                if (!this.reverseMapping.has(item.raw)) {
                    const token = this._generateToken(item.prefix, this.mapping.size);
                    this.mapping.set(token, item.raw);
                    this.reverseMapping.set(item.raw, token);
                }
                activeReplacements.set(item.raw, this.reverseMapping.get(item.raw));
            }

            // 4. 單次回調替換 (Single-Pass String Replacement)
            const escapedPatterns = Array.from(activeReplacements.keys())
                .sort((a, b) => b.length - a.length)
                .map(escapeRegExp);

            if (escapedPatterns.length === 0) {
                return { sanitizedText: rawText, mappingTable: Object.fromEntries(this.mapping) };
            }

            const masterRegex = new RegExp(escapedPatterns.join('|'), 'g');
            const sanitizedText = rawText.replace(masterRegex, (matched) => {
                // matched 與 Map Key 完全一致，零漏報風險
                return activeReplacements.get(matched) || matched;
            });

            return {
                sanitizedText: sanitizedText,
                mappingTable: Object.fromEntries(this.mapping)
            };
        }

        /**
         * 反向精準還原 (De-pseudonymize)
         */
        restore(safeText) {
            if (!safeText || typeof safeText !== 'string' || this.mapping.size === 0) {
                return safeText || '';
            }

            // 提取所有已知 Token 並按長度排序
            const tokens = Array.from(this.mapping.keys()).sort((a, b) => b.length - a.length);
            const tokenPattern = new RegExp(tokens.map(escapeRegExp).join('|'), 'g');

            // 嚴格單次掃描代回真實值
            return safeText.replace(tokenPattern, (token) => {
                return this.mapping.get(token) || token;
            });
        }

        /**
         * 揮發性銷毀 Session 記憶體
         */
        resetSession() {
            this.mapping.clear();
            this.reverseMapping.clear();
        }
    }

    // 導出全域物件
    global.PromptSanitizerEngine = PromptSanitizerEngine;

})(typeof window !== 'undefined' ? window : this);
