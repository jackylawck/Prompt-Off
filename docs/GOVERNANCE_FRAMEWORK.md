# 🏛️ Global Governance & Legal Framework Alignment
# 全球 AI 治理與法律框架對齊宣告

> **Document Version:** 4.3.4  
> **Target Audience:** Data Protection Officers (DPOs), Enterprise Legal Teams, AI Auditors  
> **適用對象：** 數據保護官 (DPO)、企業法務團隊、AI 治理稽核員

---

## 🌐 1. Global AI Laws & Guidelines / 全球 AI 法律與指引

### 🇪🇺 EU AI Act (歐盟 AI 法案)
* **EN:** Categorized as a **Minimal Risk / Privacy-Enhancing Tool (PET)**. Prompt Offline is NOT an AI system; it is a deterministic pre-processing boundary sandbox designed to prevent PII/SPII leakage into external High-Risk or General Purpose AI Systems (GPAI).
* **ZH:** 歸類為 **極低風險/隱私增強技術 (PET)**。本工具本身並非 AI 系統，而是一套確定性前置處理沙盒，旨在防止個人數據 (PII) 與高敏數據外洩至外部高風險或通用 AI 系統 (GPAI)。

### 🇬🇧 UK GDPR & EU GDPR (Art. 25 & Art. 32)
* **EN:** Implements **Privacy by Design and Default**. The zero-network architecture (`connect-src 'none'`) enforces technical data minimization before external processing occurs.
* **ZH:** 落實 **預設隱私設計 (Privacy by Design and Default)**。透過底層零網絡架構 (`connect-src 'none'`)，在資料發送至外部處理前完成硬性數據最小化。

### 🇭🇰 HK PCPD Guidelines (香港私隱專員公署指引)
* **EN:** Fully aligned with the PCPD’s *Guidance on the Ethical Development and Use of Artificial Intelligence*. Ensures personal data (e.g., HKID, salary, medical records) is pseudonymized prior to LLM interaction, satisfying Data Protection Principles 3 & 4 (DPP3 & DPP4).
* **ZH:** 深度對齊香港私隱專員公署《人工智能：個人資料隱私保障指引》。確保個人資料（如香港身分證、薪酬、病歷）在與 LLM 互動前完成假名化，符合保障資料原則第 3 及第 4 條 (DPP3 & DPP4)。

---

## 📜 2. International Security & AI Standards / 國際資安與 AI 標準

### 🛡️ ISO/IEC 42001:2023 (AI Management System - A.6 Data for AI Systems)
* **EN:** Fulfills organizational data governance requirements by stripping raw identifiers from AI prompts, mitigating third-party training data contamination risks.
* **ZH:** 滿足組織級 AI 數據治理要求，透過去除 AI 提示詞中的原始識別碼，降低第三方模型訓練池獲取企業機密的風險。

### 🔒 ISO/IEC 27001 & NIST AI RMF
* **EN:** Addresses the **Govern** and **Protect** functions of the NIST AI Risk Management Framework (AI RMF) by creating a deterministic, auditable boundary control for endpoint users.
* **ZH:** 對齊 NIST AI 風險管理框架的 **治理 (Govern)** 與 **保護 (Protect)** 機能，為端點使用者建立確定性且可審計的邊界管控。

---

## 📊 Summary Mapping Table / 治理對齊總表

| Framework / Standard | Classification / Role | Compliance Mechanism |
| :--- | :--- | :--- |
| **EU AI Act** | Minimal Risk / PET | Pre-processing sandbox; zero AI model risks |
| **ISO/IEC 42001** | Domain A.6 Data Governance | Data Minimization & Pseudonymization |
| **GDPR / HK PDPO** | PET / Boundary Shield | Client-side pseudonymization & RAM volatility |
| **IAPP AIGP** | Domain IV Oversight | Enforces input verification before LLM submission |
