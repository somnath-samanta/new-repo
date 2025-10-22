import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class CrashLogger {
  static CRASH_LOG_KEY = '@crash_logs';

  // Log a crash
  static async logCrash(error, context = '') {
    try {
      const crashData = {
        timestamp: new Date().toISOString(),
        error: error.toString(),
        message: error.message || 'Unknown error',
        stack: error.stack || 'No stack trace',
        context: context,
        platform: Platform.OS,
      };

      console.error('=== CRASH LOGGED ===');
      console.error(JSON.stringify(crashData, null, 2));
      console.error('====================');

      // Save to AsyncStorage
      await this.saveCrashLog(crashData);

      return crashData;
    } catch (err) {
      console.error('Failed to log crash:', err);
    }
  }

  // Save crash log to local storage
  static async saveCrashLog(crashData) {
    try {
      const existingLogs = await this.getCrashLogs();
      const updatedLogs = [crashData, ...existingLogs].slice(0, 50); // Keep last 50 crashes
      await AsyncStorage.setItem(this.CRASH_LOG_KEY, JSON.stringify(updatedLogs));
    } catch (err) {
      console.error('Failed to save crash log:', err);
    }
  }

  // Get all crash logs
  static async getCrashLogs() {
    try {
      const logs = await AsyncStorage.getItem(this.CRASH_LOG_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (err) {
      console.error('Failed to get crash logs:', err);
      return [];
    }
  }

  // Clear all crash logs
  static async clearCrashLogs() {
    try {
      await AsyncStorage.removeItem(this.CRASH_LOG_KEY);
      console.log('Crash logs cleared');
    } catch (err) {
      console.error('Failed to clear crash logs:', err);
    }
  }

  // Send crash logs to server
  static async sendCrashLogsToServer(serverUrl) {
    try {
      const logs = await this.getCrashLogs();
      
      if (logs.length === 0) {
        console.log('No crash logs to send');
        return;
      }

      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ crashes: logs }),
      });

      if (response.ok) {
        console.log('Crash logs sent successfully');
        await this.clearCrashLogs();
      } else {
        console.error('Failed to send crash logs:', response.status);
      }
    } catch (err) {
      console.error('Error sending crash logs:', err);
    }
  }

  // View crash logs in console
  static async viewCrashLogs() {
    const logs = await this.getCrashLogs();
    console.log('=== ALL CRASH LOGS ===');
    console.log(JSON.stringify(logs, null, 2));
    console.log('======================');
    return logs;
  }
}

export default CrashLogger;
