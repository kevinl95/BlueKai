# BlueKai Tests

This directory contains all test files and verification scripts for the BlueKai project.

## Directory Structure

- **html/** - HTML test pages that can be opened in a browser to test individual components and features
- **scripts/** - Verification and analysis scripts (bundle size, accessibility checks, etc.)
- **runners/** - Test runner scripts that execute multiple tests

## Running Tests

### Individual Component Tests
Open any HTML file in the `html/` directory in a browser to test that specific component.

### Test Runners
Run test suites using the runner scripts:
```bash
node tests/runners/run-app-tests.js
node tests/runners/run-component-tests.js
node tests/runners/run-accessibility-tests.js
# ... etc
```

### Verification Scripts
Run verification scripts to check build quality:
```bash
node tests/scripts/verify-production-build.js
node tests/scripts/check-bundle-size.js
node tests/scripts/verify-accessibility.js
# ... etc
```

## Test Categories

- **Accessibility** - ARIA compliance, keyboard navigation, screen reader support
- **Components** - UI component functionality and rendering
- **E2E** - End-to-end integration tests
- **i18n** - Internationalization and translation tests
- **Navigation** - Router and navigation manager tests
- **Offline** - Offline functionality and service worker tests
- **Performance** - Memory usage and performance benchmarks
- **State** - State management and session handling tests

## Notes

- Unit tests (`.test.js` files) are located alongside their source files in `src/`
- These HTML and runner files are for manual testing and verification
- For automated testing, see the test scripts in `package.json`
