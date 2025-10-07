import { SET_TOKEN, SET_USER_DETAILS, LEAVE_DATA, ENVIRONMENT, SET_SIGN_UP_EMAIL } from '../../../Utility/AllActionTypes';


export const setToken = (token) => ({
    type: SET_TOKEN,
    payload: token,
});


// export const setUserDetails = (value) => {
//     return (dispatch) => {
//         return new Promise((resolve) => {
//             dispatch({
//                 type: SET_USER_DETAILS,
//                 payload: value
//             });
//             resolve(); // Resolve the promise after dispatch
//         });
//     };
// };

export const setUserDetails = (value) => ({
    //console.log("payload value=============",value)
    type: SET_USER_DETAILS,
    payload: value
})
export const setLeaveDetails = (value) => async (dispatch) => {
    //console.log("payload value=============",value)
    dispatch({
        type: LEAVE_DATA,
        payload: value
    });
}
export const setEnvironment = (value) => async (dispatch) => {
    //console.log("payload value=============",value)
    dispatch({
        type: ENVIRONMENT,
        payload: value
    });
}

export const setSignUpEmail = (value) => ({
    //console.log("payload value=============",value)
    type: SET_SIGN_UP_EMAIL,
    payload: value
})

// export const setSignUpEmail = (email) => ({
//     type: SET_SIGN_UP_EMAIL,
//     payload: email,
// });


