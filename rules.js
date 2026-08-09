// rules.js - Prompt Offline Enterprise Knowledge Base v2.1
// 企業強化版：支援 25+ 種 PII 分級語意標籤 (含 PCI-DSS / HIPAA / DevOps 場景)

const PROMPT_OFFLINE_RULES = {
    // =====================================================
    // 1. 結構化 PII (Structured PII)
    // =====================================================
    structured: [
        { id: 'EMAIL', tokenPrefix: 'CORPORATE_EMAIL', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
        { id: 'PHONE', tokenPrefix: 'PHONE_NUMBER', regex: /(?:\(?\+?\d{1,3}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}[\s-]?\d{3,4}/g, validator: (val) => val.replace(/\D/g, '').length >= 8 },
        { id: 'HKID', tokenPrefix: 'HKID_NUMBER', regex: /[A-Za-z]{1,2}\d{6}\(?[0-9A]\)?/gi },
        { id: 'TW_ID', tokenPrefix: 'TW_ID_NUMBER', regex: /[A-Z]\d{9}/gi },
        { id: 'PASSPORT', tokenPrefix: 'PASSPORT_NO', regex: /\b[A-Z]{1,2}\d{6,8}\b/gi, validator: (val) => val.length >= 7 },
        { id: 'CREDIT_CARD', tokenPrefix: 'CREDIT_CARD_NO', regex: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g, validator: (val) => val.replace(/\D/g, '').length >= 15 }, // 新增: PCI-DSS
        { id: 'BANK_ACCOUNT', tokenPrefix: 'BANK_ACCOUNT_NO', regex: /\b\d{8,14}\b/g, validator: (val) => val.replace(/\D/g, '').length >= 8 },
        { id: 'SWIFT_CODE', tokenPrefix: 'SWIFT_BIC', regex: /\b[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g, validator: (val) => val.length >= 8 }, // 新增: 國際金融
        { id: 'IP_ADDRESS', tokenPrefix: 'IP_ADDRESS', regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g },
        { id: 'MAC_ADDRESS', tokenPrefix: 'MAC_ADDRESS', regex: /\b([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})\b/gi },
        { id: 'API_KEY', tokenPrefix: 'API_TOKEN', regex: /\b(?:sk|pk|api|token|secret)_[a-zA-Z0-9]{20,}/gi }, // 新增: DevOps 資安
        { id: 'DB_CONNECTION', tokenPrefix: 'DATABASE_DSN', regex: /(?:mongodb|mysql|postgresql|redis|jdbc):\/\/[^\s]+/gi }, // 新增: DevOps
        { id: 'INTERNAL_USERNAME', tokenPrefix: 'SYSTEM_USER_ID', regex: /\b(?:admin|user|emp|staff)[a-z0-9._]{4,16}\b/gi }, // 新增: 內部帳號
        { id: 'CONTRACT_ID', tokenPrefix: 'CONTRACT_REF_NO', regex: /[A-Z]{2,4}-?\d{4,6}-?\d{2,4}/gi },
        { id: 'CLAUSE_REF', tokenPrefix: 'CLAUSE_REF', regex: /(?:Section|Art\.|條)\s*\d+[\.\d]*/gi },
        { id: 'VEHICLE_PLATE', tokenPrefix: 'VEHICLE_LICENSE', regex: /\b[A-Z]{1,2}[\s-]?\d{1,4}[\s-]?[A-Z]?\b/g, validator: (val) => val.replace(/\s/g, '').length >= 4 }, // 新增: 車輛財產
        { id: 'PROPERTY_TITLE', tokenPrefix: 'PROPERTY_REG_NO', regex: /(?:地號|建號|土地|不動產)\s*[A-Z0-9]{4,12}/gi }, // 新增: 不動產
        { id: 'MEDICAL_RECORD', tokenPrefix: 'MEDICAL_RECORD_NO', regex: /(?:病歷|病號|MRN|健保)\s*[A-Z0-9]{6,12}/gi } // 新增: HIPAA 醫療
    ],

    // =====================================================
    // 2. 財務與商業機密 (Financial & Commercial)
    // =====================================================
    financial: [
        { id: 'SALARY_AMOUNT', tokenPrefix: 'SALARY_AMOUNT', regex: /(?:HK\$|NT\$|USD\$|\$|港幣|台幣|美元)?\s*[\d,]+(?:\.\d+)?\s*(?:萬|元|港幣|台幣|美元)?/gi, validator: (val) => /\d/.test(val) },
        { id: 'EQUITY_SHARES', tokenPrefix: 'EQUITY_SHARES', regex: /\b[\d,]+(?:\s*萬)?\s*(?:股|期權|股份|shares?)\b/gi }
    ],

    // =====================================================
    // 3. 組織與地點 (Organizations & Locations)
    // =====================================================
    organizational: [
        { id: 'COMPANY_NAME', tokenPrefix: 'ENTERPRISE_CLIENT', regex: /[\u4e00-\u9fa5a-zA-Z0-9]{2,30}(?:有限公司|股份有限公司|集團|公司|企業|中心|事務所|銀行|基金會)/g, validator: (val) => val.length >= 4 },
        { id: 'PROJECT_CODE', tokenPrefix: 'CONFIDENTIAL_PROJECT', regex: /(?:Project|計畫|計劃|專案)\s*[A-Za-z0-9\u4e00-\u9fa5]{1,15}/gi },
        { id: 'ADDRESS', tokenPrefix: 'ADDRESS_LOCATION', regex: /(?:臺北|台北|台中|台南|高雄|香港|九龍|新界|澳門|新加坡|上海|北京|深圳|廣州)[\u4e00-\u9fa50-9]{2,40}(?:路|街|巷|弄|號|樓|大道|道)/g, validator: (val) => val.length >= 6 }
    ],

    // =====================================================
    // 4. 時間與績效數據 (Time & Performance)
    // =====================================================
    temporal: [
        { id: 'BIRTH_DATE', tokenPrefix: 'DATE_OF_BIRTH', regex: /(?:出生|生日|DOB|Birth)[:\s]*(\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}日?)/gi }, // 新增: GDPR 出生日期
        { id: 'RECORD_DATE', tokenPrefix: 'RECORD_DATE', regex: /(\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}日?)/g },
        { id: 'PERFORMANCE_SCORE', tokenPrefix: 'PERFORMANCE_SCORE', regex: /\b\d+\.\d+\s*(?:分|級|等|rank)\b/gi }
    ],

    // =====================================================
    // 5. 中文語境特徵詞庫 (Contextual Cues for Chinese NLP)
    // =====================================================
    contextual: {
        titles: ['總監', '經理', '協理', '專員', '工程師', '主任', '副總', '執行長', '總經理', '處長', '課長', '組長', '顧問', '律師', '法官', '檢察官', '會計師', '分析師', '董事', '監察人', '秘書', '助理', '實習生', '員工'],
        verbs: ['約談', '指控', '發出', '簽署', '解僱', '入職', '離職', '通報', '審核', '審查', '批准', '駁回', '申訴', '調解', '出席', '缺席', '請假', '出差', '匯報', '裁決', '負責'],
        orgSuffixes: ['有限公司', '股份有限公司', '集團', '企業', '中心', '事務所', '部門', '委員會', '銀行', '基金會', '協會'],
        surnames: ['張', '李', '王', '陳', '劉', '林', '黃', '吳', '蔡', '楊', '許', '何', '郭', '高', '鄭', '謝', '蕭', '曾', '廖', '蘇', '盧', '蔣', '馬', '朱', '胡', '曹', '周', '徐', '孫', '沈', '方', '侯', '姜', '洪', '石', '譚', '歐', '莊', '鄧', '魏']
    },

    // =====================================================
    // 6. 企業自訂規則擴充區 (Custom Extension Hooks)
    // =====================================================
    custom: {
        // internalSystems: [{ pattern: /(?:SAP|ERP|HRIS|CRM|GitHub|Jira)\s*[A-Z0-9]{4,}/gi, tokenPrefix: 'INTERNAL_SYSTEM' }],
        // internalDepts: [{ pattern: /(?:法務部|合規部|稽核室|人力資源部|資訊安全室)/g, tokenPrefix: 'INTERNAL_DEPT' }]
    }
};
