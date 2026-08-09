# 🛡️ Prompt Offline (離線淨言)

**淨言在手，輸入無憂 | Purify at Hand, Prompt with Peace.**

[![Zero Cloud](https://img.shields.io/badge/Architecture-Zero%20Cloud-blue.svg)](#)
[![Client Side](https://img.shields.io/badge/Processing-100%25%20Local-success.svg)](#)
[![No AI Model](https://img.shields.io/badge/Engine-100%25%20Rule--Based%20(No%20AI)-green.svg)](#)
[![Compliance](https://img.shields.io/badge/Compliance-ISO%2042001%20%7C%20AIGP-orange.svg)](#)

**Prompt Offline (離線淨言)** 是一款專為企業 HR、法務與高階主管設計的 **純本地端提示詞脫敏與反向還原沙盒（Local Prompt Sanitizer & Vault）**。

> ⚠️ **資安聲明：** 本工具本身 **100% 不包含任何 AI 演算法或雲端模型**。它是一套純前端執行的硬性規則引擎（RegEx），確保敏感數據在發送給外部商業 AI（如 ChatGPT、Claude、Copilot）之前，於使用者終端被截斷與假名化。

---

## 🏗️ 架構設計: Knowledge-Engine Decoupling (知識與引擎解耦)

為了達成極致的資安與企業客製化需求，我們採用了解耦架構：
*   **`engine.js` (引擎層):** 純函式邏輯，處理比對、假名化與還原。零外部依賴、無狀態，保證運算透明可審計。
*   **`rules.js` (知識層):** 獨立抽離所有的 PII 特徵庫。企業可隨時擴充自定義的**機密專案代號**或**內部術語**，無需修改核心引擎。

### 🧠 語意保留標籤 (Context-Preserving Tokens)
棄用會破壞 LLM 推理能力的抽象代號（如 `[Amount_1]`），全面升級為語意標籤（如 `[MONTHLY_SALARY_AMOUNT_1]`、`[CONFIDENTIAL_PROJECT_CODE_A]`），大幅減少外部 AI 的推理幻覺 (Hallucination)。

---

## 🌟 核心治理亮點 (Governance & Compliance)

本專案深度對齊全球 AI 治理標準與隱私法規：
- **ISO/IEC 42001 (Domain A.6):** 落實數據最小化（Data Minimization），確保模型訓練池無法獲取企業真實機密。
- **IAPP AIGP (Domain IV):** 建立強大的輸入驗證（Input Verification）防護網，阻斷資料外洩。
- **HK PDPO (DPP3 & DPP4):** 確保個人資料在傳送予第三方前已被妥善假名化（Pseudonymization）。

---

## 🔐 Zero-Trust 技術架構 (Security by Design)

- **物理級網絡隔離：** 內建極嚴格 CSP (`connect-src 'none'`)，封殺所有外部連線，保證數據 **「零上載、零傳輸」**。
- **記憶體揮發性存儲：** 對照表（Mapping Table）僅存於 RAM。支援 **閒置 5 分鐘自動清空** 及 **分頁關閉即銷毀** (Session Volatility)。
- **反竊取機制：** 剪貼簿資料於複製後 **30 秒自動抹除**。
- **PWA 斷網可用：** 支援 Service Worker，可於飛航模式下完美執行。

---

## 🌐 關於 The Offline Suite
**The Offline Suite** 是由 [Jacky Law](https://github.com/jackylawck) 開發的純本地端生產力與資安工具矩陣。
*   [🔒 Safe Offline (離線守密)](https://jackylawck.github.io/Safe-Off/)
*   [🛡️ Prompt Offline (離線淨言)](https://jackylawck.github.io/Prompt-Off/)
*   [📅 Daily Offline (離線日注)](https://jackylawck.github.io/Daily-Off/)
*   [🧮 Calculator Offline (離線算籌)](https://jackylawck.github.io/Calc-Off/)
