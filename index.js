/**
 * @format
 */

import { AppRegistry, Text, TextInput, AccessibilityInfo } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import { store, persistor } from './src/Store/configureStore';
import React, { Suspense } from 'react';
import 'react-native-url-polyfill/auto';
import 'whatwg-fetch';
import FlashMessage from "react-native-flash-message";
import { PersistGate } from 'redux-persist/integration/react';
import {
    configureReanimatedLogger,
    ReanimatedLogLevel,
} from 'react-native-reanimated';
import { setupGlobalErrorHandlers } from './src/Utility/GlobalErrorHandler';

// Disable unnecessary font scaling globally
if (Text.defaultProps == null) Text.defaultProps = {};
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps.allowFontScaling = false;
Text.defaultProps.maxFontSizeMultiplier = 1;
TextInput.defaultProps.maxFontSizeMultiplier = 1;

// Optional accessibility safeguard
AccessibilityInfo.setAccessibilityFocus = () => {}; // helps prevent UI scaling issues

// Optional: configure Reanimated logger
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: true,
});

setupGlobalErrorHandlers();

const RNRedux = () => (
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <Suspense fallback={false}>
                <App />
            </Suspense>
        </PersistGate>
        <FlashMessage position="top" />
    </Provider>
);

AppRegistry.registerComponent(appName, () => RNRedux);
