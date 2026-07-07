"""Project permission gate — one class, env + author secret file, optional enforce."""
from __future__ import annotations

import hmac
import os
import secrets
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass(frozen=True)
class GateStatus:
    enforced: bool
    unlocked: bool
    reason: str
    key_source: str = ""
    project: str = ""
    author: str = ""


class PermissionGate:
    """
    Dev/author gate: without the key, stack processes refuse to start.

    Key locations (first match wins):
      1. GATEOPEN_PERMISSION_KEY env
      2. ~/.zsh/secrets/gateopen/{project}.permission
      3. ~/.gateopen/keys/{author}-{project}.key

    Skip enforce: GATEOPEN_PERMISSION_SKIP=1 (CI only).
    """

    ENV_KEY = "GATEOPEN_PERMISSION_KEY"
    ENV_SKIP = "GATEOPEN_PERMISSION_SKIP"
    ENV_AUTHOR = "GATEOPEN_AUTHOR"
    ENV_PROJECT = "GATEOPEN_PROJECT"

    def __init__(self, root: Path | None = None, *, project: str = "", author: str = "") -> None:
        self.root = Path(root).resolve() if root else Path.cwd()
        self.project = (project or os.environ.get(self.ENV_PROJECT) or self.root.name).strip()
        self.author = (author or os.environ.get(self.ENV_AUTHOR) or "author").strip()

    def skip_enforcement(self) -> bool:
        return os.environ.get(self.ENV_SKIP, "").strip().lower() in ("1", "true", "yes", "on")

    def secret_paths(self) -> list[Path]:
        home = Path.home()
        slug = self.project.replace(" ", "-")
        author_slug = self.author.replace(" ", "-")
        return [
            home / ".zsh" / "secrets" / "gateopen" / f"{slug}.permission",
            home / ".gateopen" / "keys" / f"{author_slug}-{slug}.key",
        ]

    def env_file_path(self) -> Path:
        from gateopen.devstack.engine_paths import ensure_engine_dir, engine_dir

        ensure_engine_dir(self.root)
        return engine_dir(self.root) / ".env"

    def load_expected_key(self) -> tuple[Optional[str], str]:
        raw = os.environ.get(self.ENV_KEY, "").strip()
        if raw:
            return raw, "env"
        for path in self.secret_paths():
            if path.is_file():
                try:
                    line = path.read_text(encoding="utf-8").strip()
                except OSError:
                    continue
                if line:
                    return line, str(path)
        env_file = self.env_file_path()
        if env_file.is_file():
            for line in env_file.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line.startswith("#") or "=" not in line:
                    continue
                key, _, val = line.partition("=")
                if key.strip() == self.ENV_KEY:
                    v = val.strip().strip('"').strip("'")
                    if v:
                        return v, str(env_file)
        return None, ""

    def is_enforced(self) -> bool:
        if self.skip_enforcement():
            return False
        expected, _ = self.load_expected_key()
        return bool(expected)

    @staticmethod
    def keys_match(expected: str, supplied: str) -> bool:
        if not expected or not supplied:
            return False
        return hmac.compare_digest(expected.strip(), supplied.strip())

    def verify(self, supplied: Optional[str] = None) -> bool:
        if not self.is_enforced():
            return True
        expected, _ = self.load_expected_key()
        if not expected:
            return False
        if supplied is None:
            supplied = os.environ.get(self.ENV_KEY, "").strip()
        return self.keys_match(expected, supplied)

    def status(self, supplied: Optional[str] = None) -> GateStatus:
        if not self.is_enforced():
            return GateStatus(
                enforced=False,
                unlocked=True,
                reason="Permission gate not configured (no key file / env).",
                project=self.project,
                author=self.author,
            )
        expected, source = self.load_expected_key()
        ok = self.verify(supplied)
        if ok:
            return GateStatus(
                enforced=True,
                unlocked=True,
                reason="Permission key OK.",
                key_source=source,
                project=self.project,
                author=self.author,
            )
        if not expected:
            return GateStatus(
                enforced=True,
                unlocked=False,
                reason="Permission key missing — generate with scripts/permission-gate.py generate",
                project=self.project,
                author=self.author,
            )
        return GateStatus(
            enforced=True,
            unlocked=False,
            reason="Permission key invalid or not loaded into the environment.",
            key_source=source,
            project=self.project,
            author=self.author,
        )

    def generate_key(self) -> str:
        return secrets.token_urlsafe(32)

    def write_secret_file(self, key: str, *, path: Path | None = None) -> Path:
        target = path or self.secret_paths()[0]
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(key.strip() + "\n", encoding="utf-8")
        try:
            target.chmod(0o600)
        except OSError:
            pass
        return target

    def sync_env_file(self, key: str) -> Path:
        """Ensure `.engine/.env` contains GATEOPEN_PERMISSION_KEY (gitignored)."""
        path = self.env_file_path()
        lines: list[str] = []
        if path.is_file():
            lines = path.read_text(encoding="utf-8").splitlines()
        out: list[str] = []
        found = False
        for line in lines:
            if line.strip().startswith(f"{self.ENV_KEY}="):
                out.append(f'{self.ENV_KEY}="{key.strip()}"')
                found = True
            else:
                out.append(line)
        if not found:
            if out and out[-1].strip():
                out.append("")
            out.append(f"# GateOpen permission (author dev gate — do not commit)")
            out.append(f'{self.ENV_KEY}="{key.strip()}"')
        path.write_text("\n".join(out).rstrip() + "\n", encoding="utf-8")
        try:
            path.chmod(0o600)
        except OSError:
            pass
        return path

    def require_unlocked(self) -> None:
        st = self.status()
        if st.unlocked:
            return
        raise RuntimeError(st.reason)
