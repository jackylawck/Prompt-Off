// rules.js - Enterprise Knowledge Base v4.3.2 (Lookbehind Syntax Fix)

(function(global) {
    'use strict';

    const isTWIDFormat = (val) => {
        if (!val) return false;
        return /^[A-Za-z][1289]\d{8}$/.test(val.trim());
    };

    const isHKIDFormat = (val) => {
        if (!val) return false;
        return /^[A-Za-z]{1,2}\d{6}\(?[0-9A]\)?$/.test(val.trim().replace(/\s/g, ''));
    };

    const rules = {
        structured: [
            // 1. API Keys & Database DSN
            { id: 'API_KEY', tokenPrefix: 'API_TOKEN', regex: /\b(?:sk|pk|api|token|secret|ghp|xoxb)[a-zA-Z0-9\-_]{16,}\b/gi },
            { id: 'DB_CONNECTION', tokenPrefix: 'DATABASE_DSN', regex: /(?:mongodb|mysql|postgresql|redis|jdbc):\/\/[^\s]+/gi },
            { id: 'EMAIL', tokenPrefix: 'CORPORATE_EMAIL', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
            
            // 2. Hardware & Network Identifiers
            { id: 'MAC_ADDRESS', tokenPrefix: 'MAC_ADDRESS', regex: /(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}/g },
            { id: 'IP_ADDRESS', tokenPrefix: 'IP_ADDRESS', regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g },

            // 3. Payment Cards & Financials
            { id: 'CREDIT_CARD', tokenPrefix: 'CREDIT_CARD_NO', regex: /\b3[47]\d{2}[\s-]?\d{6}[\s-]?\d{5}\b|\b(?:\d{4}[\s-]?){3}\d{4}\b/g },
            
            // 4. Passports & Government IDs
            { id: 'PASSPORT_INTL', tokenPrefix: 'PASSPORT_NO', regex: /\b[A-Z]\d{8}\b|\bPassport[:\s]*[A-Z0-9]{8,9}\b/gi },
            { id: 'TW_ID', tokenPrefix: 'TW_ID_NUMBER', regex: /\b[A-Za-z][1289]\d{8}\b/g, validator: isTWIDFormat },
            { id: 'HKID', tokenPrefix: 'HKID_NUMBER', regex: /\b[A-Za-z]{1,2}\d{6}\(?[0-9A]\)?(?!\d)/g, validator: isHKIDFormat },
            { id: 'MEDICAL_RECORD', tokenPrefix: 'MEDICAL_RECORD_NO', regex: /\b(?:MRN|Medical Record Number|病歷|病號|健保)\s*[-:]?\s*[A-Z0-9]{6,12}\b/gi },
            
            // 5. Contracts, Banking & Vehicle Plates
            { id: 'SWIFT_CODE', tokenPrefix: 'SWIFT_BIC', regex: /\b[A-Z]{4}(?:HK|TW|US|GB|CN|JP|SG|EU)[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g },
            { id: 'CONTRACT_ID', tokenPrefix: 'CONTRACT_REF_NO', regex: /\b[A-Z]{2,4}-\d{4,6}-\d{2,4}\b/g },
            { id: 'BANK_ACCOUNT', tokenPrefix: 'BANK_ACCOUNT_NO', regex: /\b\d{3}[-]\d{6,9}\b|\b\d{10,14}\b/g },
            { id: 'CLAUSE_REF', tokenPrefix: 'CLAUSE_REF', regex: /(?:Section|Art\.|條)\s*\d+[\.\d]*/gi },
            { id: 'VEHICLE_PLATE', tokenPrefix: 'VEHICLE_LICENSE', regex: /\b[A-Z]{2,3}[\s-]?\d{3,4}\b/g },

            // 6. Title-Prefixed Contextual English Names
            { id: 'ENGLISH_NAME', tokenPrefix: 'EMPLOYEE_NAME', regex: /\b(?:Senior\s+)?(?:Director|Manager|Patient|Doctor|Dr\.|Mr\.|Ms\.|Mrs\.|Officer|Contact|President|CEO|Executive|Vice President)\s+[A-Z][A-Za-z.'-]{1,20}(?:\s+[A-Z][A-Za-z.'-]{1,20}){1,3}\b/g },

            // 7. Universal Phone Numbers
            { id: 'PHONE', tokenPrefix: 'PHONE_NUMBER', regex: /(?<![A-Za-z0-9])(?:\+\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}(?![A-Za-z0-9])/g, validator: (val) => val.replace(/\D/g, '').length >= 8 }
        ],

        financial: [
            { id: 'SALARY_AMOUNT', tokenPrefix: 'CONFIDENTIAL_AMOUNT', regex: /(?:HK\$|NT\$|USD\$|\$|港幣|台幣|美元|¥|£|€)\s*[\d,]+(?:\.\d+)?(?:萬|元|K|M|B)?|[\d,]+(?:\.\d+)?\s*(?:萬|元|港幣|台幣|美元)/gi },
            { id: 'EQUITY_SHARES', tokenPrefix: 'EQUITY_SHARES', regex: /[\d,]+(?:\s*萬)?\s*(?:股|期權|股份|shares?)/gi }
        ],

        organizational: [
            { id: 'COMPANY_NAME_EN', tokenPrefix: 'ENTERPRISE_CLIENT', regex: /\b[A-Z][A-Za-z0-9&.\s]{2,30}(?:Inc\.|Ltd\.|LLC|Corp\.|Corporation|Solutions|Systems|Capital|Group)\b/g },
            // v4.3.2 修正：否定後顧否定語法修正 (?<!語詞1|語詞2)
            { id: 'COMPANY_NAME_ZH', tokenPrefix: 'ENTERPRISE_CLIENT', regex: /(?<!因為|違反|比|被|同埋|代表|收購|對|向|於|在)[\u4e00-\u9fa5a-zA-Z0-9]{2,20}(?:有限公司|股份有限公司|集團|公司|企業|中心|事務所|基金會)/g, validator: (val) => val.length >= 4 && !['因為', '違反', '同埋', '正式', '處理', '比公司', '被公司'].some(b => val.startsWith(b)) },
            { id: 'PROJECT_CODE', tokenPrefix: 'CONFIDENTIAL_PROJECT', regex: /(?:Project|計畫|計劃|專案)\s*([A-Za-z0-9\s-]{2,20}|[\u4e00-\u9fa5]{2,6})(?=\s|[,.，。]|$)/g },
            { id: 'ADDRESS_EN', tokenPrefix: 'ADDRESS_LOCATION', regex: /\b\d{1,5}\s+[A-Z][A-Za-z0-9\s.,'-]{2,30}(?:Street|St\.|Avenue|Ave\.|Road|Rd\.|Boulevard|Blvd\.|Drive|Dr\.|Way|Lane|Ln\.)(?:,\s*(?:Apt|Suite|Floor|Building|\d+[A-Z]?)\s*\d*[A-Z]*)?(?:,\s*[A-Za-z\s]+)?\b/g },
            { id: 'ADDRESS_ZH', tokenPrefix: 'ADDRESS_LOCATION', regex: /(?:臺北|台北|台中|台南|高雄|香港|九龍|新界|澳門|新加坡|上海|北京|深圳|廣州)[\u4e00-\u9fa50-9]{2,40}(?:路|街|巷|弄|號|樓|大道|道)(?:\s*[A-Za-z0-9]+(?:\s*樓|\s*室)?)?/g, validator: (val) => val.length >= 5 }
        ],

        temporal: [
            { id: 'BIRTH_DATE', tokenPrefix: 'DATE_OF_BIRTH', regex: /(?:出生|生日|DOB|Birth)[:\s]*(\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}日?)/gi },
            { id: 'RECORD_DATE', tokenPrefix: 'RECORD_DATE', regex: /(\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}日?)/g },
            { id: 'PERFORMANCE_SCORE', tokenPrefix: 'PERFORMANCE_SCORE', regex: /\b\d+\.\d+\s*(?:分|級|等|rank)\b/gi }
        ],

        contextual: {
            orgSuffixes: ['有限公司', '股份有限公司', '集團', '企業', '中心', '事務所', '部門', '委員會', '銀行', '基金會', '協會'],
            surnames: [
                '夏侯', '公孫', '上官', '歐陽', '司徒', '諸葛', '張簡', '申屠', '皇甫', '尉遲',
                '陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊', '許', '鄭', '謝', '洪', '郭', '邱', '曾', '廖', '賴', '徐',
                '周', '葉', '蘇', '莊', '呂', '江', '何', '蕭', '羅', '高', '簡', '朱', '鍾', '施', '游', '詹', '沈', '彭', '胡', '余',
                '盧', '潘', '顏', '梁', '趙', '柯', '翁', '魏', '方', '孫', '宋', '鄧', '杜', '侯', '曹', '薛', '夏', '公'
            ]
        }
    };

    global.PROMPT_OFFLINE_RULES = rules;
})(typeof window !== 'undefined' ? window : this);
