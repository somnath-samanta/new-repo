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
        color: Colors.white,
    },
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
        fontSize: 15,
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
        fontSize: 14,
        color: Colors.primary,
        fontFamily: 'Roboto-Regular',
    },
    boxLabelText: {
        fontFamily: 'Roboto-Bold',
        color: Colors.primary,
    },
    detBookingStatus: {
        fontSize: 14,
        fontFamily: 'Roboto-Bold',
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
        fontSize: 16,
        color: Colors.primary,
        fontFamily: 'Roboto-Medium',
    },
    checkInColor: {
        color: Colors.blue
    },
    ConfirmedColor: {
        color: Colors.orange
    },

};

const darkTheme = {
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.primary,
        color: Colors.white,
    },
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
        fontSize: 15,
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
        fontSize: 14,
        color: Colors.primary,
        fontFamily: 'Roboto-Regular',
    },
    boxLabelText: {
        fontFamily: 'Roboto-Bold',
        color: Colors.primary,
    },
    detBookingStatus: {
        fontSize: 15,
        fontFamily: 'Roboto-Bold',
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
        fontSize: 16,
        color: Colors.primary,
        fontFamily: 'Roboto-Medium',
    },
    checkInColor: {
        color: Colors.blue
    },
    ConfirmedColor: {
        color: Colors.orange
    },
};

const BookingDetailsStyle = (isDarkMode) => {
    return StyleSheet.create(isDarkMode ? darkTheme : lightTheme);
};

export default BookingDetailsStyle