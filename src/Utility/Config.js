// Config.js
const environment = 'stage';
const stageUrl = 'https://stag-patient.oaktreeconnect.co.uk';
const prodUrl = 'https://patient.oaktreeconnect.co.uk';
// const stageUrl = 'https://stag-patient.oaktreeconnect.co.uk';
const Config = ({
    // baseURL: "https://ti1tk0ryn4.execute-api.ap-south-1.amazonaws.com/devv4/",
    baseURL: "https://stapi.oaktreeconnect.co.uk/graphql",
    // Office
    // baseURL: "http://192.168.1.125:8080/graphql",
    // baseURL: "http://122.160.113.252:8080/graphql",
    extendedUrl: 'api/',
    extendedUrlAuth: 'api/v1/auth/',
    thumbnailSize: {
        size_width: 200,
        size_height: 200
    },
    forgotPasswordLink: environment === 'stage' ?`${stageUrl}/forgot-password`:`${prodUrl}/forgot-password`,
    signUp: environment === 'stage' ?`${stageUrl}/signup`:`${prodUrl}/signup`,
    verificationUrl: environment === 'stage' ?`${stageUrl}/verification`:`${prodUrl}/verification`, 
    feedbackUrl: environment === 'stage' ?`https://www.oaktreeconnect.co.uk/feedback/`:`https://www.oaktreeconnect.co.uk/feedback/`,
    contactUsUrl: environment === 'stage' ?`https://www.oaktreeconnect.co.uk/contact-us/`:`https://www.oaktreeconnect.co.uk/contact-us/`,
    supportUrl: environment === 'stage' ?`https://www.oaktreeconnect.co.uk/help-and-faqs/`:`https://www.oaktreeconnect.co.uk/help-and-faqs/`,
    bookingUrl: environment === 'stage' ?`${stageUrl}/appointment/book-new-appointment`:`${prodUrl}/appointment/book-new-appointment`,
    videoCallLink: environment === 'stage' ?`${stageUrl}/appointment/mobile-video-consultation`:`${prodUrl}/appointment/mobile-video-consultation`,
    bookFollowUpUrl: environment === 'stage' ?`${stageUrl}/appointment/book-followup`:`${prodUrl}/appointment/book-followup/`
});

export default Config;
