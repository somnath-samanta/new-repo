import { FlingGestureHandler, Directions, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default SwipeWrapper = ({ children, onSwipeLeft, onSwipeRight }) => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <FlingGestureHandler
                direction={Directions.LEFT}
                onHandlerStateChange={({ nativeEvent }) => {
                    if (nativeEvent.state === State.END) {
                        onSwipeLeft && onSwipeLeft();
                    }
                }}
            >
                <FlingGestureHandler
                    direction={Directions.RIGHT}
                    onHandlerStateChange={({ nativeEvent }) => {
                        if (nativeEvent.state === State.END) {
                            onSwipeRight && onSwipeRight();
                        }
                    }}
                >
                    <View style={{ flex: 1 }}>{children}</View>
                </FlingGestureHandler>
            </FlingGestureHandler>
        </GestureHandlerRootView>
    );
};
