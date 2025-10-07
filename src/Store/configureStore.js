import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import thunk from 'redux-thunk';
import rootReducer from '../Reducers/mainReducer';
import axios from 'axios';
import Config from '../Utility/Config';

// Persist configuration
const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    timeout: 10000
};



// Create an axios instance
const axiosInstance = axios.create({
    baseURL: `${Config.baseURL}${Config.extendedUrl}`, // Replace with your API base URL
    timeout: 10000, // Set a timeout if needed
    // You can set headers or other configuration options here
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Apply middleware correctly
const middleware = [thunk];

const store = createStore(
    persistedReducer,
    // applyMiddleware(...middleware) // Spread the middleware array
    //applyMiddleware(thunk.withExtraArgument(axiosInstance)),

);

// Create the persistor
const persistor = persistStore(store);

export { store, persistor };
