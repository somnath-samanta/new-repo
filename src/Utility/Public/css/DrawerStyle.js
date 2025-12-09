import { Dimensions } from "react-native";
import { StyleSheet } from "react-native";
import Colors from "../../Colors";
import { opacity } from "react-native-reanimated/lib/typescript/Colors";
import { Platform } from 'react-native';
  // Montserrat-Black
  // Montserrat-Light
  // Montserrat-Medium
  // Montserrat-Regular
  // Montserrat-Thin
  // Montserrat-Bold
const lightTheme = {
    leftHeader: {
        padding: 16,
        backgroundColor: '#24ad91',
        alignItems: 'center',
        paddingBottom: 8
    },
    leftLogo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    leftHeaderText: {
        color: Colors.white,
        fontSize: 15,
        fontFamily: 'Montserrat-Medium',
        lineHeight: 16
    },
    userMailText: {
        color: Colors.white,
        fontSize: 12,
        fontFamily: 'Montserrat-Regular',
        lineHeight: 16
    },
    drawerItems: {
        flexGrow: 1,
        marginTop: 16,
      // backgroundColor:'red'
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 16,
        borderRadius: 0,
      //  backgroundColor: 'red',
       // marginVertical: 5,
        // borderBottomWidth:1,
        // borderBottomColor:'#eee',
        
    },
    drawerSubItem:{
        padding:20,
        paddingTop:10,
        paddingBottom:10,
       // backgroundColor:'red'
    },
    drawerItemText: {
        fontSize: 16,
        marginLeft: 10,
        color:'#000',

    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 16,
        borderRadius: 5,
        backgroundColor: 'transparent',
        marginVertical: 5,
        marginBottom: 10
    },
    toggleText: {
        color: Colors.white,
        fontSize: 16,
    },
    logoutBtn: {
        marginTop: 10,
        marginBottom: 0
    },
    drawerContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 24,
        position: 'relative',
        textAlign:'center',
        justifyContent:'center',
    },
    closeDrawerButton: {
        backgroundColor: Colors.secondary,
       // backgroundColor:'red',
        padding: 0,
        color: Colors.white,
        width: 30,
        height: 30,
        borderRadius: 50,
        position: 'absolute',
        left: 10,
        top: 0,
        zIndex: 1000,
        textAlign: 'center',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',

    },
    closeButton: {
        color: 'white',
        fontSize: 16,
    },
    activeDrawerItem: {
        backgroundColor: '#eee', // Highlight color for active item
    },
    versionColor:{
        color: '#999',
        opacity:0.7,
        width:'100%',
       //backgroundColor:'blue',
        textAlign:'center',
        padding:10,
        
    }


};

const darkTheme = {
    leftHeader: {
        padding: 16,
        backgroundColor: '#24ad91',
        alignItems: 'center',
        paddingBottom: 8
    },
    leftLogo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    leftHeaderText: {
        color: Colors.white,
        fontSize: 15,
        fontFamily: 'Montserrat-Medium',
        lineHeight: 16
    },
    userMailText: {
        color: Colors.white,
        fontSize: 12,
        fontFamily: 'Montserrat-Regular',
        lineHeight: 16
    },
    drawerItems: {
        flexGrow: 1,
        marginTop: 16,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 16,
        borderRadius: 0,
        backgroundColor: 'transparent',
       // marginVertical: 5,
        // borderBottomWidth:1,
        // borderBottomColor:'#eee',
        
    },
    drawerSubItem:{
        padding:20,
        paddingTop:10,
        paddingBottom:10,
    },
    drawerItemText: {
        fontSize: 16,
        marginLeft: 10,
        color:'#000',
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 16,
        borderRadius: 5,
        backgroundColor: 'transparent',
        marginVertical: 5,
        marginBottom: 10
    },
    toggleText: {
        color: Colors.lightBlack,
        fontSize: 16,
    },
    logoutBtn: {
        marginTop: 10,
        marginBottom: 0
    },
    drawerContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 24,
        position: 'relative',
        textAlign:'center',
        justifyContent:'center',
    },
    closeDrawerButton: {
       backgroundColor: Colors.secondary,
       // backgroundColor:'red',
        padding: 0,
        color: Colors.white,
        width: 30,
        height: 30,
        borderRadius: 50,
        position: 'absolute',
        left: 10,
        top: 0,
        zIndex: 1000,
        textAlign: 'center',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',

    },
    closeButton: {
        color: 'white',
        fontSize: 16,
    },
    activeDrawerItem: {
        backgroundColor: '#eee', // Highlight color for active item
    },
    versionColor:{
        color: '#999',
        opacity:0.7,
        width:'100%',
       //backgroundColor:'blue',
        textAlign:'center',
        padding:10,
    }
};

const DrawerStyle = (isDarkMode) => {
    return StyleSheet.create(isDarkMode ? darkTheme : lightTheme);
};

export default DrawerStyle