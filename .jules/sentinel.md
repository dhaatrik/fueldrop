## 2024-03-24 - [Insecure Predictable Identifier Generation Risk]
**Vulnerability:** Found multiple instances where sensitive identifiers (like Order IDs) were generated using predictable methods like `Date.now()` and `Math.random()`.
**Learning:** Using predictable timestamps or weak pseudo-random number generators for unique identifiers can lead to Insecure Direct Object Reference (IDOR) vulnerabilities, allowing an attacker to enumerate and access other users' orders or sensitive data by guessing IDs.
**Prevention:** Always use cryptographically secure methods like `crypto.randomUUID()` to generate unguessable, universally unique identifiers for objects, especially when they refer to sensitive entities like orders, user profiles, or secure links.
