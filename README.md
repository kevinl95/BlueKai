# BlueKai

A lightweight BlueSky client for KaiOS 2.5 flip phones, built with Preact and optimized for Gecko 48 compatibility.

## Features

- Minimal bundle size (<200KB gzipped)
- D-pad navigation optimized for KaiOS
- Data-efficient design for limited data plans
- Offline support with caching
- ES5 compatible for Firefox 48/Gecko 48

## Project Structure

```
bluekai/
├── src/
│   ├── components/     # Preact UI components
│   ├── services/       # API client and business logic
│   ├── utils/          # Helper functions and utilities
│   ├── styles/         # CSS files
│   ├── index.html      # HTML template
│   └── index.js        # Application entry point
├── dist/               # Build output (generated)
├── webpack.config.js   # Webpack configuration
├── .babelrc           # Babel configuration
└── package.json       # Dependencies and scripts
```

## Development

### Prerequisites

- Node.js 14+ and npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

This starts a development server at http://localhost:8080 with hot reloading.

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Bundle Analysis

```bash
npm run build:analyze
```

This generates a production build and opens the bundle analyzer to inspect bundle size.

## Build Configuration

- **Target**: Firefox 48 (Gecko 48) for KaiOS 2.5 compatibility
- **Transpilation**: Babel with ES5 output
- **Polyfills**: Core-js for missing ES6+ features
- **Bundle Size Target**: <200KB gzipped

## Browser Compatibility

The application is specifically built for:
- KaiOS 2.5 (Gecko 48)
- Firefox 48 equivalent browsers

## License

MIT
