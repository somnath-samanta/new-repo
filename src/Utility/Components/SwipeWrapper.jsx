import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';

export default SwipeWrapper = ({ children }) => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {children}
        </GestureHandlerRootView>
    );
};
