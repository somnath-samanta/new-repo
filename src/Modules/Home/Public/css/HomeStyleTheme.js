import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";
import Colors from "../../../../Utility/Colors";
  // Roboto-Black
  // Roboto-Light
  // Roboto-Medium
  // Roboto-Regular
  // Roboto-Thin
  // Roboto-Bold
const lightTheme = {
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.grayF5,
        color: Colors.black,
    },
    listContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    cardBox: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        // padding: 10,
        // marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: Colors.black,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
        //paddingBottom: 5
        paddingTop: 8,
        marginBottom: 12
    },
    imageBox: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    infoContainer: {
        //marginLeft: 8,
        flex: 1,
    },
    title: {
        fontSize: 16,
        marginBottom: 3,
        width: '90%',
        color: Colors.primary,
        fontFamily: 'Roboto-Bold',
    },
    bookingId: {
        fontSize: 14,
        color: Colors.primary,
        fontFamily: 'Roboto-Regular',
    },
    bookingText: {
        fontFamily: 'Roboto-Bold',
        color: Colors.primary,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-start',
    },
    locationWithIcon: {
        width: "95%",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-start'
    },
    angleInner: {
        width: "5%",
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        position: 'relative',
        top: -30,
        right: 0
    },
    navigationIconColor: {
        color: Colors.primary
    },
    location: {
        fontSize: 14,
        marginLeft: 0,
        width: '95%',
        color: Colors.primary,
        fontFamily: 'Roboto-Regular',
    },
    locationIconColor: {
        color: Colors.primary
    },
    detailsButton: {
        fontSize: 14,
        fontFamily: 'Roboto-Medium',
        alignItems: 'flex-end'
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    checkInColor: {
        color: Colors.blue
    },
    ConfirmedColor: {
        color: Colors.orange
    },
    locationInner: {
        position: 'relative',
        top: 3,
        left: -5,
        width: 25,
        height: 25,
        color: Colors.primary
    },

    //date picker
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    datePickerWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
    },
    dateText: {
        fontSize: 16,
        marginRight: 10,
    },
    clearButton: {
        marginLeft: 10,
    },
    datePickerContainer: {
        width: '100%',
        marginBottom: 5,
    },

    //Dropdown ============
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingLeft: 12,
        paddingRight: 12,
    },
    dropDownContainer: {
        width: '49%',
        borderWidth: 1,
        borderColor: Colors.grayDD,
        backgroundColor: Colors.white,
        borderRadius: 4,
    },
    dateContainer: {
        borderWidth: 1,
        borderColor: Colors.grayDD,
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: Colors.white,
        borderRadius: 4, width: '49%'
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%'
    },
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    },
    dateLabel: {
        fontSize: 16,
        marginRight: 10,
        color: Colors.secondary
    },
    clearDate: {
        position: 'absolute',
        right: 20
    },
    clearStatus: {
        position: 'absolute',
        right: 30,
        top: 8
    },
    //Booking Details Screen=================
    listBoxContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    detailsListBox: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        paddingTop: 10,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
        marginTop: 10
    },
    detBranchName: {
        fontSize: 13,
        marginBottom: 0,
        width: '70%',
        color: Colors.primary,
        fontFamily: 'Roboto-Bold',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingBottom: 3,
        marginBottom: 3,
    },
    boxLabel: {
        fontSize: 13,
        color: Colors.primary,
        fontFamily: 'Roboto-Regular',
    },
    boxLabelText: {
        fontFamily: 'Roboto-Bold',
        color: Colors.primary,
        lineHeight: 18
    },
    checkInOutLabel: {
        fontSize: 12
    },
    detBookingStatus: {
        fontSize: 13,
        fontFamily: 'Roboto-Medium',
        alignItems: 'flex-end',
    },
    boxLeftView: {
        width: '50%',
        paddingRight: 3
    },
    boxRightView: {
        width: '50%',
        paddingLeft: 3
    },
    guestDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    uploadedStatusIcon: {
        position: 'relative',
        left: 5,
        top: -2
    },
    guestDetailsBtnInner: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    guestDetailsUploadBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.grayEC,
        width: '100%',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        padding: 8
    },
    uploadBtnText: {
        textAlign: 'center',
        fontSize: 14,
        color: Colors.primary,
        fontFamily: 'Roboto-Medium',
    },
    emptyData: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center', height: 200
    },
    emptyDataText: {
        color: Colors.grayB1,
        fontSize: 15,
        fontFamily: 'Roboto-Regular'
    },

    //Assign room number
    assignRoomContainer: {
        flex: 1,
    },
    assignRoomOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    assignRoomContentContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: '98%',
        paddingTop: 15
    },
    assignRoomHeader: {
        alignItems: 'center',
        paddingBottom: 5
    },
    assignRoomTitle: {
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        color: Colors.primary
    },
    assignRoomSection: {
        marginBottom: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderColor: Colors.grayE7,
        borderWidth: 2,
        borderRadius: 6,
        marginHorizontal: 15
    },
    assignRoomRow: {
        flexDirection: 'row'
    },
    assignRoomRowLabel: {
        fontSize: 13,
        marginBottom: 1,
        fontFamily: 'Roboto-Medium',
        color: Colors.secondary
    },
    assignRoomRowValue: {
        fontSize: 13,
        marginBottom: 1,
        fontFamily: 'Roboto-Regular',
        color: Colors.secondary
    },
    assignRoomButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderColor: Colors.secondary,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
    },
    assignConfirmBtn: {
        paddingHorizontal: 10,
        width: '50%',
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: Colors.secondary,
        paddingBottom: 20
    },
    assignConfirmText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        color: Colors.white
    },
    assignCancelBtn: {
        paddingHorizontal: 10,
        width: '50%',
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingBottom: 20
    },
    assignCancelText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        color: Colors.primary
    },
    assignRoomDropContainer: {
        flex: 1,
        justifyContent: 'center',
        marginBottom: 3
    },
    assignRoomDropdown: {
        height: 40,
        backgroundColor: Colors.white,
        borderColor: Colors.grayB1,
        borderWidth: 1.5,
        paddingHorizontal: 10,
        borderRadius: 6
    },
    placeholderStyle: {
        fontSize: 16,
        color: Colors.gray99
    },
    selectedTextStyle: {
        fontSize: 14,
        alignItems: 'center',
        lineHeight: 16,
        color: Colors.secondary
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: Colors.secondary
    },
    selectedStyle: {
        borderRadius: 4,
        borderWidth: 1,
        color: Colors.secondary,
        borderWidth: 1,
        borderColor: Colors.secondary,
    },
    itemTextStyle: {
        color: Colors.secondary,
    },
    assignRoomDropErrorMsg: {
        fontSize: 13,
        color: Colors.red,
        fontFamily: 'Roboto-Regular'
    },

};

