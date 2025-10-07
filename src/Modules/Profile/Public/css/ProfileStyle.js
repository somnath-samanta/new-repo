import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";
import Colors from "../../../../Utility/Colors";
  // Montserrat-Black
  // Montserrat-Light
  // Montserrat-Medium
  // Montserrat-Regular
  // Montserrat-Thin
  // Montserrat-Bold
const lightTheme = {
    profileContainer: {
        flex: 1,
        backgroundColor: '#dff7f8',
    },
    backContainer: {
        paddingTop: 5,
        paddingHorizontal: 15 
    },
    contentContainer: {
        paddingHorizontal: 15,
        backgroundColor: '#dff7f8',
    },
    imageContainer: {
        alignItems: 'center',
        marginTop: 10
    },
    userImage: {
        height: 100,
        width: 100,
        borderRadius: 50,
        borderColor: Colors.white
    },
    contentContainerBox: {
        alignItems: 'center',
        paddingTop: 10
    },
    contentContainerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 6,
        borderRadius: 0,
        marginBottom: 6,
       // minHeight: 45
    },
    userNameRow: {
        fontSize: 14,
        fontFamily: 'Arimo-Bold',
        color: Colors.secondary,
        paddingLeft: 5,
        paddingTop: 5
    },
    otherDetailsRow: {
        fontSize: 14,
        fontFamily: 'Arimo-Regular',
        color: Colors.secondary,
        paddingLeft: 5
    },
    userIcon: {
        lineHeight: 17
    },

    enableMfaBtn: {
        backgroundColor: Colors.white,
        borderColor: Colors.secondary,
        borderWidth: 1.5,
        lineHeight: 16,
        paddingHorizontal: 15,
        paddingVertical: 7,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        width: '50%'
    },
    enableMfaBtnText: {
        fontSize: 14,
        fontFamily: 'Arimo-Regular',
        color: Colors.secondary,
        alignItems: 'center',
    },

};

const darkTheme = {
    profileContainer: {
        flex: 1,
        backgroundColor: '#dff7f8',
    },
    backContainer: {
        paddingTop: 5,
        paddingHorizontal: 15
    },
    contentContainer: {
        paddingHorizontal: 15,
        backgroundColor: '#dff7f8',
    },
    imageContainer: {
        alignItems: 'center',
        marginTop: 10
    },
    userImage: {
        height: 100,
        width: 100,
        borderRadius: 50,
        borderColor: Colors.white
    },
    contentContainerBox: {
        alignItems: 'center',
        paddingTop: 10
    },
    contentContainerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        width: '100%',
        paddingVertical: 5,
        paddingHorizontal: 6,
        borderRadius: 0,
        marginBottom: 6,
       // minHeight: 45
    },
    userNameRow: {
        fontSize: 14,
        fontFamily: 'Arimo-Bold',
        color: Colors.secondary,
        paddingLeft: 5,
        paddingTop: 5
    },
    otherDetailsRow: {
        fontSize: 14,
        fontFamily: 'Arimo-Regular',
        color: Colors.secondary,
        paddingLeft: 5
    },
    userIcon: {
        //lineHeight: 17
    },
    enableMfaBtn: {
        backgroundColor: Colors.white,
        borderColor: Colors.secondary,
        borderWidth: 1.5,
        lineHeight: 16,
        paddingHorizontal: 15,
        paddingVertical: 7,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        width: '50%'
    },
    enableMfaBtnText: {
        fontSize: 12,
        fontFamily: 'Arimo-Regular',
        color: Colors.secondary,
        alignItems: 'center',
    },
    
};

const ProfileStyle = (isDarkMode) => {
    return StyleSheet.create(isDarkMode ? darkTheme : lightTheme);
};

export default ProfileStyle