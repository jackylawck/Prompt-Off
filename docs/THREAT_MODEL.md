# 🛡️ Endpoint Threat Model & Boundary Defenses
# 端點威脅模型與邊界防禦說明

> **Document Version:** 4.3.4  
> **Framework:** STRIDE-aligned Endpoint Threat Analysis  
> **架構：** 對齊 STRIDE 之端點威脅分析

---

## 🎯 1. Security Boundaries / 防禦邊界

* **In-Scope (防禦範圍):** Accidental paste of PII/SPII into commercial AI prompts; clipboard data lingering; unencrypted transit of corporate secrets via browser endpoints.
* **Out-of-Scope (非防禦範圍):** Compromised operating system malware (Keyloggers); physical screen shoulder surfing.

---

## 🔬 2. STRIDE Threat Analysis & Mitigations / 威脅與緩和措施

### 1. Information Disclosure (資訊外洩)
* **Threat:** User accidentally sends raw employee salary or HKID to third-party LLMs.
* **Mitigation:** Local regex engine sanitizes PII into taxonomy tokens (`[CONFIDENTIAL_AMOUNT_1]`) before user copies data to external platforms.

### 2. Tampering & Interception (數據竄改與攔截)
* **Threat:** Malicious browser extensions or MITM scripts intercept prompt data during transmission.
* **Mitigation:** Strict W3C Content Security Policy (`connect-src 'none'`) blocks any browser network requests originating from this page.

### 3. Denial of Service / Memory Bloat (效能與記憶體耗盡)
* **Threat:** Large input text causes browser freeze (OOM).
* **Mitigation:** Lightweight regular expression matching replaces heavy LLM/Wasm models, consuming < 1MB RAM for standard processing.
