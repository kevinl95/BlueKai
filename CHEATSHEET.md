# BlueKai Cheat Sheet

## I want to...

### ...develop in my browser
```bash
npm run dev
```
Opens at http://localhost:8080 with hot reload.

### ...test in KaiOS emulator
```bash
./serve-kaios.sh
```
Then in emulator: `http://localhost:8080/manifest.webapp`

### ...build for production
```bash
npm run build
```
Output in `dist/` directory.

### ...generate icons
```bash
./create-icons.sh
```
Requires `bluekai-logo.png` in root directory.

### ...run tests
```bash
# Open in browser:
open test-timeline.html
open test-compose-view.html
open test-post-detail.html
```

## Common Issues

| Problem | Solution |
|---------|----------|
| "Cannot GET /manifest.webapp" | Use `./serve-kaios.sh` not `npm run dev` |
| Icons not showing | Run `./create-icons.sh` |
| Build fails | `rm -rf node_modules && npm install` |
| Hot reload not working | Use `npm run dev` not `./serve-kaios.sh` |

## File Locations

| What | Where |
|------|-------|
| Source code | `src/` |
| Components | `src/components/` |
| Views | `src/views/` |
| Tests | `test-*.html` |
| Built app | `public/` (for KaiOS) or `dist/` (for webpack) |
| Documentation | `docs/` |

## Scripts Explained

| Script | When to Use |
|--------|-------------|
| `npm run dev` | Daily development in browser |
| `./serve-kaios.sh` | Testing in KaiOS emulator |
| `npm run build` | Before deploying to production |
| `./build-kaios.sh` | Manual build without starting server |
| `./create-icons.sh` | After changing logo |

## That's It!

For more details, see [README.md](README.md) or [docs/](docs/)
