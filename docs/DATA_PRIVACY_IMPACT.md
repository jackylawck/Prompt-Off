**核心使命：傳統法律延伸與 DPIA（數據隱私影響評估）**

> **中英文對齊要點：**
> * **GDPR Article 25 (Privacy by Design & Default)**：
> * *ZH*: **預設隱私設計**：100% Client-side 離線執行，CSP `connect-src 'none'` 底層封鎖任何雲端傳輸。
> * *EN*: **Privacy by Design**: 100% Client-side execution with strict CSP `connect-src 'none'` preventing any outbound transmissions.
> 
> 
> * **GDPR Article 4(5) & Article 32 (Pseudonymization & Security)**：
> * *ZH*: **假名化機制與記憶體揮發**：對照表（Mapping Table）僅存在於瀏覽器 RAM 記憶體中，閒置 5 分鐘自動銷毀，不存入任何硬碟或遠端資料庫。
> * *EN*: **Pseudonymization & Volatility**: Mapping tables reside strictly in RAM, auto-clearing after 5 minutes of inactivity or upon tab closure.
