// rules.js - Prompt Offline Knowledge Base & Dictionary
// 獨立維持所有特徵庫，核心 Engine 保持清潔

const PROMPT_OFFLINE_RULES = {
    // 1. 高優先級結構化 PII (High Confidence RegEx)
    structured: [
        {
            id: 'EMAIL',
            tokenPrefix: 'CORPORATE_EMAIL',
            regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
        },
        {
            id: 'PHONE',
            tokenPrefix: 'PHONE_NUMBER',
            regex: /(?:\(?\+?\d{1,3}\)?[\s-]?)?\d{4}[\s-]?\d{3,4}[\s-]?\d{0,4}/g,
            validator: (val) => val.replace(/\D/g, '').length >= 8
        },
        {
            id: 'HKID',
            tokenPrefix: 'HKID_NUMBER',
            regex: /[A-Za-z]{1,2}\d{6}[\(\)\d][\dA]?/g
        },
        {
            id: 'CONTRACT_ID',
            tokenPrefix: 'CONTRACT_REF_NO',
            regex: /[A-Z]{2,4}-?\d{4,6}-?\d{2,4}/g
        },
        {
            id: 'DATE',
            tokenPrefix: 'RECORD_DATE',
            regex: /(\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2}日?)/g
        }
    ],

    // 2. 上下文語意特徵詞庫 (Contextual Cues for Chinese PII)
    contextual: {
        titles: ['總監', '經理', '協理', '專員', '工程師', '主任', '副總', '執行長', '顧問', '律師', '法官'],
        verbs: ['約談', '指控', '發出', '簽署', '解僱', '入職', '離職', '通報', '審核', '審查'],
        orgSuffixes: ['有限公司', '股份有限公司', '集團', '企業', '中心', '事務所', '部門', '委員會'],
        currencies: ['HK$', 'NT$', 'USD$', '$', '港幣', '台幣', '美元', '萬元', '元']
    },

    // 3. 自訂企業機密詞典 (Custom Enterprise Keywords - 可由用戶擴充)
    customKeywords: [
        { pattern: /(?:Project|計畫|計劃|專案)\s*[A-Za-z0-9\u4e00-\u9fa5]+/gi, tokenPrefix: 'PROJECT_CODE' }
    ]
};
