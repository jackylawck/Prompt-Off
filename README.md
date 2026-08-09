# 🛡️ Prompt Offline (離線淨言)

**淨言在手，輸入無憂 | Purify at Hand, Prompt with Peace.**

[![Zero Cloud](https://img.shields.io/badge/Architecture-Zero%20Cloud-blue.svg)](#)
[![Client Side](https://img.shields.io/badge/Processing-100%25%20Local-success.svg)](#)
[![No AI Model](https://img.shields.io/badge/Engine-100%25%20Rule--Based%20(No%20AI)-green.svg)](#)
[![Compliance](https://img.shields.io/badge/Compliance-ISO%2042001%20%7C%20AIGP-orange.svg)](#)

**Prompt Offline (離線淨言)** 是一款專為企業 HR、法務與高階主管設計的 **純本地端提示詞脫敏與反向還原沙盒（Local Prompt Sanitizer & Vault）**。

> ⚠️ **資安聲明：** 本工具本身 **100% 不包含任何 AI 演算法或雲端模型**。它是一套純前端執行的硬性規則引擎，確保敏感數據在發送給外部商業 AI（如 ChatGPT、Claude、Copilot）之前，於使用者終端被硬性截斷與假名化。

---

## 🏗️ 架構設計: Knowledge-Engine Decoupling (知識與引擎解耦)

為了達成極致的資安與企業客製化需求，我們採用了 **Knowledge-Engine Decoupling** 架構：


Prompt-Off/
├── index.html          # UI 層與事件綁定 (瘦身至極簡)
├── engine.js           # 核心引擎層 (純無狀態邏輯，零外部依賴)
├── rules.js            # 企業級知識庫 v2.0 (15+ 種 PII 規則與語意標籤)
├── i18n/               # 語言資源檔 (獨立擴充)
│   ├── zh-HK.js        # 繁體中文語言包
│   └── en.js           # 英文語言包
├── manifest.json       # PWA 清單
└── sw.js               # Service Worker 快取引擎

* **`engine.js` (引擎層):** 純函式邏輯，處理比對、假名化與還原。零外部依賴、無狀態，保證運算透明可審計。
* **`rules.js` (知識層):** 獨立抽離所有的 PII 特徵庫。企業可隨時擴充自定義的機密專案代號或內部術語，無需修改核心引擎。

### 🧠 語意保留標籤 (Context-Preserving Tokens)
棄用會破壞 LLM 推理能力的抽象代號（如 `[Amount_1]`），全面升級為分類標籤（Taxonomy Tokens），包含：
- **結構化 PII:** `[CORPORATE_EMAIL_1]`, `[HKID_NUMBER_1]`, `[PASSPORT_NO_1]`, `[IP_ADDRESS_1]`, `[MAC_ADDRESS_1]`
- **財務與商業:** `[SALARY_AMOUNT_1]`, `[EQUITY_SHARES_1]`
- **組織與地點:** `[EMPLOYEE_NAME_A]`, `[ENTERPRISE_CLIENT_A]`, `[CONFIDENTIAL_PROJECT_A]`
- **時間與績效:** `[RECORD_DATE_1]`, `[PERFORMANCE_SCORE_1]`

---

## 🌍 多語言支援 (Multilingual Support)

Prompt Offline 原生支援 **繁體中文** 與 **English** 雙語介面，一鍵切換無需重啟頁面。

* **繁體中文：** 完整對應香港、台灣企業用戶的慣用語與法律術語。
* **English：** 符合國際企業（MNCs）與外商的使用習慣。

切換後，所有 UI 文字、佔位符、狀態訊息均自動轉換，**核心引擎與 PII 規則不受語言影響**，確保跨國團隊協作無縫銜接。

---

## 🌟 核心治理亮點 (Governance & Compliance)

本專案深度對齊全球 AI 治理標準與隱私法規：

* **ISO/IEC 42001 (Domain A.6 Data for AI Systems):** 落實數據最小化（Data Minimization）原則，確保訓練池或外部模型無法獲取真實的企業機密。
* **IAPP AIGP (Domain IV - Governing AI Deployment and Use):** 建立強大的輸入驗證（Input Verification）防護網，阻斷員工無意間造成的 Data Leakage。
* **HK PDPO (DPP3 & DPP4):** 確保個人資料（如 HKID、薪資）在傳送予第三方平台前已被妥善假名化（Pseudonymization）。

---

## 🔐 Zero-Trust 技術架構 (Security by Design)

* **物理級網絡隔離：** 內建極嚴格 CSP (`connect-src 'none'`)，直接由瀏覽器底層封殺所有外部連線，保證數據 **「零上載、零傳輸」**。
* **記憶體揮發性存儲：** 對照表（Mapping Table）僅存於 RAM 中。支援 **閒置 5 分鐘自動清空** 及 **分頁關閉即銷毀** (Session Volatile)。
* **反竊取機制：** 剪貼簿資料於複製後 **30 秒自動抹除**。
* **PWA 斷網可用：** 支援 Service Worker，可於飛航模式下完美執行。

---

## 🚀 核心功能與使用流程

1. **敏感數據脫敏 (Sanitize):** 貼上原始案情文本（例如含有真實姓名、HKID、月薪的 PIP 文件）。本工具於本地端自動偵測並替換為 `[EMPLOYEE_NAME_A]`、`[HKID_NUMBER_1]`、`[SALARY_AMOUNT_1]`。
2. **安心互動 (Prompting):** 將淨化後的安全 Prompt，複製並貼至外部第三方 AI 工具（如 ChatGPT）進行處理。
3. **一鍵還原真實數據 (De-pseudonymize):** 將外部 AI 回傳的處理結果貼回本工具，系統根據記憶體中的對照表，瞬間將代號還原為真實數據。

---

## 🌐 關於 The Offline Suite

**The Offline Suite** 是由 [Jacky Law](https://github.com/jackylawck) 開發的純本地端生產力與資安工具矩陣，致力於將「數據主權（Data Sovereignty）」還給使用者。

* [🔒 Safe Offline (離線守密)](https://jackylawck.github.io/Safe-Off/)
* [🛡️ Prompt Offline (離線淨言)](https://jackylawck.github.io/Prompt-Off/)
* [📅 Daily Offline (離線日注)](https://jackylawck.github.io/Daily-Off/)
* [🧮 Calculator Offline (離線算籌)](https://jackylawck.github.io/Calc-Off/)

---
*Developed with focus on Corporate AI Compliance and Privacy Engineering.*

