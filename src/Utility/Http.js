import * as Store from '../Store/configureStore'
import Config from './Config'
import axios from 'axios';
//import AsyncStorage from '@react-native-community/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';
import { SET_TOKEN } from '../Utility/AllActionTypes';
import { connect, useDispatch } from 'react-redux';
import EventEmitter from '../Contexts/EventEmitter';
//console.log(" Store.store.getState()===", Store.store.getState().environment)


export const get = (url, data, header = "global") => {
    return new Promise(async (resolve, reject) => {
        //let apiBaseUrl = `${Config.baseURL}${url}`;
        let apiBaseUrl = ""
        if (Store.store.getState().environment == "dev") {
            apiBaseUrl = `https://ti1tk0ryn4.execute-api.ap-south-1.amazonaws.com/devv4/${url}`
        }
        if (Store.store.getState().environment == "uat") {
            apiBaseUrl = `https://api.uat.oaktree.com/${url}`
        }
        if (Store.store.getState().environment == "production") {
            apiBaseUrl = `https://api.production.oaktree.com/${url}`
        }

        axios.get(apiBaseUrl, {
            params: data,
            headers: await getHeaders(header, url)
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            //console.error("..........=============............", error)
            reject(error);
            errorHandlingBlock(error)
        })
    });
}
export const post = (url, data, header = "global") => {
    return new Promise(async (resolve, reject) => {
        //let apiBaseUrl = `${Config.baseURL}${url}`;
        let apiBaseUrl = ""
        if (Store.store.getState().environment == "dev") {
            apiBaseUrl = `https://ti1tk0ryn4.execute-api.ap-south-1.amazonaws.com/devv4/${url}`
        }
        if (Store.store.getState().environment == "uat") {
            apiBaseUrl = `https://api.uat.oaktree.com/${url}`
        }
        if (Store.store.getState().environment == "production") {
            apiBaseUrl = `https://api.production.oaktree.com/${url}`
        }

        console.log("apiBaseUrl=======", apiBaseUrl)

        axios.post(apiBaseUrl, data, { headers: await getHeaders(header, url) }).then((response) => {
            //console.log("response====post", response)
            resolve(response);
        }).catch((error) => {
            //console.log("error====post", error)
            reject(error);
            errorHandlingBlock(error)
        })
    });
}
export const patch = (url, data, header = "global") => {
    return new Promise(async (resolve, reject) => {
        //let apiBaseUrl = `${Config.baseURL}${url}`;
        let apiBaseUrl = ""
        if (Store.store.getState().environment == "dev") {
            apiBaseUrl = `https://ti1tk0ryn4.execute-api.ap-south-1.amazonaws.com/devv4/${url}`
        }
        if (Store.store.getState().environment == "uat") {
            apiBaseUrl = `https://api.uat.oaktree.com/${url}`
        }
        if (Store.store.getState().environment == "production") {
            apiBaseUrl = `https://api.production.oaktree.com/${url}`
        }
        axios.patch(apiBaseUrl, data, { headers: await getHeaders(header, url) }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
            errorHandlingBlock(error)
        })
    });
}
export const put = (url, data, header = "global") => {
    return new Promise(async (resolve, reject) => {
        //let apiBaseUrl = `${Config.baseURL}${url}`;
        let apiBaseUrl = ""
        if (Store.store.getState().environment == "dev") {
            apiBaseUrl = `https://ti1tk0ryn4.execute-api.ap-south-1.amazonaws.com/devv4/${url}`
        }
        if (Store.store.getState().environment == "uat") {
            apiBaseUrl = `https://api.uat.oaktree.com/${url}`
        }
        if (Store.store.getState().environment == "production") {
            apiBaseUrl = `https://api.production.oaktree.com/${url}`
        }
        axios.put(apiBaseUrl, data, { headers: await getHeaders(header, url) }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
            errorHandlingBlock(error)
        })
    });
}
export const del = (url, data, header = "global") => {
    return new Promise(async (resolve, reject) => {
        //let apiBaseUrl = `${Config.baseURL}${url}`;
        let apiBaseUrl = ""
        if (Store.store.getState().environment == "dev") {
            apiBaseUrl = `https://ti1tk0ryn4.execute-api.ap-south-1.amazonaws.com/devv4/${url}`
        }
        if (Store.store.getState().environment == "uat") {
            apiBaseUrl = `https://api.uat.oaktree.com/${url}`
        }
        if (Store.store.getState().environment == "production") {
            apiBaseUrl = `https://api.production.oaktree.com/${url}`
        }
        axios.delete(apiBaseUrl, {
            data: data,
            headers: await getHeaders(header, url)
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
            errorHandlingBlock(error)
        })
    });
}

