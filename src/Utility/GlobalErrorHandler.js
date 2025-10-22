import CrashLogger from './CrashLogger';

// Set up global error handlers
export const setupGlobalErrorHandlers = () => {
  // Handle JavaScript errors
  const defaultErrorHandler = ErrorUtils.getGlobalHandler();
  
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('=== GLOBAL ERROR ===');
    console.error('Fatal:', isFatal);
    console.error('Error:', error);
    console.error('===================');

    // Log to CrashLogger
    CrashLogger.logCrash(error, isFatal ? 'FATAL' : 'NON-FATAL');

    // Call default handler
    defaultErrorHandler(error, isFatal);
  });

  // Handle promise rejections
  const promiseRejectionTracker = (id, error) => {
    console.error('=== UNHANDLED PROMISE REJECTION ===');
    console.error('Rejection ID:', id);
    console.error('Error:', error);
    console.error('===================================');

    CrashLogger.logCrash(error, 'PROMISE_REJECTION');
  };

  // Set up promise rejection tracking
  if (typeof global.HermesInternal !== 'undefined') {
    // For Hermes engine
    global.HermesInternal?.enablePromiseRejectionTracker?.(promiseRejectionTracker);
  }

  console.log('✅ Global error handlers initialized');
};

// Export for easy access
export { CrashLogger };
