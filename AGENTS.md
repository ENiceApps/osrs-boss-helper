<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Use graphify for any reasoning about this codebase

A graphify knowledge-graph of this project exists in `graphify-out/`. **Before** answering questions about architecture, where code lives, how files/modules relate, or the blast radius of a change — and before scoping any non-trivial edit — query the graph first via the `graphify` Skill (it is model-invoked here; the typed `/graphify` slash command does NOT work in this Claude Code). Treat codebase questions as graphify queries first, then confirm against the actual files.

**Keep the graph fresh:** it goes stale as code changes. After adding/removing/renaming files or modules, rebuild it before relying on it:
`python graphify-out/_build.py` (AST-only pipeline; skips vendored `.json` data dumps). The graphify CLI lives at `C:\Users\enune\AppData\Roaming\Python\Python314\Scripts\graphify.exe`. Outputs: `graphify-out/{graph.html, graph.json, GRAPH_REPORT.md}` (gitignored).
