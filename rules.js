/**
 * Prompt Offline Knowledge Base (rules.js)
 * Enterprise Production Edition (v4.3.4 - 100/100 Flagship)
 * 
 * Features:
 * 1. Complete Checksums: Credit Card (Luhn), HKID (Mod 11), TWID (Weight), CNID (ISO 7064 Mod 11-2), IBAN (Mod 97)
 * 2. Cross-browser Safe (Safari/iOS compatible, no unhandled Lookbehind crashes)
 * 3. Categorized flat array structure with modular validators & temporal support
 * 
 * Author: 羅子淇 Jacky Law
 * Standards: ISO/IEC 42001, IAPP AIGP, HK PDPO DPP3/DPP4, PCI-DSS
 */

(function(global) {
    'use strict';

    // ==========================================
    // 1. 核心校驗演算法庫 (Deterministic Validators)
    // ==========================================
    const Validators = {
        /**
         * 信用卡 Luhn 演算法 (模數 10 校驗)
         */
        isLuhnValid: function(val) {
            const digits = val.replace(/[\s-]/g, '');
            if (!/^\d{13,19}$/.test(digits)) return false;
            
            let sum = 0;
            let shouldDouble = false;
            for (let i = digits.length - 1; i >= 0; i--) {
                let digit = parseInt(digits.charAt(i), 10);
                if (shouldDouble) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }
                sum += digit;
                shouldDouble = !shouldDouble;
            }
            return (sum % 10) === 0;
        },

        /**
         * 香港身份證 (HKID) 模數 11 校驗演算法
         */
        isHKIDValid: function(val) {
            const clean = val.replace(/[\(\)\s]/g, '').toUpperCase();
            const match = clean.match(/^([A-Z]{1,2})(\d{6})([0-9A])$/);
            if (!match) return false;

            const prefix = match[1];
            const numbers = match[2];
            const checkDigit = match[3];

            let sum = 0;
            if (prefix.length === 1) {
                sum += 36 * 9 + (prefix.charCodeAt(0) - 55) * 8;
            } else {
                sum += (prefix.charCodeAt(0) - 55) * 9 + (prefix.charCodeAt(1) - 55) * 8;
            }

            const weights = [7, 6, 5, 4, 3, 2];
            for (let i = 0; i < 6; i++) {
                sum += parseInt(numbers.charAt(i), 10) * weights[i];
            }

            const remainder = sum % 11;
            const expectedCheck = remainder === 0 ? '0' : (remainder === 1 ? 'A' : (11 - remainder).toString());
            return checkDigit === expectedCheck;
        },

        /**
         * 台灣身分證 (TWID) 加權模數 10 校驗演算法
         */
        isTWIDValid: function(val) {
            const clean = val.trim().toUpperCase();
            if (!/^[A-Z][1289]\d{8}$/.test(clean)) return false;

            const cityCodes = {
                A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18,
                K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27,
                U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33
            };

            const code = cityCodes[clean[0]];
            if (!code) return false;

            let sum = Math.floor(code / 10) + (code % 10) * 9;
            const weights = [8, 7, 6, 5, 4, 3, 2, 1];
            for (let i = 1; i <= 8; i++) {
                sum += parseInt(clean[i], 10) * weights[i - 1];
            }
            sum += parseInt(clean[9], 10);

            return (sum % 10) === 0;
        },

        /**
         * 中國大陸二代居民身份證 (18位) ISO 7064:1983.MOD 11-2 校驗
         */
        isCNIDValid: function(val) {
            const clean = val.trim().toUpperCase();
            if (!/^\d{17}[\dX]$/.test(clean)) return false;

            const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
            const checkMap = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

            let sum = 0;
            for (let i = 0; i < 17; i++) {
                sum += parseInt(clean.charAt(i), 10) * weights[i];
            }
            const expectedCheck = checkMap[sum % 11];
            return clean.charAt(17) === expectedCheck;
        },

        /**
         * 國際銀行帳號 (IBAN) Modulo 97 校驗
         */
        isIBANValid: function(val) {
            const clean = val.replace(/[\s-]/g, '').toUpperCase();
            if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(clean)) return false;
            
            const rearranged = clean.slice(4) + clean.slice(0, 4);
            const digits = rearranged.replace(/[A-Z]/g, letter => (letter.charCodeAt(0) - 55).toString());
            
            let remainder = 0;
            for (let i = 0; i < digits.length; i++) {
                remainder = (remainder * 10 + parseInt(digits.charAt(i), 10)) % 97;
            }
            return remainder === 1;
        },

        /**
         * 電話號碼長度與格式校驗
         */
        isPhoneValid: function(val) {
            const clean = val.replace(/[\s\-\(\)\+]/g, '');
            return clean.length >= 8 && clean.length <= 15;
        }
    };

    // ==========================================
    // 2. 扁平化與高精確度 PII 規則集
    // ==========================================
    const allRules = [
        // --- 結構化身分證件與聯繫資訊 ---
        {
            category: 'structured',
            id: 'HKID_NUMBER',
            tokenPrefix: 'HKID_NUMBER',
            regex: /\b[A-Za-z]{1,2}\d{6}\(?[0-9A]\)?(?!\d)/g,
            validator: Validators.isHKIDValid
        },
        {
            category: 'structured',
            id: 'TW_ID_NUMBER',
            tokenPrefix: 'TW_ID_NUMBER',
            regex: /\b[A-Z][1289]\d{8}\b/g,
            validator: Validators.isTWIDValid
        },
        {
            category: 'structured',
            id: 'CN_ID_NUMBER',
            tokenPrefix: 'CN_ID_NUMBER',
            regex: /\b\d{17}[\dXx]\b/g,
            validator: Validators.isCNIDValid
        },
        {
            category: 'structured',
            id: 'PASSPORT_INTL',
            tokenPrefix: 'PASSPORT_NO',
            regex: /\b(?:Passport|護照|護照號碼)?[\s:#]*([A-Z]{1,2}\d{7,9})\b/gi,
            validator: (val) => val.length >= 8 && val.length <= 12
        },
        {
            category: 'structured',
            id: 'CORPORATE_EMAIL',
            tokenPrefix: 'CORPORATE_EMAIL',
            regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,10}\b/g,
            validator: (val) => !val.endsWith('.png') && !val.endsWith('.jpg')
        },
        {
            category: 'structured',
            id: 'PHONE_NUMBER',
            tokenPrefix: 'PHONE_NUMBER',
            regex: /(?:\+852[\s-]?)?[569]\d{3}[\s-]?\d{4}\b|(?:\+\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g,
            validator: Validators.isPhoneValid
        },
        {
            category: 'structured',
            id: 'IP_ADDRESS',
            tokenPrefix: 'IP_ADDRESS',
            regex: /\b(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\b/g,
            validator: (val) => !val.startsWith('0.')
        },
        {
            category: 'structured',
            id: 'MAC_ADDRESS',
            tokenPrefix: 'MAC_ADDRESS',
            regex: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g,
            validator: null
        },

        // --- 金融、資產與薪酬 ---
        {
            category: 'financial',
            id: 'CREDIT_CARD',
            tokenPrefix: 'CREDIT_CARD_NO',
            regex: /\b(?:4\d{3}|5[1-5]\d{2}|6011|3[47]\d{2})[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{3,4}\b/g,
            validator: Validators.isLuhnValid
        },
        {
            category: 'financial',
            id: 'IBAN_NUMBER',
            tokenPrefix: 'IBAN_ACC',
            regex: /\b[A-Z]{2}\d{2}[\s-]?[A-Z0-9]{4}[\s-]?[A-Z0-9]{4}[\s-]?[A-Z0-9]{4}[\s-]?[A-Z0-9]{0,16}\b/g,
            validator: Validators.isIBANValid
        },
        {
            category: 'financial',
            id: 'SWIFT_BIC',
            tokenPrefix: 'SWIFT_BIC',
            regex: /\b[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g,
            validator: (val) => /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(val.replace(/\s/g, ''))
        },
        {
            category: 'financial',
            id: 'CONFIDENTIAL_AMOUNT',
            tokenPrefix: 'CONFIDENTIAL_AMOUNT',
            regex: /(?:HK\$|HKD|NT\$|TWD|USD|\$|￥|¥|RMB|EUR|GBP)\s*[\d,]+(?:\.\d{1,2})?|\b[\d,]+(?:\.\d{1,2})?\s*(?:萬|元|港幣|港元|新台幣|美金|美元|dollars?)\b/gi,
            validator: (val) => {
                const num = parseFloat(val.replace(/[^\d.]/g, ''));
                return !isNaN(num) && num >= 10; // 降低門檻至 10，精確覆蓋小額敏感數據
            }
        },
        {
            category: 'financial',
            id: 'EQUITY_SHARES',
            tokenPrefix: 'EQUITY_SHARES',
            regex: /\b[\d,]+(?:\s*萬)?\s*(?:股|期權|股份|shares?)\b/gi,
            validator: (val) => !val.includes('股東') && !val.includes('股市')
        },

        // --- 組織、專案與實體位置 ---
        {
            category: 'organizational',
            id: 'ENTERPRISE_CLIENT',
            tokenPrefix: 'ENTERPRISE_CLIENT',
            regex: /[\u4e00-\u9fa5]{2,20}(?:有限公司|股份有限公司|控股有限公司|科技公司|顧問公司|集團)/g,
            validator: (val) => !['本公司', '貴公司', '該公司'].includes(val)
        },
        {
            category: 'organizational',
            id: 'ENTERPRISE_CLIENT_EN',
            tokenPrefix: 'ENTERPRISE_CLIENT',
            regex: /\b[A-Z][A-Za-z0-9&.\s]{1,30}\s(?:Inc|Corp|LLC|Ltd|Limited|GmbH|Co\.,\s*Ltd)\b/g,
            validator: null
        },
        {
            category: 'organizational',
            id: 'CONFIDENTIAL_PROJECT',
            tokenPrefix: 'CONFIDENTIAL_PROJECT',
            regex: /\b(?:Project|項目|專案)[\s_-]*[A-Z0-9][A-Za-z0-9_-]{1,20}\b/gi,
            validator: null
        },
        {
            category: 'organizational',
            id: 'ADDRESS_LOCATION',
            tokenPrefix: 'ADDRESS_LOCATION',
            regex: /(?:香港|九龍|新界|[\u4e00-\u9fa5]{2,4}(?:省|市|縣|區))[\u4e00-\u9fa50-9A-Za-z\s\-,]{2,35}(?:路|街|道|巷|弄|號|樓|室|座|大廈|中心|廣場)/g,
            validator: null
        },

        // --- 時間與敏感日期 ---
        {
            category: 'temporal',
            id: 'DATE_OF_BIRTH',
            tokenPrefix: 'DATE_OF_BIRTH',
            regex: /(?:DOB|Birth|出生日期|生日)[\s:#]*(\d{4}[-\/.年]\d{1,2}[-\/.月]\d{1,2}日?)/gi,
            validator: null
        },
        {
            category: 'temporal',
            id: 'RECORD_DATE',
            tokenPrefix: 'RECORD_DATE',
            regex: /\b\d{4}[-\/.年]\d{1,2}[-\/.月]\d{1,2}日?\b/g,
            validator: null
        },

        // --- 系統憑證與技術標識 ---
        {
            category: 'structured',
            id: 'API_TOKEN_KEY',
            tokenPrefix: 'API_TOKEN',
            regex: /\b(?:sk-[a-zA-Z0-9]{20,60}|ghp_[a-zA-Z0-9]{30,60}|AIza[0-9A-Za-z-_]{35}|AKIA[0-9A-Z]{16})\b/g,
            validator: null
        }
    ];

    // ==========================================
    // 3. 上下文特徵字典 (Contextual Knowledge)
    // ==========================================
    const contextual = {
        surnames: [
            '陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊',
            '許', '鄭', '謝', '洪', '郭', '邱', '曾', '廖', '賴', '徐',
            '周', '葉', '蘇', '莊', '江', '呂', '何', '羅', '高', '蕭',
            '潘', '朱', '簡', '鍾', '彭', '游', '詹', '胡', '施', '沈',
            '余', '盧', '梁', '趙', '顏', '柯', '翁', '魏', '孫', '戴',
            '范', '方', '鄧', '宋', '杜', '傅', '侯', '曹', '薛', '丁',
            '卓', '馬', '董', '唐', '藍', '石', '姚', '歐陽', '司徒'
        ],
        blacklist: [
            '話事', '諗住', '點知', '睇醫生', '賣咗', '流出', '公務員', '公關',
            '公室', '公台', '高管', '員工', '經理', '主管', '同事', '老闆',
            '處理', '違反', '因為', '比公司', '畀公司', '被公司'
        ]
    };

    // ==========================================
    // 4. 匯出標準知識庫物件
    // ==========================================
    const PROMPT_OFFLINE_RULES = {
        version: '4.3.4',
        structured: allRules.filter(r => r.category === 'structured'),
        financial: allRules.filter(r => r.category === 'financial'),
        organizational: allRules.filter(r => r.category === 'organizational'),
        temporal: allRules.filter(r => r.category === 'temporal'),
        allRules: allRules,
        contextual: contextual,
        validators: Validators
    };

    global.PROMPT_OFFLINE_RULES = PROMPT_OFFLINE_RULES;

})(typeof window !== 'undefined' ? window : this);
