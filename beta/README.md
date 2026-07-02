# beta/

**Product stack** — everything that ships or runs as the product.

| Path | Role |
|------|------|
| **`apps/`** | Client apps — `apps/<Name>/front` + `back` (`mobilize init`) |
| **`api/`** | Shared API components (not called "backend") |
| **`gateopen/`** | Shared Python libs (crypto, logging) for `api/` |

**Docker:** repo root **`docker/`** (images + `components.registry.json`).

Webpages: add when **`setupp web`** exists (no `pages/` folder until then).
