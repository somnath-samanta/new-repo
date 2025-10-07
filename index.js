/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import { store, persistor } from './src/Store/configureStore';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import 'react-native-url-polyfill/auto';
import 'whatwg-fetch'; // or: import 'cross-fetch/polyfill';
import FlashMessage from "react-native-flash-message";
import { PersistGate } from 'redux-persist/integration/react';
import {
    configureReanimatedLogger,
    ReanimatedLogLevel,
  } from 'react-native-reanimated';



// This is the default configuration
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: true, // Reanimated runs in strict mode by default
  });

//console.log("store===", store)
const RNRedux = () => (
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <Suspense fallback={false}>
                <App />
            </Suspense>
        </PersistGate>
        <FlashMessage position="top" />
    </Provider>
)

AppRegistry.registerComponent(appName, () => RNRedux);


