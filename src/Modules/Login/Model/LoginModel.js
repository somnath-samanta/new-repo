export const login = (loginData) => {
    // console.log("response====login", loginData)
    let response = loginData;
    
    let loginResData = {};
    if (response) {
        /*if (response.success) {
            //first time new password set
            if (response.data.hasOwnProperty('challengeName') && response.data.challengeName == 'NEW_PASSWORD_REQUIRED') {
                loginResData = {
                    "success": response.success,
                    "data": {
                        "challengeName": response.data.challengeName,
                        "session": response.data.Session,
                        "username": response.data.username
                    }
                }
            } else {
                loginResData = {
                    "success": response.success,
                    "data": {
                        "idToken": response.data.idToken,
                        "challengeName": response.data.challengeName,
                        "tokenType": response.data.tokenType,
                        "accessToken": response.data.accessToken,
                        "expiresIn": response.data.expiresIn,
                        "refreshToken": response.data.refreshToken,
                        "session": response.data.hasOwnProperty('Session') ? response.data.Session : ""

                    }
                }
            }
        } else {
            loginResData = {
                "success": response.success,
                "message": response.message
            }
        }
        */

        if (response.UserLogin.status === 1) {
            let details = JSON.parse(response.UserLogin.details);
            let tokenData =JSON.parse(response.UserLogin.tokenresult);

           // console.log("--------------------------------------------------", details);

            loginResData = {
                "message": response.UserLogin.message,
                "status": response.UserLogin.status,
                "data": {
                    "idToken": "",
                    "challengeName": "",
                    "tokenType": "",
                    "accessToken": tokenData['accessToken']['jwtToken'],
                    "expiresIn": tokenData['accessToken']['payload']['exp'],
                    "refreshToken": tokenData['refreshToken']['token'],
                    "session": "",
                    "loginUserDetails": details

                }
            }
        }else if (response.UserLogin.status === 0) {
            loginResData = {
                "message": response.UserLogin.message,
                "status": response.UserLogin.status,
                "code": response.UserLogin.code,
                "data": {
                    "idToken": "",
                    "challengeName": "",
                    "tokenType": "",
                    "accessToken": "",
                    "expiresIn": "",
                    "refreshToken": "",
                    "session": "",
                    "loginUserDetails": ""

                }
            }
        }
    }
    return loginResData;
}

export const currentUser = (currentUserData) => {
    let response = currentUserData.data;
    let currentUserResData = {};
    if (response) {
        if (response.success) {
            currentUserResData = {
                "success": response.success,
                "data": {
                    "id": response.data.id,
                    "user_details": {
                        "first_name": response.data.user_details.first_name,
                        "last_name": response.data.user_details.last_name,
                        "user_email": response.data.user_details.user_email,
                        "active": response.data.user_details.active,
                        "profile_img_url": response.data.user_details.profile_img_url,
                        "role_id": response.data.user_details.role_id,
                        "role_name": response.data.user_details.role_name.toLowerCase(),
                        "user_type": response.data.user_details.user_type,
                        "contact_number": response.data.user_details.contact_number,
                        "role_permission": response.data.user_details.role_permission,
                        "hotel_id": response.data.user_details.hotel_id,
                        "hotel_name": response.data.user_details.hotel_name,
                        "is_subscribed": response.data.user_details.is_subscribed,
                        "version": response.data.user_details.version,
                        "is_beneficiary_included": response.data.user_details.is_beneficiary_included,
                        "user_full_hotel_agency_details": response.data.user_details.user_full_hotel_agency_details,
                        "mfa": response.data.user_details.hasOwnProperty("mfa") ? response.data.user_details.mfa : ""
                    }
                }
            }
        } else {
            currentUserResData = {
                "success": response.success,
                "message": response.message
            }
        }
    }
    return currentUserResData;
}

export const forcePasswordChangeGet = (forcePasswordChangeData) => {
    return forcePasswordChangeData.data
}

export const forgotPasswordGet = (forgotPasswordData) => {
    let response = forgotPasswordData.data;
    //console.log("forgotPasswordData response==============>",response)
    let resData = {};
    if (response) {
        if (response.success) {
            resData = {
                "success": response.success,
                "message": response.message
            }
        } else {
            resData = {
                "success": response.success,
                "message": response.message
            }
        }
    }
    return resData;
}

export const changePasswordGet = (changePasswordData) => {
    let response = changePasswordData.data;
    //console.log("changePasswordData response==============>",response)
    let changePassworResdData = {};
    if (response) {
        if (response.success) {
            changePassworResdData = {
                "success": response.success,
                "message": response.message
            }
        } else {
            changePassworResdData = {
                "success": response.success,
                "message": response.message
            }
        }
    }
    return changePassworResdData
}
export const updatedPasswordPatchApi = (data) => {
    return data.data
}
export const userOrganisationListGet = (data) => {
    return data.data
}
export const verifyMFAPost = (data) => {
    return data.data
}
export const associateSoftwareTokenPut = (data) => {
    return data.data
}
export const verifySoftwareTokenPut = (data) => {
    return data.data
}
export const usrMfaAssignPut = (data) => {
    return data.data
}
export const userRegistrationModel = (result) => {
    // console.log("data:  :", result);
    return result.data.UserRegistration
}
export const confirmUserModel = (result) => {
    // console.log("data:  :", result);
    return result.data.ConfirmUser
}
export const resendVerifyCodeModel = (result) => {
    console.log("data:  :", result);
    return result.data.ResendConfirmation
}
export const forgotPasswordModel = (result) => {
    console.log("data:  :", result);
    return result.data
}