const darkTheme = {
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.primary,
        color: Colors.white,
    },
    listContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    cardBox: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 10,
        marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: Colors.black,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
        paddingBottom: 5
    },
    imageBox: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    infoContainer: {
        //marginLeft: 8,
        flex: 1,
    },
    title: {
        fontSize: 16,
        marginBottom: 3,
        width: '90%',
        color: Colors.primary,
        fontFamily: 'Roboto-Bold',
    },
    bookingId: {
        fontSize: 14,
        color: Colors.primary,
        fontFamily: 'Roboto-Regular',
    },
    bookingText: {
        fontFamily: 'Roboto-Bold',
        color: Colors.primary,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-start',
    },
    locationWithIcon: {
        width: "95%",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-start'
    },
    angleInner: {
        width: "5%",
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        position: 'relative',
        top: -30,
        right: 0
    },
    navigationIconColor: {
        color: Colors.primary
    },
    location: {
        fontSize: 14,
        marginLeft: 0,
        width: '95%',
        color: Colors.primary,
        fontFamily: 'Roboto-Regular',
    },
    locationIconColor: {
        color: Colors.primary
    },
    detailsButton: {
        fontSize: 14,
        fontFamily: 'Roboto-Medium',
        alignItems: 'flex-end'
    },
    statusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    checkInColor: {
        color: Colors.blue
    },
    ConfirmedColor: {
        color: Colors.orange
    },
    locationInner: {
        position: 'relative',
        top: 3,
        left: -5,
        width: 25,
        height: 25,
        color: Colors.primary
    },

    //date picker
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    datePickerWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
    },
    dateText: {
        fontSize: 16,
        marginRight: 10,
    },
    clearButton: {
        marginLeft: 10,
    },
    datePickerContainer: {
        width: '100%',
        marginBottom: 5,
    },

    //Dropdown ============
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingLeft: 12,
        paddingRight: 12,
    },
    dropDownContainer: {
        width: '49%',
        borderWidth: 1,
        borderColor: Colors.grayDD,
        backgroundColor: Colors.white,
        borderRadius: 4,
    },
    dateContainer: {
        borderWidth: 1,
        borderColor: Colors.grayDD,
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: Colors.white,
        borderRadius: 4, width: '49%'
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%'
    },
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    },
    dateLabel: {
        fontSize: 16,
        marginRight: 10,
        color: Colors.secondary
    },
    clearDate: {
        position: 'absolute',
        right: 20
    },
    clearStatus: {
        position: 'absolute',
        right: 30,
        top: 8
    },
    //Booking Details Screen=================
    listBoxContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    detailsListBox: {
        backgroundColor: Colors.white,
        borderRadius: 10,
        paddingTop: 10,
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
        marginTop: 10
    },
    detBranchName: {
        fontSize: 14,
        marginBottom: 0,
        width: '70%',
        color: Colors.primary,
        fontFamily: 'Roboto-Bold',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 3,
        marginBottom: 3,
    },
    boxLabel: {
        fontSize: 13,
        color: Colors.primary,
        fontFamily: 'Roboto-Regular',
    },
    boxLabelText: {
        fontFamily: 'Roboto-Bold',
        color: Colors.primary,
        lineHeight: 15
    },
    checkInOutLabel: {
        fontSize: 12
    },
    detBookingStatus: {
        fontSize: 14,
        fontFamily: 'Roboto-Medium',
        alignItems: 'flex-end',
    },
    boxLeftView: {
        width: '50%',
        paddingRight: 3
    },
    boxRightView: {
        width: '50%',
        paddingLeft: 3
    },
    guestDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    uploadedStatusIcon: {
        position: 'relative',
        left: 5
    },
    guestDetailsBtnInner: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    guestDetailsUploadBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.grayEC,
        width: '100%',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        padding: 8
    },
    uploadBtnText: {
        textAlign: 'center',
        fontSize: 14,
        color: Colors.primary,
        fontFamily: 'Roboto-Medium',
    },
    emptyData: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center', height: 200
    },
    emptyDataText: {
        color: Colors.grayB1,
        fontSize: 15,
        fontFamily: 'Roboto-Bold'
    },
    //Assign room number
    assignRoomContainer: {
        flex: 1,
    },
    assignRoomOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    assignRoomContentContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: '98%',
        paddingTop: 15
    },
    assignRoomHeader: {
        alignItems: 'center',
        paddingBottom: 5
    },
    assignRoomTitle: {
        fontFamily: 'Roboto-Medium',
        fontSize: 18,
        color: Colors.primary
    },
    assignRoomSection: {
        marginBottom: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderColor: Colors.grayE7,
        borderWidth: 2,
        borderRadius: 6,
        marginHorizontal: 15
    },
    assignRoomRow: {
        flexDirection: 'row'
    },
    assignRoomRowLabel: {
        fontSize: 13,
        marginBottom: 1,
        fontFamily: 'Roboto-Medium',
        color: Colors.secondary
    },
    assignRoomRowValue: {
        fontSize: 13,
        marginBottom: 1,
        fontFamily: 'Roboto-Regular',
        color: Colors.secondary
    },
    assignRoomButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderColor: Colors.secondary,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
    },
    assignConfirmBtn: {
        paddingHorizontal: 10,
        width: '50%',
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: Colors.secondary,
        paddingBottom: 20
    },
    assignConfirmText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        color: Colors.white
    },
    assignCancelBtn: {
        paddingHorizontal: 10,
        width: '50%',
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingBottom: 20
    },
    assignCancelText: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        color: Colors.primary
    },
    assignRoomDropContainer: {
        flex: 1,
        justifyContent: 'center',
        marginBottom: 3
    },
    assignRoomDropdown: {
        height: 40,
        backgroundColor: Colors.white,
        borderColor: Colors.grayB1,
        borderWidth: 1.5,
        paddingHorizontal: 10,
        borderRadius: 6
    },
    placeholderStyle: {
        fontSize: 16,
        color: Colors.gray99
    },
    selectedTextStyle: {
        fontSize: 14,
        alignItems: 'center',
        lineHeight: 16,
        color: Colors.secondary
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: Colors.secondary
    },
    selectedStyle: {
        borderRadius: 4,
        borderWidth: 1,
        color: Colors.secondary,
        borderWidth: 1,
        borderColor: Colors.secondary,
    },
    itemTextStyle: {
        color: Colors.secondary,
    },
    assignRoomDropErrorMsg: {
        fontSize: 13,
        color: Colors.red,
        fontFamily: 'Roboto-Regular'
    },
};

const HomeStyleTheme = (isDarkMode) => {
    return StyleSheet.create(isDarkMode ? darkTheme : lightTheme);
};

export default HomeStyleTheme