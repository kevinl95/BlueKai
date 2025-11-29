/**
 * Test runner for Notification components
 * Runs NotificationItem and NotificationsView tests
 */

import { runTests as runNotificationItemTests } from './src/views/NotificationItem.test.js';
import { runTests as runNotificationsViewTests } from './src/views/NotificationsView.test.js';

console.log('=================================');
console.log('Running Notification Tests');
console.log('=================================\n');

// Run NotificationItem tests
console.log('\n--- NotificationItem Tests ---\n');
var notificationItemResults = runNotificationItemTests();

// Run NotificationsView tests
console.log('\n--- NotificationsView Tests ---\n');
runNotificationsViewTests()
  .then(function(notificationsViewResults) {
    console.log('\n=================================');
    console.log('All Notification Tests Complete');
    console.log('=================================\n');
    
    var totalPassed = notificationItemResults.passed + notificationsViewResults.passed;
    var totalFailed = notificationItemResults.failed + notificationsViewResults.failed;
    var totalTests = totalPassed + totalFailed;
    
    console.log('Total Passed: ' + totalPassed);
    console.log('Total Failed: ' + totalFailed);
    console.log('Total Tests: ' + totalTests);
    
    if (totalFailed === 0) {
      console.log('\n✓ All tests passed!');
    } else {
      console.log('\n✗ Some tests failed');
    }
  })
  .catch(function(error) {
    console.error('Test runner error:', error);
  });
