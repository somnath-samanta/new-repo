import React from 'react';
import { View } from 'react-native';
import DatePicker from 'react-native-date-picker';

const CommonDatePicker = ({ open, date, onDateChange, closeDatePicker, type = '', locale = 'en' }) => {
    return (
        <View style={{ width: '100%', marginBottom: 5 }}>
            {open && (
                <DatePicker
                    modal
                    open={open}
                    date={date || new Date()}
                    onConfirm={(selectedDate) => onDateChange(selectedDate, type)}
                    onCancel={closeDatePicker}
                    title={null}
                    confirmText="OK"
                    cancelText="Cancel"
                    locale={locale}
                    androidVariant="nativeAndroid"
                    mode="date"
                />
            )}
        </View>
    );
};

export default CommonDatePicker;
