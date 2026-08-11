# 🔒 Security Policy & Vulnerability Disclosure
# 資安政策與漏洞通報機制

> **Last Updated:** August 2026  
> **Project:** Prompt Offline (離線淨言)

---

## 🛡️ Security Architecture & Warranties / 資安架構保證

1. **Zero Outbound Connections:** Prompt Offline is deployed with W3C Content Security Policy rules that prohibit all network activity (`connect-src 'none'`).
2. **No Data Persistence:** No input data, sanitized text, or mapping tables are ever persisted to LocalStorage, IndexedDB, or external servers.
3. **100% Client-Side Execution:** The application can be executed in an Air-Gapped (physically isolated) environment or in Airplane Mode.

---

## 🐛 Reporting a Vulnerability / 通報資安漏洞

If you discover a Regular Expression bypass, a PII leak scenario, or a Content Security Policy issue, please report it via GitHub Issues or contact the maintainer directly.

* **GitHub Repository:** [https://github.com/jackylawck/Prompt-Off](https://github.com/jackylawck/Prompt-Off)
* **Maintainer:** Jacky Law (羅子淇)
* **Personal Site:** [https://jackylawck.github.io/jackylawck/](https://jackylawck.github.io/jackylawck/)

Thank you for helping keep LLM user interactions safe and privacy-compliant!
