"""RPTX engine — gitignored `.engine/` paths for tool-derived local state."""
from __future__ import annotations

from pathlib import Path

ENGINE_DIR_NAME = ".engine"


def engine_dir(root: Path) -> Path:
    return Path(root).resolve() / ENGINE_DIR_NAME


def ensure_engine_dir(root: Path) -> Path:
    path = engine_dir(root)
    path.mkdir(parents=True, exist_ok=True)
    return path


def prompter_dir(root: Path, *, create: bool = False) -> Path:
    path = engine_dir(root) / "prompter"
    legacy = Path(root).resolve() / ".prompter"
    if create:
        path.mkdir(parents=True, exist_ok=True)
        return path
    if path.is_dir() or not legacy.is_dir():
        return path
    return legacy


def gateopen_dev_dir(root: Path, *, create: bool = False) -> Path:
    path = engine_dir(root) / "gateopen-dev"
    legacy = Path(root).resolve() / ".gateopen-dev"
    if create:
        path.mkdir(parents=True, exist_ok=True)
        return path
    if path.is_dir() or not legacy.is_dir():
        return path
    return legacy


def prompter_logs_dir(root: Path, *, create: bool = False) -> Path:
    """Author session logs — repo-root ``prompter_logs/`` (gitignored)."""
    path = Path(root).resolve() / "prompter_logs"
    if create:
        path.mkdir(parents=True, exist_ok=True)
    return path


def env_file(root: Path) -> Path:
    """Author permission + optional overrides (was repo-root `.env`)."""
    new = engine_dir(root) / ".env"
    legacy = Path(root).resolve() / ".env"
    if new.is_file() or not legacy.is_file():
        return new
    return legacy


def env_local_file(root: Path) -> Path:
    """Generated effective dev env (sync-dev-env.py)."""
    return engine_dir(root) / "env.local"


def runtime_errors_file(root: Path) -> Path:
    new = engine_dir(root) / "runtimeErrors"
    legacy = Path(root).resolve() / "runtimeErrors"
    if new.is_file() or not legacy.is_file():
        return new
    return legacy


def runtime_errors_jsonl(root: Path) -> Path:
    return prompter_dir(root, create=False) / "runtime-errors.jsonl"


def logs_jsonl(root: Path) -> Path:
    return prompter_dir(root, create=False) / "logs.jsonl"


def timings_json(root: Path) -> Path:
    return prompter_dir(root, create=False) / "timings.json"


def doctor_pass_json(root: Path) -> Path:
    return prompter_dir(root, create=False) / "doctor-pass.json"


def release_applied_json(root: Path) -> Path:
    return prompter_dir(root, create=False) / "release-applied.json"


def permission_session_file(root: Path) -> Path:
    return prompter_dir(root, create=False) / "permission-session"


def ports_json(root: Path) -> Path:
    return gateopen_dev_dir(root) / "ports.json"


def metro_port_file(root: Path) -> Path:
    return gateopen_dev_dir(root) / "metro.port"


def execute_dir(root: Path, *, create: bool = False) -> Path:
    path = engine_dir(root) / "execute"
    legacy = Path(root).resolve() / "execute"
    if create:
        path.mkdir(parents=True, exist_ok=True)
        return path
    if path.is_dir() or not legacy.is_dir():
        return path
    return legacy


def execute_platform_dir(root: Path, platform: str, *, create: bool = False) -> Path:
    """Author USB scripts — `.engine/execute/iphone` or `android`."""
    base = execute_dir(root, create=create)
    path = base / platform
    legacy = Path(root).resolve() / "execute" / platform
    if create:
        path.mkdir(parents=True, exist_ok=True)
        return path
    if path.is_dir() or not legacy.is_dir():
        return path
    return legacy


def sandboxer_config_file(root: Path) -> Path:
    """Project menu config — `.engine/sandboxer.config.json` (legacy: repo root)."""
    new = engine_dir(root) / "sandboxer.config.json"
    legacy = Path(root).resolve() / "sandboxer.config.json"
    if new.is_file() or not legacy.is_file():
        return new
    return legacy


def sandboxer_config_write_path(root: Path) -> Path:
    """Canonical path for mobilize / ensure (always under `.engine/`)."""
    ensure_engine_dir(root)
    return engine_dir(root) / "sandboxer.config.json"


def prompter_script(root: Path) -> Path:
    """Project prompter menu launcher — `.engine/prompter-menu` (legacy: repo-root `./prompter`)."""
    new = engine_dir(root) / "prompter-menu"
    legacy = Path(root).resolve() / "prompter"
    if new.is_file() or not legacy.is_file():
        return new
    return legacy


def prompter_script_write_path(root: Path) -> Path:
    """Canonical path for prompter init / install (always under `.engine/`)."""
    ensure_engine_dir(root)
    return engine_dir(root) / "prompter-menu"


def sandboxer_script(root: Path) -> Path:
    """Project sandbox launcher — `.engine/sandboxer` (legacy: repo-root `./sandboxer`)."""
    new = engine_dir(root) / "sandboxer"
    legacy = Path(root).resolve() / "sandboxer"
    if new.is_file() or not legacy.is_file():
        return new
    return legacy


def sandboxer_script_write_path(root: Path) -> Path:
    """Canonical path for sandboxer init / install (always under `.engine/`)."""
    ensure_engine_dir(root)
    return engine_dir(root) / "sandboxer"
