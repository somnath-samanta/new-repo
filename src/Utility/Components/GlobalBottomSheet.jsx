import React, { useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import CommonStyle from '../Public/css/CommonStyle';
 
const GlobalBottomSheet = ({ bodyContent, isVisible, onClose, snapPoints = ['40%'], scrollViewRequire = true }) => {
    const bottomSheetRef = useRef(null);
    // const snapPoints = useMemo(() => ['40%'], []);
 
    const renderBackdrop = (props) => (
        <BottomSheetBackdrop
            {...props}
            //pressBehavior="none"
            opacity={0.6}
           appearsOnIndex={0}
           disappearsOnIndex={-1}
        />
    );
 
    React.useEffect(() => {
        if (isVisible) {
            bottomSheetRef.current?.expand();
        } else {
            bottomSheetRef.current?.close();
        }
    }, [isVisible]);
 
    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            backdropComponent={renderBackdrop}
            backgroundStyle={CommonStyle.bottomSheetBackground}
            handleStyle={CommonStyle.bottomSheetHandle}
            onClose={onClose}
           // backdropComponent={(props) => (<BottomSheetBackdrop {...props} enabled={false} opacity={0.6} /> )}
        >
            {scrollViewRequire ?
                <BottomSheetScrollView
                    showsVerticalScrollIndicator={false}
                >
                    {bodyContent}
                </BottomSheetScrollView> :
                bodyContent
            }
        </BottomSheet>
    );
};
 
export default GlobalBottomSheet;