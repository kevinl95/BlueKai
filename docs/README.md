# BlueKai Documentation

## Getting Started

- **[Quick Start](../README.md)** - Main README with quick start guide
- **[KaiOS Setup](KAIOS-EMULATOR-SETUP.md)** - Detailed KaiOS emulator setup
- **[Icon Setup](ICON-SETUP.md)** - How to generate app icons

## Development

- **[Running the App](../RUNNING-THE-APP.md)** - How to run and test the app
- **[Security](SECURITY-KAIOS-SETUP.md)** - Security best practices

## Component Documentation

- **[Components](../src/components/README.md)** - UI components
- **[Views](../src/views/README.md)** - Page views
- **[Services](../src/services/README.md)** - API clients
- **[Utils](../src/utils/README.md)** - Utility functions
- **[State](../src/state/README.md)** - State management
- **[Navigation](../src/navigation/README.md)** - Routing

## Troubleshooting

### "Cannot GET /manifest.webapp"
Use `./serve-kaios.sh` instead of `npm run dev` for KaiOS testing.

### Icons not showing
Run `./create-icons.sh` to generate icons from your logo.

### Build fails
```bash
rm -rf node_modules dist public
npm install
npm run build
```

## Quick Commands

```bash
# Development
npm run dev                 # Browser development with hot reload

# KaiOS Testing  
./serve-kaios.sh           # Build and serve for KaiOS emulator

# Production
npm run build              # Build for production

# Icons
./create-icons.sh          # Generate icons from bluekai-logo.png
```

## File Organization

```
BlueKai/
├── docs/                  # Documentation (you are here)
├── src/                   # Source code
├── public/                # Built files for serving
├── dist/                  # Webpack output
├── test-*.html            # Component tests
├── *.sh                   # Build/serve scripts
└── manifest.webapp        # KaiOS app manifest
```

## Need Help?

1. Check the [main README](../README.md)
2. Look at component-specific READMEs in `src/*/README.md`
3. Check the troubleshooting section above
4. Review the detailed guides in this directory
