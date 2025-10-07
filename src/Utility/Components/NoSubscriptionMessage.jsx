import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const NoSubscriptionMessage = () => {

    const onSubscribe = () => {

    }
    return (
        <View style={styles.container}>
            <Text style={styles.message}>No subscription available</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    message: {
        fontSize: 18,
        color: '#333',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#ff6347',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default NoSubscriptionMessage;
