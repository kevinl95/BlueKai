/**
 * E2E Test Exports
 * Minimal exports for end-to-end integration tests
 * Does not include UI components, only core logic
 */

// Import core utilities and services (no Preact dependencies)
import StorageManager from './utils/storage';
import CacheManager from './utils/cache-manager';
import { SessionManager } from './state/session-manager';
import ATPClient from './services/atp-client';
import TextProcessor from './utils/text-processor';
import { retryWithBackoff } from './utils/retry-handler';
import networkStatus from './utils/network-status';

// Import state management (reducer and actions only, no context)
import reducer from './state/reducer';
import * as actions from './state/actions';

// Create a simple RetryHandler wrapper for tests
class RetryHandler {
  retry(fn, options) {
    return retryWithBackoff(fn, options);
  }
}

// Expose to window for E2E testing
window.BlueKaiExports = {
  StorageManager: StorageManager,
  CacheManager: CacheManager,
  SessionManager: SessionManager,
  ATPClient: ATPClient,
  TextProcessor: TextProcessor,
  RetryHandler: RetryHandler,
  NetworkStatus: networkStatus,
  reducer: reducer,
  actions: actions
};
