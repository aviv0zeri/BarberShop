# gateopen/

Shared **Python library** for the beta product stack (not a runnable app).

| Module | Purpose |
|--------|---------|
| **`crypto/`** | Field-level encryption (Fernet) for contacts/guest data |
| **`logging/`** | Mongo activity + error logging helpers |
| **`tenants/`** | Tenant Twilio credential storage helpers |
| **`version.py`** | Read `versiontime/version.json` from Python |

Imported by **`beta/api/mobile-api`**, **`beta/api/gateway`**, and Docker builds (`COPY beta/gateopen` in Dockerfiles).

Named after the project — it is **not** the repo root; it lives under **`beta/`** because it belongs to the product stack, not author tooling.
