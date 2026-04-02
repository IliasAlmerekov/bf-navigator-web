#!/usr/bin/env bash
# Claude Code PreToolUse hook — blocks dangerous shell commands.
# Reads hook JSON from stdin, outputs {"continue": false, "stopReason": "..."} to block.

set -euo pipefail

INPUT=$(cat)
COMMAND=$(printf '%s' "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null || true)

block() {
  printf '{"continue": false, "stopReason": "BLOCKED: %s"}\n' "$1"
  exit 0
}

# ── Destructive file removal ─────────────────────────────────────────────────
# rm -rf on root, src, dist, .git, home, or shell-expansion targets
if printf '%s' "$COMMAND" | grep -qE 'rm\s+-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r'; then
  if printf '%s' "$COMMAND" | grep -qP '(?:^|\s)(\/|~\/|\.\/src|\.\/dist|\.\/\.git|\$HOME|\$\()'; then
    block "rm -rf on a sensitive path. Run manually if intentional."
  fi
fi

# ── Git: force push to protected branches ────────────────────────────────────
if printf '%s' "$COMMAND" | grep -qE 'git\s+push.*(--force|-f\b)'; then
  if printf '%s' "$COMMAND" | grep -qE '(main|master)'; then
    block "Force push to main/master is prohibited."
  fi
fi

# ── Git: hard reset (destroys uncommitted work) ──────────────────────────────
if printf '%s' "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
  block "git reset --hard can destroy uncommitted work. Run manually if intentional."
fi

# ── Git: clean untracked files ───────────────────────────────────────────────
if printf '%s' "$COMMAND" | grep -qE 'git\s+clean\s+[^#]*-f'; then
  block "git clean -f deletes untracked files. Run manually if intentional."
fi

# ── Git: broad discard of working tree ───────────────────────────────────────
if printf '%s' "$COMMAND" | grep -qE 'git\s+(checkout|restore)\s+\.\s*$'; then
  block "git checkout . / git restore . discards all unstaged changes. Run manually."
fi

# ── Git: delete main/master branch ───────────────────────────────────────────
if printf '%s' "$COMMAND" | grep -qE 'git\s+branch\s+-D\s+(main|master)\b'; then
  block "Deleting the main or master branch is prohibited."
fi

# ── npm/yarn/pnpm publish ────────────────────────────────────────────────────
if printf '%s' "$COMMAND" | grep -qE '(npm|yarn|pnpm)\s+publish(\s|$)'; then
  block "Publishing to npm registry requires explicit user approval. Run manually."
fi

# ── Auto-generated file: routeTree.gen.ts ────────────────────────────────────
if printf '%s' "$COMMAND" | grep -qE '(>|tee)\s+.*routeTree\.gen\.ts'; then
  block "routeTree.gen.ts is auto-generated — do not write to it directly."
fi

# ── Overly permissive chmod ───────────────────────────────────────────────────
if printf '%s' "$COMMAND" | grep -qE 'chmod\s+(777|a\+rwx)'; then
  block "chmod 777 / a+rwx is a security risk. Use more restrictive permissions."
fi

# Allow — exit 0 with no output means the command is permitted
exit 0
