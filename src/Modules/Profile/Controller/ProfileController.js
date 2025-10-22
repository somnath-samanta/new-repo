import { get, post, put, del, patch } from '../../../Utility/Http';
import { verifyMFAPost, associateSoftwareTokenPut, verifySoftwareTokenPut, usrMfaAssignPut } from '../Model/ProfileModel';
import Config from '../../../Utility/Config';
import { store } from "../../../Store/configureStore"
import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { DEACTIVATE_PATIENT } from '../../../GraphQL/Mutation';



let state = store.getState();
let token = state.token;

let accesToken = token?.accesToken || "";

// Create an HTTP link for the API
const apolloHttpLink = createHttpLink({
    uri: Config.baseURL, // Your GraphQL API URL
});

// Create an authentication link that sets the Authorization header
const apolloAuthLink = setContext(async (_, { headers }) => {
    accesToken = token?.accesToken || "";

    let now = new Date();
    let utc_timestamp = Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
    );

    let currentTime = Math.floor(utc_timestamp / 1000);
    let tokenExpiryDate = token?.tokenExpiryDate || null;
    if (tokenExpiryDate != null && accesToken != null) {
        let tokenExpiryDate1 = parseInt(tokenExpiryDate);
        if (tokenExpiryDate1 > currentTime) {
            console.log("in auth not expired");
            // token not expird
        } else {
            console.log("Auth expired");
            // clearLocalStorage();
            accesToken = await refreshTokenFn();
        }
    }

    if (!accesToken) {
        console.log('No access token found or token needs refreshing.');
        // clearLocalStorage();
        accesToken = await refreshTokenFn();
    }

    return {
        headers: {
            ...headers,
            authorization: accesToken,
        },
    };
});


// Apollo Client with authentication
const clientAuth = new ApolloClient({
    link: apolloAuthLink.concat(apolloHttpLink), // Combine auth link and HTTP link
    cache: new InMemoryCache({
        addTypename: false,
    }),
});



export const verifyMFA = async (data, header) => {
    const response = await get(`${Config.extendedUrl}users/mfa/verify`, data, header);
    return verifyMFAPost(response);
};

export const associateSoftwareToken = async (headers) => {
    const response = await put(`${Config.extendedUrl}users/associate_software_token`, null, headers);
    return associateSoftwareTokenPut(response);
};
export const verifySoftwareToken = async (data, header) => {
    const response = await put(`${Config.extendedUrl}users/verify_software_token`, data, header);
    return verifySoftwareTokenPut(response);
};
export const usrMfaAssign = async (data, header) => {
    const response = await put(`${Config.extendedUrl}users/usr_mfa_assign`, data, header);
    return usrMfaAssignPut(response);
};

export const deactivatePatient = async (data) => {
    let response = {}
    try {
        const result = await clientAuth
            .mutate({
                mutation: DEACTIVATE_PATIENT,
                variables: data.variables,
            })
        response = result;
    } catch (err) {
        console.error("Mutation error:", err);
        return err;
        
    }
    return response;
};