export const getHeaders = async (header, path = "") => {
    // console.log("path==", path)
    // console.log("Config==", Config)
    // console.log("extendedUrl==", Config.extendedUrl)
    //console.log(header)
    // console.log(JSON.parse(await AsyncStorage.getItem('loginCredentials')).user_details.version)

    if ((path == `${Config.extendedUrl}users/login`) || (path == `${Config.extendedUrl}users/userforcepasswordchange`) || (path == `${Config.extendedUrl}users/confirmforgotpassword`) || (path == `${Config.extendedUrl}users/forgotpassword`) || (path == `${Config.extendedUrl}users/mfa/verify`)) {
        //console.log("Entry============checkExpiryOfToken")
    } else {
        checkExpiryOfToken();
    }
    let headers = {};
    headers['language'] = await AsyncStorage.getItem('i18nextLng') ? await AsyncStorage.getItem('i18nextLng') : "en";
    headers['platform'] = 'App';
    let version = JSON.parse(await AsyncStorage.getItem('loginCredentials'));
    //console.log("version======", version)
    if (version && version.hasOwnProperty('user_details') && version.user_details.hasOwnProperty('version')) {
        if (path == `${Config.extendedUrl}${JSON.parse(await AsyncStorage.getItem('loginCredentials')).user_details.version}/customerDetails/upload_identity`) {
            headers['Content-Type'] = 'multipart/form-data';
        }
    }

    headers['business_details'] = await AsyncStorage.getItem('chooseOrganization')

    if (header == null) {
        //console.log(1)
        headers['language'] = await AsyncStorage.getItem('i18nextLng') ? await AsyncStorage.getItem('i18nextLng') : "en";
    } else if (header == "global") {
        headers["Authorization"] = await AsyncStorage.getItem('finalIdToken');
    } else if (Object.keys(header).length > 0) {
        if (path == `${Config.extendedUrl}users/userforcepasswordchange`) {
            Object.keys(header).map((key, idx) => {
                headers[key] = header[key];
            })
        } else if (path == `${Config.extendedUrl}users/singout`) {
            //console.log(5)
            await AsyncStorage.setItem('i18nextLng', 'en');
            headers["Authorization"] = await AsyncStorage.getItem('finalIdToken');
            headers["Accesstoken"] = await AsyncStorage.getItem('accessToken');
        } else if (path == `${Config.extendedUrl}users/changepassword`) {
            //console.log(6)
            headers["Authorization"] = await AsyncStorage.getItem('finalIdToken');
            headers["Accesstoken"] = await AsyncStorage.getItem('accessToken');
        } else if (path == `${Config.extendedUrl}users/associate_software_token`) {
            //console.log(6)
            headers["Authorization"] = await AsyncStorage.getItem('finalIdToken');
            headers["AccessToken"] = await AsyncStorage.getItem('accessToken');
        }
        else if (path == `${Config.extendedUrl}users/verify_software_token`) {
            //console.log(6)
            headers["Authorization"] = await AsyncStorage.getItem('finalIdToken');
            headers["AccessToken"] = await AsyncStorage.getItem('accessToken');
        }
        else if (path == `${Config.extendedUrl}users/usr_mfa_assign`) {
            //console.log(6)
            headers["Authorization"] = await AsyncStorage.getItem('finalIdToken');
            headers["AccessToken"] = await AsyncStorage.getItem('accessToken');
        }
        else if (path == `${Config.extendedUrl}users/mfa/verify`) {
            //console.log(6)
            headers["Authorization"] = await AsyncStorage.getItem('finalIdToken');
            headers["Session"] = header.Session;
        }
    }

    return headers
};

export const checkExpiryOfToken = async () => {
    let value = JSON.parse(await AsyncStorage.getItem('loginTime'));
    //console.log("value=======", value)
    let currentDateTime = new Date();
    const expiryTime = new Date(value.expiryTime)
    const loggedInTime = new Date(value.loggedInTime)
    const expiryInterval = value.expiryInterval
    if (expiryTime != "") {
        let deltaDifference = ((currentDateTime == "" ? 0 : currentDateTime) - (loggedInTime == "" ? 0 : loggedInTime)) / 1000
        if (currentDateTime >= expiryTime) { //&& (deltaDifference <= expiryInterval)
            refershToken()
        }
    }

};

