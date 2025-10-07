import React from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GeneralStatusBarColor = ({ backgroundColor, ...props }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.statusBar, { backgroundColor, paddingTop: insets.top }]}>
            <StatusBar translucent backgroundColor={backgroundColor} {...props} />
        </View>
    );
};

const styles = StyleSheet.create({
    statusBar: {
        height: 0//StatusBar.currentHeight, // Base height for Android
    },
});

export default GeneralStatusBarColor;
