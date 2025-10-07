import { SET_TOKEN, SWIPEABLE_ROW, PREV_OPENED_ROW, TOUCH_STATE, SET_USER_DETAILS, LEAVE_DATA, ENVIRONMENT, SET_SIGN_UP_EMAIL } from '../Utility/AllActionTypes';

const mainReducer = (state = { "token": {}, "swipRow": null, "prev_row": null, currentUserDetails: {}, leaveData: [], environment: "dev" }, action) => {
    switch (action.type) {
        case SET_TOKEN:
            return { ...state, "token": action.payload };
        case SWIPEABLE_ROW:
            return { ...state, "swipRow": action.payload };
        case PREV_OPENED_ROW:
            return { ...state, "prev_row": action.payload };
        case TOUCH_STATE:
            return { ...state, "touchState": action.payload };
        case SET_USER_DETAILS:
            return { ...state, "currentUserDetails": action.payload };
        case LEAVE_DATA:
            return { ...state, "leaveData": action.payload };
        case ENVIRONMENT:
            return { ...state, "environment": action.payload };
        case SET_SIGN_UP_EMAIL:
            return { ...state, "signUpEmail": action.payload };
        default:
            return state;
    }
};

export default mainReducer;