# ⚙️ System Architecture & Deterministic Engine Guarantee
# 系統架構與確定性引擎宣告 (No-AI Model Guarantee)

> **Document Version:** 4.3.4  
> **Engine Type:** Deterministic Rule-Based Engine (Zero AI Model / Zero Hallucination)  
> **引擎類型：** 確定性規則引擎 (無 AI 模型 / 零 AI 幻覺)

---

## 🧩 1. Architecture Overview / 架構概觀

```text
+-----------------------------------------------------------------------+
|                       Client Browser Sandbox                          |
|                                                                       |
|  [ Raw Text ] ---> ( engine.js ) <---> [ rules.js (Regex / Context) ]  |
|                         |                                             |
|                         v                                             |
|             [ Sanitized Output & In-Memory RAM Mapping ]              |
+-----------------------------------------------------------------------+
                                  |
                                  X (Blocked by CSP: connect-src 'none')
                                  |
                           [ External Cloud ]

```

---

## 🛡️ 2. "No AI Model" Guarantee / 無 AI 模型確定性宣告

* **EN:** **Deterministic & Auditable:** Prompt Offline contains NO probabilistic Machine Learning or AI models. It runs purely on a deterministic JavaScript engine utilizing Regular Expressions, double Lookarounds (Lookahead & Lookbehind), and algorithmic validators (e.g., Luhn Algorithm for Credit Cards, Modulus Check for Government IDs).
* **ZH:** **確定性與可審計性：** 本工具不包含任何機率型機器學習或 AI 模型。它完全由確定性 JavaScript 引擎驅動，採用正規表達式、雙向 Lookaround (Lookahead/Lookbehind) 語意邊界與演算法校驗器（如信用卡的 Luhn 演算法、證件號碼模數校驗）。

### Key Governance Advantages / 核心治理優勢：

1. **Zero Hallucination (零 AI 幻覺):** Sanitization logic produces 100% predictable, reproducible results.
2. **Zero Latency (零延遲):** Processed instantaneously without ONNX/Wasm model initialization delays.
3. **Fully Auditable Codebase (100% 可審計):** Security officers can inspect every line of regex rule in `rules.js`.

---

## 📦 3. Knowledge-Engine Decoupling / 知識與引擎解耦

* **`engine.js`:** Pure, stateless processing logic for matching, tokenization, and restoration.
* **`rules.js`:** Independent PII pattern library covering 25+ categories, Cantonese passive-voice boundary guards, and JSON enterprise rule import/export capabilities.

```

```
