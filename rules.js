// rules.js - Enterprise Knowledge Base v3.8 (Bilingual Isolation Guard)

(function(global) {
    'use strict';

    const isTWIDFormat = (val) => {
        if (!val) return false;
        return /^[A-Za-z][1289]\d{8}$/.test(val.trim());
    };

    const rules = {
        structured: [
            // 1. API Keys & Database DSN
            { id: 'API_KEY', tokenPrefix: 'API_TOKEN', regex: /\b(?:sk|pk|api|token|secret|ghp|xoxb)[a-zA-Z0-9\-_]{16,}\b/gi },
            { id: 'DB_CONNECTION', tokenPrefix: 'DATABASE_DSN', regex: /(?:mongodb|mysql|postgresql|redis|jdbc):\/\/[^\s]+/gi },
            { id: 'EMAIL', tokenPrefix: 'CORPORATE_EMAIL', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
            
            // 2. Hardware & Network
            { id: 'MAC_ADDRESS', tokenPrefix: 'MAC_ADDRESS', regex: /(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}/g },
            { id: 'IP_ADDRESS', tokenPrefix: 'IP_ADDRESS', regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g },

            // 3. Payment Cards
            { id: 'CREDIT_CARD', tokenPrefix: 'CREDIT_CARD_NO', regex: /\b3[47]\d{2}[\s-]?\d{6}[\s-]?\d{5}\b|\b(?:\d{4}[\s-]?){3}\d{4}\b/g },
            
            // 4. International Passport Prioritized OVER HKID (Prevent Truncation)
            { id: 'PASSPORT_INTL', tokenPrefix: 'PASSPORT_NO', regex: /\b(?:Passport[:\s]*)?[A-Z][0-9]{8}\b|\bPassport[:\s]*[A-Z0-9]{8,9}\b/gi },
            { id: 'TW_ID', tokenPrefix: 'TW_ID_NUMBER', regex: /\b[A-Za-z][1289]\d{8}\b/g, validator: isTWIDFormat },
            // HKID 加入 (?!\d) 防護，防止吃掉 9 碼護照號碼
            { id: 'HKID', tokenPrefix: 'HKID_NUMBER', regex: /\b[A-Za-z]{1,2}\d{6}\(?[0-9A]\)?(?!\d)/g },
            { id: 'MEDICAL_RECORD', tokenPrefix: 'MEDICAL_RECORD_NO', regex: /\b(?:MRN|Medical Record Number|病歷|病號|健保)\s*[-:]?\s*[A-Z0-9]{6,12}\b/gi },
            
            // 5. Contracts, Banking & Vehicle License
            { id: 'SWIFT_CODE', tokenPrefix: 'SWIFT_BIC', regex: /\b[A-Z]{4}(?:HK|TW|US|GB|CN|JP|SG|EU)[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g },
            { id: 'CONTRACT_ID', tokenPrefix: 'CONTRACT_REF_NO', regex: /\b[A-Z]{2,4}-\d{4,6}-\d{2,4}\b/g },
            { id: 'BANK_ACCOUNT', tokenPrefix: 'BANK_ACCOUNT_NO', regex: /\b\d{3}[-]\d{6,9}\b|\b\d{10,14}\b/g },
            { id: 'CLAUSE_REF', tokenPrefix: 'CLAUSE_REF', regex: /(?:Section|Art\.|條)\s*\d+[\.\d]*/gi },
            { id: 'VEHICLE_PLATE', tokenPrefix: 'VEHICLE_LICENSE', regex: /\b[A-Z]{2,3}[\s-]?\d{3,4}\b/g },

            // 6. Title-Prefixed English Full Names
            { id: 'ENGLISH_NAME', tokenPrefix: 'EMPLOYEE_NAME', regex: /\b(?:Director|Manager|Patient|Doctor|Dr\.|Mr\.|Ms\.|Mrs\.|Officer|Contact|President|CEO|Vice President)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b/g },

            // 7. Phone Numbers
            { id: 'PHONE', tokenPrefix: 'PHONE_NUMBER', regex: /(?<![A-Za-z0-9])(?:\+\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}(?![A-Za-z0-9])/g, validator: (val) => val.replace(/\D/g, '').length >= 8 }
        ],

        financial: [
            { id: 'SALARY_AMOUNT', tokenPrefix: 'CONFIDENTIAL_AMOUNT', regex: /(?:HK\$|NT\$|USD\$|\$|港幣|台幣|美元|¥|£|€)\s*[\d,]+(?:\.\d+)?(?:萬|元|K|M|B)?|[\d,]+(?:\.\d+)?\s*(?:萬|元|港幣|台幣|美元)/gi },
            { id: 'EQUITY_SHARES', tokenPrefix: 'EQUITY_SHARES', regex: /\b[\d,]+(?:\s*萬)?\s*(?:股|期權|股份|shares?)\b/gi }
        ],

        organizational: [
            { id: 'COMPANY_NAME_EN', tokenPrefix: 'ENTERPRISE_CLIENT', regex: /\b[A-Z][A-Za-z0-9&.\s]{2,30}(?:Inc\.|Ltd\.|LLC|Corp\.|Corporation|Solutions|Systems|Capital|Group)\b/g },
            { id: 'COMPANY_NAME_ZH', tokenPrefix: 'ENTERPRISE_CLIENT', regex: /[\u4e00-\u9fa5a-zA-Z0-9]{2,30}(?:有限公司|股份有限公司|集團|公司|企業|中心|事務所|銀行|基金會)/g, validator: (val) => val.length >= 4 },
            { id: 'PROJECT_CODE', tokenPrefix: 'CONFIDENTIAL_PROJECT', regex: /(?:Project|計畫|計劃|專案)\s*([A-Za-z0-9]{2,15}|[\u4e00-\u9fa5]{2,6})(?=\s|[,.，。]|$)/g, validator: (val) => !['聯絡人', '負責人', '經理', '主管', '團隊', '計畫', '計劃', '方案', '項目', '交割'].some(b => val.includes(b)) },
            { id: 'ADDRESS_EN', tokenPrefix: 'ADDRESS_LOCATION', regex: /\b\d{1,5}\s+[A-Z][a-zA-Z0-9\s.,]{2,30}(?:Street|St\.|Avenue|Ave\.|Road|Rd\.|Boulevard|Blvd\.|Drive|Dr\.|Way|Lane|Ln\.)(?:,\s*[A-Za-z\s]+)?\b/g },
            { id: 'ADDRESS_ZH', tokenPrefix: 'ADDRESS_LOCATION', regex: /(?:臺北|台北|台中|台南|高雄|香港|九龍|新界|澳門|新加坡|上海|北京|深圳|廣州)[\u4e00-\u9fa50-9]{2,40}(?:路|街|巷|弄|號|樓|大道|道)/g, validator: (val) => val.length >= 5 }
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
