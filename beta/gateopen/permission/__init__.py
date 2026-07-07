"""Author permission gate — dev stack unlock (env + ~/.zsh/secrets, not Mongo)."""
from gateopen.permission.gate import GateStatus, PermissionGate

__all__ = ["GateStatus", "PermissionGate"]
