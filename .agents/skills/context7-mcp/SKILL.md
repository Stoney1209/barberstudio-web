---
name: context7-mcp
description: Fetch current documentation for libraries, frameworks, or APIs using Context7 MCP. Use when the user asks about library-specific documentation, code examples, API references, or setup/configuration for any package or framework.
metadata:
  tags: documentation, libraries, API, context7, MCP
  platforms: Claude, ChatGPT, Gemini
---

# Context7 MCP

## When to use

- User asks about libraries, frameworks, API references
- Setup/configuration questions involving libraries
- Code generation involving libraries/frameworks
- Need current documentation for specific packages

## How it works

1. **Resolve library ID**: Find the library in Context7 database
2. **Query docs**: Get current documentation and examples
3. **Generate code**: Use docs to write accurate, up-to-date code

## Steps

1. Call `resolve-library-id` with the library name and the user's question
2. Pick the best match — prefer exact names and version-specific IDs when a version is mentioned
3. Call `query-docs` with the selected library ID and the user's question
4. Answer using the fetched docs — include code examples and cite the version

## Example

User: "How to configure Prisma with PostgreSQL"

Action:
1. `resolve-library-id("prisma")` → returns `/prisma/prisma`
2. `query-docs("/prisma/prisma", "configure postgresql")` → returns docs
3. Generate code using fetched documentation

## Tags
`#documentation` `#libraries` `#API` `#context7` `#MCP`