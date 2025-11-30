# BlueKai Cheat Sheet

## I want to...

### ...develop in my browser
```bash
npm run dev
```
Opens at http://localhost:8080 with hot reload.

### ...build for production
```bash
npm run build
```
Output in `dist/` directory.


### ...run tests
```bash
# Open in browser:
open tests/html/test-timeline.html
open tests/html/test-compose-view.html
open tests/html/test-post-detail.html

# Or run test suites:
node tests/runners/run-app-tests.js
node tests/runners/run-component-tests.js
```

## Common Issues

| Problem | Solution |
|---------|----------|
| "Cannot GET /manifest.webapp" | Use `./scripts/serve-kaios.sh` not `npm run dev` |
| Icons not showing | Run `./scripts/create-icons.sh` |
| Build fails | `rm -rf node_modules && npm install` |
| Hot reload not working | Use `npm run dev` not `./scripts/serve-kaios.sh` |

## File Locations

| What | Where |
|------|-------|
| Source code | `src/` |
| Components | `src/components/` |
| Views | `src/views/` |
| Tests | `tests/html/` |
| Test runners | `tests/runners/` |
| Build scripts | `scripts/` |
| Built
## Scripts Explained

| Script | When to Use |
|--------|-------------|
| `npm  app | `public/` (for KaiOS) or `dist/` (for webpack) |
| Documentation | `docs/` |

## Scripts Explained

| Script | When to Use |
|--------|-------------|
| `npm run dev` | Daily development in browser |
| `./scripts/serve-kaios.sh` | Testing in KaiOS emulator |
| `npm run build` | Before deploying to production |
| `./scripts/build-kaios.sh` | Manual build without starting server |
| `./scripts/create-icons.sh` | After changing logo |