export const refershToken = () => {
    //console.log("refershToken called")
    //const dispatch = useDispatch();
    let res = new Promise(async (resolve, reject) => {
        let header = {};
        header["Authorization"] = await AsyncStorage.getItem('finalIdToken');

        //let apiBaseUrl = `${Config.baseURL}${Config.extendedUrl}users/refreshtoken`;


        if (Store.store.getState().environment == "dev") {
            apiBaseUrl = `https://ti1tk0ryn4.execute-api.ap-south-1.amazonaws.com/devv4/${Config.extendedUrl}users/refreshtoken`
        }
        if (Store.store.getState().environment == "uat") {
            apiBaseUrl = `https://api.uat.oaktree.com/${Config.extendedUrl}users/refreshtoken`
        }
        if (Store.store.getState().environment == "production") {
            apiBaseUrl = `https://api.production.oaktree.com/${Config.extendedUrl}users/refreshtoken`
        }

        let data = {}
        data["refreshToken"] = await AsyncStorage.getItem('refreshToken');
        axios.patch(apiBaseUrl, data, { headers: header }).then((response) => {
            resolve(response);
        }).catch((error) => {
            //console.log("Failed to refresh token==", error)
            errorHandlingBlock(error)
            logoutApp()
        })
    });
    res.then(async (result) => {
        //console.log("result===>refresh", result.data)
        let finalResponse = result.data
        if (finalResponse.success) {
            const finalIdToken = finalResponse.data.tokenType + ' ' + finalResponse.data.idToken;
            const accessToken = finalResponse.data.accessToken;

            var today = new Date();
            var afterAddWithToday = new Date();
            afterAddWithToday.setSeconds(afterAddWithToday.getSeconds() + (expiresIn - 900));
            let data = {};
            data["loggedInTime"] = today
            data["expiryTime"] = afterAddWithToday
            data["expiryInterval"] = expiresIn

            await AsyncStorage.setItem('finalIdToken', finalIdToken);
            await AsyncStorage.setItem('accessToken', accessToken);
            const expiresIn = data;
            await AsyncStorage.setItem('loginTime', JSON.stringify(expiresIn));
            // console.log("Store======", Store)
            // dispatch({ type: "SET_TOKEN", payload: finalIdToken });
            EventEmitter.emit("broadcustMessage", {
                "loginSuccess": true
            })

        } else {
            //Utility.toastNotifications(finalResponse.message, "Error", "error")
            Toast.show("Session Expired", "Error", "error")
            logoutApp()
        }
    })

};

export const logoutApp = async () => {



    await AsyncStorage.setItem('finalIdToken', "");
    await AsyncStorage.setItem('i18nextLng', "en");
    await AsyncStorage.setItem('accessToken', "");
    await AsyncStorage.setItem('refreshToken', "");
    await AsyncStorage.setItem('loginCredentials', "");
    await AsyncStorage.setItem('loginTime', "");

    await AsyncStorage.setItem('attachOrganization', "");
    await AsyncStorage.setItem('chooseOrganization', "");
    ///console.log("Entry=logout")
    EventEmitter.emit("broadcustMessage", {
        "logoutSuccess": true
    })

}

export const errorHandlingBlock = (error) => {
    if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        switch (status) {
            case 413:
                if (Array.isArray(responseData)) {
                    Toast.show(responseData[0].message);
                } else {
                    Toast.show(responseData.message);
                }
                break;

            case 409:
            case 504:
                if (Array.isArray(responseData) && responseData.length > 0) {
                    responseData.map((item) => Toast.show(item.message));
                } else {
                    Toast.show(responseData.message);
                }
                break;

            case 406:
                if (Array.isArray(responseData)) {
                    Toast.show(responseData[0].message);
                } else {
                    const message = responseData.message;
                    if (message === "Please make sure you have done full payments before checkout" ||
                        message.indexOf('Check-Out is not possible as payment of amount') !== -1) {
                        Toast.show(message);
                    } else {
                        Toast.show(message);
                    }
                }
                break;

            case 400:
                if (Array.isArray(responseData)) {
                    Toast.show(responseData[0].message);
                } else {
                    const message = responseData.message;
                    if (message !== "Customer details already updated") {
                        if (message.indexOf("To create a new property, please deactivate an existing branch.") !== -1 ||
                            message.indexOf("Cannot proceed booking as active list have more than") !== -1) {
                            Toast.show(message);
                        } else if (message === "Too many invalid credentials attempts. User temporarily locked. Please try again after few seconds." ||
                            message === "Invalid session for the user, session is expired.") {
                            Toast.show(message);
                            logoutApp();
                        } else if (message === "PreAuthentication failed with error Password has expired. Please re your password..") {
                            EventEmitter.emit("broadcustMessage", { "passwordExpire": true });
                        } else {
                            Toast.show(message);
                        }
                    }
                }
                break;

            case 404:
                if (Array.isArray(responseData)) {
                    const firstMessage = responseData[0].message;
                    if (firstMessage && firstMessage.indexOf('Please settle them individually first') === -1) {
                        Toast.show(firstMessage);
                    }
                } else {
                    Toast.show(responseData.message);
                }
                break;

            case 422:
                if (Array.isArray(responseData)) {
                    Toast.show(responseData[0].message);
                } else {
                    Toast.show(responseData.message);
                }
                break;

            case 401:
                if (responseData.message === "The incoming token has expired") {
                    Toast.show("Oops session has been expired!!!");
                    logoutApp();
                } else {
                    logoutApp();
                }
                break;

            default:
                if (responseData && responseData.message !== 'Customer details already updated') {
                    Toast.show(responseData.message);
                }
                break;
        }
    } else {
        if (error.message !== "Customer details already updated") {
            Toast.show(error.message);
        }
    }
};


