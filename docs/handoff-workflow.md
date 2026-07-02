# Handoff workflow

How client design bundles fit the setupp application layout.

## Roles

| Folder | Owner | Mutable? |
|--------|-------|----------|
| `handoff/` | Client / stakeholder | **No** — import-only |
| `beta/apps/<App>/front/` | You | Yes — product code |
| `docs/handoff-study.md` | You | Yes — port plan |
| `alpha/` | You | Yes — spikes |

## Commands

```bash
setupp handoff import <zip|dir> [--client NAME] [--tool TOOL] [--force]
setupp handoff status
setupp handoff doc [--force]
setupp handoff rules
```

## Typical flow

1. `setupp application MyApp`
2. `cd MyApp && mobilize init MyApp`
3. Client sends zip → `setupp handoff import …`
4. Read `handoff/README.md` + `docs/handoff-study.md`
5. Port screens into `beta/apps/MyApp/front/src/`
6. `versiontime update` when a milestone ships

## Cursor rules

`handoff-guardrails.mdc` is applied automatically on scaffold and import. It blocks agents from modifying `handoff/`.

## Re-import

When the client sends an updated bundle:

```bash
setupp handoff import ~/Downloads/v2.zip --force --client "Same client"
```

Then diff mentally against your port progress — handoff is the new spec, not a merge target.
