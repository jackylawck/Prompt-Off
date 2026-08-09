# 🛡️ Prompt Offline (離線淨言)

**淨言在手，輸入無憂 | Purify at Hand, Prompt with Peace.**

[![Zero Cloud](https://img.shields.io/badge/Architecture-Zero%20Cloud-blue.svg)](#)
[![Client Side](https://img.shields.io/badge/Processing-100%25%20Local-success.svg)](#)
[![Compliance](https://img.shields.io/badge/Compliance-ISO%2042001%20%7C%20AIGP-orange.svg)](#)

**Prompt Offline (離線淨言)** 是一款專為企業 HR、法務與高階主管設計的 **AI 提示詞去識別化與還原沙盒**。

在企業導入 Generative AI（如 ChatGPT、Claude、Copilot）的過程中，最大的阻礙往往是對於機密數據外洩的恐懼。本工具透過 **100% 純前端運算（Client-side Processing）**，讓使用者在發送 Prompt 前，自動將敏感資訊假名化（Pseudonymization），並在獲取 AI 回覆後一鍵還原，徹底消弭合規焦慮。

---

## 🌟 核心治理亮點 (Governance & Compliance)

本專案深度對齊全球 AI 治理標準與隱私法規：

- **ISO/IEC 42001 (Domain A.6 Data for AI Systems):** 落實數據最小化（Data Minimization）原則，確保訓練池或外部模型無法獲取真實的企業機密。
- **IAPP AIGP (Domain IV - Governing AI Deployment and Use):** 建立強大的輸入驗證（Input Verification）防護網，阻斷員工無意間造成的 Data Leakage。
- **HK PDPO (DPP3 & DPP4):** 確保個人資料（如 HKID、薪資）在跨國數據傳輸（Cross-border Data Transfer）前已被妥善保護。

---

## 🔐 Zero-Trust 技術架構 (Security by Design)

- **物理級網絡隔離：** 內建極嚴格的 Content-Security-Policy（`connect-src 'none'`），直接由瀏覽器底層封殺所有外部連線，保證數據 **「零上載、零傳輸」**。
- **記憶體揮發性存儲：** 脫敏對照表（Mapping Table）僅存於 RAM 中，關閉分頁即徹底銷毀（Session Volatility），不留任何數位足跡。
- **PWA 斷網可用：** 支援 Service Worker，可安裝為桌面 / 手機 App，在飛航模式下依然能執行完整脫敏與還原。

---

## 🚀 核心功能與使用流程

1. **敏感數據脫敏 (Sanitize):** 貼上原始案情（例如含有真實姓名、HKID、月薪的 PIP 文件）。系統自動偵測並替換為 `[Employee_A]`、`[ID_1]`、`[Amount_1]`。
2. **安心互動 (Prompting):** 將淨化後的安全 Prompt 貼給外部 AI 工具進行潤飾、分析或翻譯。
3. **一鍵復原 (De-anonymize):** 將 AI 生成的結果貼回本工具，系統根據記憶體中的對照表，瞬間將代號還原為真實數據。

---

## 🌐 關於 The Offline Suite

**The Offline Suite** 是由 [Jacky Law](https://github.com/jackylawck) 開發的純本地端生產力與資安工具矩陣，致力於將「數據主權（Data Sovereignty）」還給使用者。

- [🔒 Safe Offline (離線守密)](https://jackylawck.github.io/Safe-Off/)
- [🛡️ Prompt Offline (離線淨言)](https://jackylawck.github.io/Prompt-Off/)
- [📅 Daily Offline (離線日注)](https://jackylawck.github.io/Daily-Off/)
- [🧮 Calculator Offline (離線算籌)](https://jackylawck.github.io/Calc-Off/)

---

*Developed with focus on Corporate AI Compliance and Privacy Engineering.*
