// rules.js - Enterprise Knowledge Base v3.2 (Precision Priority & Boundary Guard)

(function(global) {
    'use strict';

    const isLuhnValid = (val) => {
        if (!val) return false;
        let str = val.replace(/\D/g, '');
        if (str.length < 13 || str.length > 19) return false;
        let sum = 0, shouldDouble = false;
        for (let i = str.length - 1; i >= 0; i--) {
            let digit = parseInt(str.charAt(i), 10);
            if (shouldDouble) { if ((digit *= 2) > 9) digit -= 9; }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return (sum % 10) === 0;
    };

    const isTWIDValid = (val) => {
        if (!val) return false;
        const id = val.toUpperCase();
        if (!/^[A-Z][1289]\d{8}$/.test(id)) return false;
        const letters = 'ABCDEFGHJKLMNPQRSTUVXYWZIO';
        const num = letters.indexOf(id[0]) + 10;
        const digits = (Math.floor(num / 10) * 1) + ((num % 10) * 9) + 
                       (parseInt(id[1], 10) * 8) + (parseInt(id[2], 10) * 7) + 
                       (parseInt(id[3], 10) * 6) + (parseInt(id[4], 10) * 5) + 
                       (parseInt(id[5], 10) * 4) + (parseInt(id[6], 10) * 3) + 
                       (parseInt(id[7], 10) * 2) + (parseInt(id[8], 10) * 1) + 
                       (parseInt(id[9], 10) * 1);
        return digits % 10 === 0;
    };

    const rules = {
        // 嚴格依照「高精確特徵 -> 低精確特徵」順序排列，防止搶佔
        structured: [
            // 1. 最高優先度：長 Token 與特定前綴憑證
            { id: 'API_KEY', tokenPrefix: 'API_TOKEN', regex: /\b(?:sk|pk|api|token|secret)_[a-zA-Z0-9]{16,}/g },
            { id: 'DB_CONNECTION', tokenPrefix: 'DATABASE_DSN', regex: /(?:mongodb|mysql|postgresql|redis|jdbc):\/\/[^\s]+/gi },
            { id: 'EMAIL', tokenPrefix: 'CORPORATE_EMAIL', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
            { id: 'MAC_ADDRESS', tokenPrefix: 'MAC_ADDRESS', regex: /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b/g },
            { id: 'IP_ADDRESS', tokenPrefix: 'IP_ADDRESS', regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g },

            // 2. 特殊證件與卡號 (含演算法校驗)
            { id: 'CREDIT_CARD', tokenPrefix: 'CREDIT_CARD_NO', regex: /\b3[47]\d{2}[\s-]?\d{6}[\s-]?\d{5}\b|\b(?:\d{4}[\s-]?){3}\d{4}\b/g, validator: isLuhnValid },
            { id: 'TW_ID', tokenPrefix: 'TW_ID_NUMBER', regex: /\b[A-Z][1289]\d{8}\b/g, validator: isTWIDValid },
            { id: 'HKID', tokenPrefix: 'HKID_NUMBER', regex: /\b[A-Za-z]{1,2}\d{6}\(?[0-9A]\)?/g },
            { id: 'MEDICAL_RECORD', tokenPrefix: 'MEDICAL_RECORD_NO', regex: /\b(?:病歷|病號|MRN|健保)\s*[-:]?\s*[A-Z0-9]{6,12}\b/gi },
            
            // 3. 金融與特定格式編號 (移除 SWIFT /g 的 i 標籤，防止切碎英文名)
            { id: 'SWIFT_CODE', tokenPrefix: 'SWIFT_BIC', regex: /\b[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g, validator: (val) => val.length >= 8 && val === val.toUpperCase() },
            { id: 'CONTRACT_ID', tokenPrefix: 'CONTRACT_REF_NO', regex: /\b[A-Z]{2,4}-\d{4,6}-\d{2,4}\b/g },
            { id: 'BANK_ACCOUNT', tokenPrefix: 'BANK_ACCOUNT_NO', regex: /\b\d{3}[-]\d{6,9}\b|\b\d{10,14}\b/g },
            { id: 'CLAUSE_REF', tokenPrefix: 'CLAUSE_REF', regex: /(?:Section|Art\.|條)\s*\d+[\.\d]*/gi },
            { id: 'VEHICLE_PLATE', tokenPrefix: 'VEHICLE_LICENSE', regex: /\b[A-Z]{2,3}[\s-]?\d{3,4}\b/g },

            // 4. 通用電話號碼 (降至最後，防止誤吞信用卡或銀行帳號)
            { id: 'PHONE', tokenPrefix: 'PHONE_NUMBER', regex: /(?:\+\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/g, validator: (val) => val.replace(/\D/g, '').length >= 8 }
        ],

        financial: [
            { id: 'SALARY_AMOUNT', tokenPrefix: 'CONFIDENTIAL_AMOUNT', regex: /(?:HK\$|NT\$|USD\$|\$|港幣|台幣|美元|¥|£|€)\s*[\d,]+(?:\.\d+)?(?:萬|元|K|M|B)?|[\d,]+(?:\.\d+)?\s*(?:萬|元|港幣|台幣|美元)/gi },
            { id: 'EQUITY_SHARES', tokenPrefix: 'EQUITY_SHARES', regex: /\b[\d,]+(?:\s*萬)?\s*(?:股|期權|股份|shares?)\b/gi }
        ],

        organizational: [
            { id: 'COMPANY_NAME', tokenPrefix: 'ENTERPRISE_CLIENT', regex: /[\u4e00-\u9fa5a-zA-Z0-9]{2,30}(?:有限公司|股份有限公司|集團|公司|企業|中心|事務所|銀行|基金會)/g, validator: (val) => val.length >= 4 },
            // 限縮專案名稱，防止吞噬「聯絡人/經理」等職稱與人名
            { id: 'PROJECT_CODE', tokenPrefix: 'CONFIDENTIAL_PROJECT', regex: /(?:Project|計畫|計劃|專案)\s*([A-Za-z0-9]{2,15}|[\u4e00-\u9fa5]{2,6})(?=\s|[,.，。]|$)/g, validator: (val) => !['聯絡人', '負責人', '經理', '主管', '團隊'].some(b => val.includes(b)) },
            { id: 'ADDRESS', tokenPrefix: 'ADDRESS_LOCATION', regex: /(?:臺北|台北|台中|台南|高雄|香港|九龍|新界|澳門|新加坡|上海|北京|深圳|廣州)[\u4e00-\u9fa50-9]{2,40}(?:路|街|巷|弄|號|樓|大道|道)/g, validator: (val) => val.length >= 5 }
        ],

        temporal: [
            { id: 'BIRTH_DATE', tokenPrefix: 'DATE_OF_BIRTH', regex: /(?:出生|生日|DOB|Birth)[:\s]*(\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}日?)/gi },
            { id: 'RECORD_DATE', tokenPrefix: 'RECORD_DATE', regex: /(\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}日?)/g },
            { id: 'PERFORMANCE_SCORE', tokenPrefix: 'PERFORMANCE_SCORE', regex: /\b\d+\.\d+\s*(?:分|級|等|rank)\b/gi }
        ],

        contextual: {
            orgSuffixes: ['有限公司', '股份有限公司', '集團', '企業', '中心', '事務所', '部門', '委員會', '銀行', '基金會', '協會'],
            surnames: [
                '陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊', '許', '鄭', '謝', '洪', '郭', '邱', '曾', '廖', '賴', '徐',
                '周', '葉', '蘇', '莊', '呂', '江', '何', '蕭', '羅', '高', '簡', '朱', '鍾', '施', '游', '詹', '沈', '彭', '胡', '余',
                '盧', '潘', '顏', '梁', '趙', '柯', '翁', '魏', '方', '孫', '張簡', '歐陽', '宋', '鄧', '杜', '侯', '曹', '薛'
            ]
        }
    };

    global.PROMPT_OFFLINE_RULES = rules;
})(typeof window !== 'undefined' ? window : this);
