<div align="center">
  <img src="bluekai-logo.png" alt="BlueKai Logo" width="120" />
  <h1>BlueKai</h1>
  <p>A lightweight BlueSky client optimized for KaiOS 2.5 and newer devices</p>
</div>

---

## Quick Start

See [CHEATSHEET.md](CHEATSHEET.md) for quick reference commands.

### Browser Development
```bash
npm install
npm run dev
# Opens at http://localhost:8080
```


## Features

- Login with BlueSky credentials
- View timeline with infinite scroll
- View post details with threaded replies
- Like, repost, and reply to posts
- Compose new posts with character counter
- D-pad navigation optimized for KaiOS
- Offline support with service worker
- Data saver mode for limited bandwidth
- Internationalization (English, Spanish, French, Portuguese)
- Accessibility features (ARIA labels, keyboard navigation)

## Project Structure

```
BlueKai/
├── src/                    # Source code
│   ├── components/         # UI components
│   ├── views/              # Page views
│   ├── services/           # API clients
│   ├── utils/              # Utilities
│   ├── state/              # State management
│   ├── navigation/         # Routing & navigation
│   ├── i18n/               # Internationalization
│   └── styles/             # CSS styles
├── tests/                  # Test files
│   ├── html/               # HTML test pages
│   ├── scripts/            # Verification scripts
│   └── runners/            # Test runners
├── scripts/                # Build & deployment scripts
├── docs/                   # Documentation
├── public/                 # Built files (auto-generated)
├── dist/                   # Webpack output
└── manifest.webapp         # KaiOS manifest
```

## Development Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm test` | Run test suite |
| `./scripts/serve-kaios.sh` | Build and serve for KaiOS emulator |
| `./scripts/build-kaios.sh` | Build for KaiOS without starting server |
| `./scripts/create-icons.sh` | Generate app icons from logo |

## Testing

### Unit Tests
Unit tests are located alongside source files with `.test.js` extension.

```bash
npm test
```

### Component Tests
Open HTML test files in a browser:

```bash
# Individual component tests
open tests/html/test-timeline.html
open tests/html/test-compose-view.html
open tests/html/test-post-detail.html
```

### Test Runners
Run test suites programmatically:

```bash
node tests/runners/run-app-tests.js
node tests/runners/run-component-tests.js
node tests/runners/run-accessibility-tests.js
```


## Tech Stack

- **Framework**: Preact (React-like, 3KB)
- **Build Tool**: Webpack + Babel
- **Target**: Gecko 48 (ES5 transpiled)
- **Styling**: Vanilla CSS
- **API**: AT Protocol (BlueSky)
- **State Management**: Custom Redux-like implementation
- **Routing**: Custom hash-based router

## Browser Compatibility

- KaiOS 2.5 (Gecko 48) and newer
- Firefox 48+

## Documentation

- [CHEATSHEET.md](CHEATSHEET.md) - Quick reference guide
- [docs/OFFLINE-SUPPORT-GUIDE.md](docs/OFFLINE-SUPPORT-GUIDE.md) - Offline functionality guide
- [tests/README.md](tests/README.md) - Testing documentation

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
