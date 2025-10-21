import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import CustomHeader from './CustomHeader';
import CustomFooter from './CustomFooter';
import { useNavigationState } from '@react-navigation/native';
import GlobalBottomSheet from '../Components/GlobalBottomSheet'
import SwitchOrganizationModalContent from '../Components/SwitchOrganizationModalContent'
import CommonStyle from '../Public/css/CommonStyle';
import { useNavigation } from '@react-navigation/native';
import EventEmitter from '../../Contexts/EventEmitter';
import HelpDesk from './HelpDesk';
import { SafeAreaView } from 'react-native-safe-area-context';
const ScreenWrapper = ({ children }) => {
    const routeName = useNavigationState(state => state.routeNames[state.index]);
    const showHeader = routeName !== 'Login' && routeName !== 'Forgot' && routeName !== 'Verification' && routeName !== 'Home';
    const showFooter = routeName !== 'Login' && routeName !== 'Forgot' && routeName !== 'Verification';
    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
    const navigation = useNavigation();

    const [switchPopupFlag, setSwitchPopupFlag] = useState(false);
    const snapPoints = ['60%'];

    const switchOrganizationSheet = (status) => {
        if (status) {
            setSwitchPopupFlag(true)
        }
    }
    const switchPopupHide = () => {
        setSwitchPopupFlag(false)
    }
    const organizationChangeSuccess = (status) => {
        if (status) {
            switchPopupHide()
            //navigation.navigate("Home")
            EventEmitter.emit("broadcustMessage", {
                "organizationSwitch": true
            })
        }
    }
    const [isHelpDeskVisible, setHelpDeskVisible] = useState(false);
    const hideHelpDesk = () => setHelpDeskVisible(false);
    const onHelpPress = () => {
      setHelpDeskVisible(true);
    }
  

    return (
        <SafeAreaView style={{ flex: 1, }}>
            <View style={CommonStyle.screenWrapperContainer}>
                {showHeader && <CustomHeader pageName={routeName} switchOrganizationSheet={switchOrganizationSheet} 
               // refreshBtnFn={refreshBtnFn}
                 />}
                {children}
                {/* {showFooter && <CustomFooter pageName={routeName} onHelpPress={onHelpPress} />} */}

                {/* <GlobalBottomSheet
                    isVisible={switchPopupFlag}
                    onClose={switchPopupHide}
                    snapPoints={snapPoints}
                    bodyContent={
                        <SwitchOrganizationModalContent
                            organizationChangeSuccess={organizationChangeSuccess}
                        />
                    }
                /> */}
                            {/* <GlobalBottomSheet
                isVisible={isHelpDeskVisible}
                onClose={hideHelpDesk}
                snapPoints={["20%"]}
                //style={{ backgroundColor: '#f3f3f3' }}
               // backgroundStyle={{ backgroundColor: '#f3f3f3' }} 
                bodyContent={
                   
                    <HelpDesk
                    // hidesearchSheet={hidesearchSheet}
                    // useFor="appointment"
                    // setSelectedTimeLine={setSelectedTimeLine}
                    // setSelectedPaymentStatus={setSelectedPaymentStatus}
                    // setSelectedPaymentMode={setSelectedPaymentMode}
                    // applyFilters={applyFilters}
                     />

                }
            /> */}
            </View>
        </SafeAreaView>
    );
};

export default ScreenWrapper;