// export const errorHandlingBlock = (error) => {
//     if (error.response) {

//         //console.log("error.response.data====", error.response.data)
//         // console.log("error.response.data====1", error.response.status)

//         if (error.response.status == 413) {
//             if (Array.isArray(error.response.data)) {
//                 //error.response.data.map((value)=>{
//                 Toast.show(error.response.data[0].message);
//                 //})
//             } else {
//                 Toast.show(error.response.data.message)
//             }
//         }

//         if (error.response.status == 409) {
//             if (Array.isArray(error.response.data)) {
//                 if (error.response.data.length > 0) {
//                     error.response.data.map((item) => {
//                         Toast.show(item.message);
//                     });
//                 }
//             } else {
//                 Toast.show(error.response.data.message);
//             }
//         }

//         if (error.response.status == 504) {
//             if (Array.isArray(error.response.data)) {
//                 if (error.response.data.length > 0) {
//                     error.response.data.map((item) => {
//                         Toast.show(item.message);
//                     });
//                 }
//             } else {
//                 Toast.show(error.response.data.message);
//             }
//         }

//         if (error.response.status == 406) {
//             if (Array.isArray(error.response.data)) {
//                 //error.response.data.map((value)=>{
//                 Toast.show(error.response.data[0].message);
//                 //})
//             } else {
//                 if (error.response.data.message == "Please make sure you have done full payments before checkout") {
//                     Toast.show(error.response.data.message);
//                 } else if (error.response.data.message.indexOf('Check-Out is not possible as payment of amount') !== -1) {
//                     Toast.show(error.response.data.message);
//                 } else {
//                     Toast.show(error.response.data.message);
//                 }
//             }
//         }
//         if (error.response.status == 400) {
//             if (Array.isArray(error.response.data)) {
//                 //error.response.data.map((value)=>{
//                 Toast.show(error.response.data[0].message);
//                 //})
//             } else {
//                 if (error.response.data.message != "Customer details already updated") {
//                     if (error.response.data.message.indexOf("To create a new property, please deactivate an existing branch.") !== -1) {
//                         Toast.show(error.response.data.message);
//                     } else if (error.response.data.message.indexOf("Cannot proceed booking as active list have more than") !== -1) {
//                         Toast.show(error.response.data.message);
//                     } else if (error.response.data.message === "Too many invalid credentials attempts. User temporarily locked. Please try again after few seconds." || error.response.data.message === "Invalid session for the user, session is expired.") {
//                         Toast.show(error.response.data.message);
//                         logoutApp();
//                     }
//                     else {
//                         //console.log("error.response.data.message===", error.response.data.message)
//                         if (error.response.data.message == "PreAuthentication failed with error Password has expired. Please re your password..") {
//                             EventEmitter.emit("broadcustMessage", {
//                                 "passwordExpire": true
//                             })
//                         }
//                         Toast.show(error.response.data.message)
//                     }
//                 }
//             }
//         }

//         if (error.response.status == 404) {
//             if (Array.isArray(error.response.data)) {
//                 //error.response.data.map((value)=>{
//                 if (error.response.data[0].message)
//                     if (error.response.data[0].message.indexOf('Please settle them individually first') == -1) {
//                         Toast.show(error.response.data[0].message);
//                     }
//                 //})
//             } else {
//                 Toast.show(error.response.data.message)
//             }
//         }
//         if (error.response.status == 422) {
//             if (Array.isArray(error.response.data)) {
//                 Toast.show(error.response.data[0].message);
//             } else {
//                 Toast.show(error.response.data.message)
//             }
//         }

//         if (error.response.status == 401) {
//             //Utility.toastNotifications(error.response.data.message, "Error", "error")
//             //{"message":"The incoming token has expired"}
//             if (error.response.data.message == "The incoming token has expired") {
//                 //Utility.toastNotifications("Session Expired", "Error", "error")
//                 Toast.show("Oops session has been expired!!!")
//                 logoutApp()
//             }
//             //console.log("call from ** errorHandlingBlock");
//             logoutApp()
//         } else if (error.response.data) {
//             if (error.response.data.message != 'Customer details already updated') {
//                 Toast.show(error.response.data.message)
//             }
//         }
//     } else {
//         if (error.message != "Customer details already updated") {
//             Toast.show(error.message)
//         }
//     }
// }