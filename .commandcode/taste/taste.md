# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# backend
- Use Bun's built-in SQLite (bun:sqlite) instead of better-sqlite3. Confidence: 0.65
- When using bun:sqlite, suppress TypeScript module errors with `// @ts-expect-error Bun runtime provides this module.` above the import. Confidence: 0.60

# docs
- Write concise API docs mapping endpoint paths to their shared Zod schemas (e.g. "POST /api/auth/signin - SignInSchema"). Confidence: 0.70
