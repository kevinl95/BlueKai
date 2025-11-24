# BlueKai - BlueSky Client for KaiOS

A lightweight BlueSky client optimized for KaiOS 2.5 devices.

> **TL;DR?** See [CHEATSHEET.md](CHEATSHEET.md) for quick commands.

## Quick Start

### For Browser Development (Hot Reload)
```bash
npm install
npm run dev
# Opens at http://localhost:8080
```

### For KaiOS Emulator Testing
```bash
npm install
./serve-kaios.sh
# Load in emulator: http://localhost:8080/manifest.webapp
```

That's it! Use `npm run dev` for development, `./serve-kaios.sh` for KaiOS testing.

## What Each Script Does

| Script | Use Case | What It Does |
|--------|----------|--------------|
| `npm run dev` | Browser development | Webpack dev server with hot reload |
| `npm run build` | Production build | Creates optimized bundle |
| `./serve-kaios.sh` | KaiOS emulator | Builds & serves securely for emulator |
| `./build-kaios.sh` | Manual build | Just builds to public/ (no server) |
| `./create-icons.sh` | Icon generation | Creates icons from bluekai-logo.png |

## Project Structure

```
BlueKai/
├── src/                    # Source code
│   ├── components/         # UI components
│   ├── views/              # Page views
│   ├── services/           # API clients
│   ├── utils/              # Utilities
│   ├── state/              # State management
│   └── navigation/         # Routing & navigation
├── public/                 # Built files (auto-generated)
├── dist/                   # Webpack output
├── test-*.html             # Component tests
└── manifest.webapp         # KaiOS manifest
```

## Development Workflow

1. **Make changes** to code in `src/`
2. **Test in browser**: `npm run dev`
3. **Test in KaiOS**: `./serve-kaios.sh`
4. **Build for production**: `npm run build`

## KaiOS Emulator Setup

1. Install [KaiOS Simulator](https://developer.kaiostech.com/simulator)
2. Run `./serve-kaios.sh`
3. In simulator: "Open Hosted App" → `http://localhost:8080/manifest.webapp`

## Testing

```bash
# Run all tests
npm test

# Test specific component
open test-timeline.html
open test-compose-view.html
open test-post-detail.html
```

## Documentation

- **Component Docs**: See `src/*/README.md` files
- **KaiOS Setup**: See `docs/KAIOS-SETUP.md`
- **Security**: See `docs/SECURITY.md`

## Features

- ✅ Login with BlueSky credentials
- ✅ View timeline
- ✅ View post details with replies
- ✅ Like, repost, reply to posts
- ✅ Compose new posts
- ✅ D-pad navigation
- ✅ Offline support
- ✅ Data saver mode

## Tech Stack

- **Framework**: Preact (React-like, 3KB)
- **Build**: Webpack + Babel
- **Target**: Gecko 48 (ES5)
- **Styling**: Vanilla CSS
- **API**: AT Protocol (BlueSky)

## Browser Compatibility

- KaiOS 2.5 (Gecko 48)
- Firefox 48+
- Modern browsers (for development)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in browser and KaiOS emulator
5. Submit a pull request

## License

MIT License - see LICENSE file

## Support

- **Issues**: GitHub Issues
- **Docs**: See `docs/` directory
- **KaiOS**: https://developer.kaiostech.com

---

**Quick Reference:**
- Development: `npm run dev`
- KaiOS Testing: `./serve-kaios.sh`
- Production Build: `npm run build`
