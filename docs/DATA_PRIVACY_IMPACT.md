# 🛡️ Data Privacy Impact Assessment (DPIA) Summary
# 數據隱私影響評估 (DPIA) 概要報告

> **Document Version:** 4.3.4  
> **Privacy Assessment Status:** Zero Privacy Risk (100% Client-Side Executed)  
> **隱私評估狀態：** 零隱私風險 (100% 用戶端本地執行)

---

## 🔍 1. Data Processing Architecture / 資料處理架構

* **EN:** **Zero Cloud Transmission:** All regex matching, pseudonymization, and de-pseudonymization occur entirely within the user's local browser memory (RAM).
* **ZH:** **零雲端傳輸：** 所有正規表達式比對、假名化與反向還原，完全於使用者的本地瀏覽器記憶體 (RAM) 內完成。

---

## 🔐 2. Privacy Safeguards & Controls / 隱私防護控制項

### A. Pseudonymization Mechanism (假名化機制)
* **EN:** Replaces direct and indirect identifiers (e.g., HKID, Credit Cards, Passports, Corporate Emails) with taxonomy-preserving tokens (e.g., `[HKID_NUMBER_1]`, `[CONFIDENTIAL_AMOUNT_1]`).
* **ZH:** 將直接與間接識別碼（如香港身分證、信用卡、護照、公司電郵）替換為保持語意的分類標籤代號（如 `[HKID_NUMBER_1]`、`[CONFIDENTIAL_AMOUNT_1]`）。

### B. Session Volatility & Storage Guarantee (記憶體揮發性保證)
* **EN:** No data is written to external databases or remote servers. Mapping tables are held temporarily in volatile JavaScript memory and are **automatically wiped after 5 minutes of inactivity** or upon closing the browser tab.
* **ZH:** 無任何資料寫入外部資料庫或遠端伺服器。對照表僅暫存於揮發性 JavaScript 記憶體中，**閒置 5 分鐘自動銷毀**，或於關閉瀏覽器分頁時立即抹除。

### C. Anti-Clipboard Theft (剪貼簿防竊機制)
* **EN:** Restored real data copied to the clipboard is automatically cleared by the system after 30 seconds to prevent unauthorized endpoint clipboard reading.
* **ZH:** 複製至剪貼簿的還原真實資料，系統將於 30 秒後自動清空，防止未授權的端點剪貼簿存取。

---

## 📈 3. Risk Assessment Matrix / 風險評估矩陣

| Risk Vector (風險面向) | Mitigating Control (防護控制項) | Residual Risk (殘餘風險) |
| :--- | :--- | :--- |
| **Data Leakage to AI Cloud** | Client-side Regex Sanitization before submission | **Negligible (極低)** |
| **Data Interception in Transit** | Network isolation via W3C CSP (`connect-src 'none'`) | **Zero (無)** |
| **Unauthorized Data Retention** | RAM-only session storage; 5-min idle auto-clear | **Zero (無)** |
