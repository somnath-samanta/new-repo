import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log crash details
    const crashLog = {
      timestamp: new Date().toISOString(),
      error: error.toString(),
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
    };

    console.error('=== CRASH LOG ===');
    console.error('Timestamp:', crashLog.timestamp);
    console.error('Error:', crashLog.error);
    console.error('Stack:', crashLog.errorStack);
    console.error('Component Stack:', crashLog.componentStack);
    console.error('==================');

    // Optional: Send to your server
    this.sendCrashReport(crashLog);
  }

  sendCrashReport = async (crashLog) => {
    try {
      // Uncomment and configure your crash reporting endpoint
      /*
      await fetch('YOUR_CRASH_REPORTING_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crashLog),
      });
      */
      console.log('Crash report ready to send:', crashLog);
    } catch (err) {
      console.error('Failed to send crash report:', err);
    }
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.toString() || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
