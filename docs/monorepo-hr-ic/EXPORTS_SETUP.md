# `shared-types` package exports

This package compiles with `tsc` to `dist/` and exposes the root entry via `package.json` **`exports`**:

- **`.`** — main types and runtime JS for Node16 resolution (`import` / `require`).

Add subpath exports when you split domains, for example:

```json
"exports": {
  ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js", "require": "./dist/index.cjs" },
  "./users": { "types": "./dist/users/index.d.ts", "import": "./dist/users/index.js" }
}
```

Consumers use `workspace:*` in this monorepo. Build `shared-types` before packages that depend on it.
