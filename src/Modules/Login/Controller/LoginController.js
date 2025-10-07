import { get, post, put, del, patch } from '../../../Utility/Http';
import { login, currentUser, forcePasswordChangeGet, forgotPasswordGet, changePasswordGet, updatedPasswordPatchApi, userOrganisationListGet, verifyMFAPost, associateSoftwareTokenPut, verifySoftwareTokenPut, usrMfaAssignPut, userRegistrationModel, confirmUserModel, resendVerifyCodeModel, forgotPasswordModel } from '../Model/LoginModel';
import Config from '../../../Utility/Config';
import { client } from "../../../Utility/Client"
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from "@apollo/client/link/context";

import { USER_LOGIN_MUTATION, USER_REGISTRATION_MUTATION, CONFIRM_USER_MUTATION, RESEND_VERIFY_CODE, FORGOT_PASSWORD, RESET_PASSWORD_MUTATION } from "../../../GraphQL/Mutation"
import { gql } from '@apollo/client';

export const loginGetApi = async (data) => {
    let response = {}
    try {
        const result = await client.mutate({
            mutation: USER_LOGIN_MUTATION,
            variables: { email: data.email, password: data.password },
        });
        //console.log("Mutation result:", result);
        response = result.data;  // Assuming the API response is inside `data`
    } catch (err) {
        return err;
        console.error("Mutation error:", err);
    }
    return login(response);
};
export const getCurrentUser = async () => {
    const response = await get(`${Config.extendedUrl}currentuser`, null);
    return currentUser(response);
};

export const forcePasswordChange = async (data, headers) => {
    const response = await post(`${Config.extendedUrl}users/userforcepasswordchange`, data, headers);
    return forcePasswordChangeGet(response);
};
// export const forgotPassword = async (data) => {
//     const response = await put(`${Config.extendedUrl}users/forgotpassword`, data, null);
//     return forgotPasswordGet(response);
// };
export const changePassword = async (data) => {
    const response = await put(`${Config.extendedUrl}users/confirmforgotpassword`, data, null);
    return changePasswordGet(response);
};
export const updatedPassword = async (data, headers) => {
    const response = await patch(`${Config.extendedUrlAuth}users/changepassword`, data, headers);
    return updatedPasswordPatchApi(response);
};
export const userOrganisationGet = async (data) => {
    const response = await get(`${Config.extendedUrl}admin/user_details`, data);
    return userOrganisationListGet(response);
};
export const verifyMFA = async (data, header) => {
    const response = await post(`${Config.extendedUrl}users/mfa/verify`, data, header);
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

const apolloAuthLink = setContext(async (request, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: "",
      },
    };
  });


export const userRegistration = async (data) => {
    // console.log("userRegistration", data);
    const apolloHttpLink = createHttpLink({
        uri: Config.baseURL,
    });
    const client = new ApolloClient({
        link: apolloAuthLink.concat(apolloHttpLink),
        cache: new InMemoryCache({
            addTypename: false,
        }),
    });

    let response = {}
    try {
        let dataHash =  {
            firstName: data.firstName, 
            lastName: data.lastName, 
            email: data.email, 
            phoneNumber: data.phoneNumber, 
            password: data.password, 
            year_of_birth: data.year_of_birth,
            guardianFirstName: data.guardianFirstName,
            guardianSurname: data.guardianSurname,
            relationtoPatient: data.relationtoPatient
        }

        // console.log("userRegistration--------------------------------------------------", dataHash);
      const result = await client
        .mutate({
          mutation: USER_REGISTRATION_MUTATION,
          variables: dataHash
        })
        response = result;
    } catch (err) {
      return err;
      console.error("Mutation error:", err);
    }
    return userRegistrationModel(response);
  };

export const confirmUser = async (data) => {
    // console.log("userRegistration", data);
    const apolloHttpLink = createHttpLink({
        uri: Config.baseURL,
    });
    const client = new ApolloClient({
        link: apolloAuthLink.concat(apolloHttpLink),
        cache: new InMemoryCache({
            addTypename: false,
        }),
    });

    let response = {}
    try {
        let dataHash =  {
            email: data.email, 
            confirmation_code: data.confirmation_code
        }

        // console.log("confirmUser--------------------------------------------------", dataHash);
      const result = await client
        .mutate({
          mutation: CONFIRM_USER_MUTATION,
          variables: dataHash
        })
        response = result;
    } catch (err) {
      return err;
      console.error("Mutation error:", err);
    }
    return confirmUserModel(response);
  };
export const resendVerifyCode = async (data) => {
    // console.log("userRegistration", data);
    const apolloHttpLink = createHttpLink({
        uri: Config.baseURL,
    });
    const client = new ApolloClient({
        link: apolloAuthLink.concat(apolloHttpLink),
        cache: new InMemoryCache({
            addTypename: false,
        }),
    });

    let response = {}
    try {
        let dataHash =  {
            email: data.email
        }

        console.log("ResendVerifyCode--------------------------------------------------", dataHash);
        const result = await client
        .mutate({
          mutation: RESEND_VERIFY_CODE,
          variables: dataHash
        })
        response = result;
    } catch (err) {
      return err;
      console.error("Mutation error:", err);
    }
    return resendVerifyCodeModel(response);
  };

export const forgotPassword = async (data) => {
    // console.log("userRegistration", data);
    const apolloHttpLink = createHttpLink({
        uri: Config.baseURL,
    });
    const client = new ApolloClient({
        link: apolloAuthLink.concat(apolloHttpLink),
        cache: new InMemoryCache({
            addTypename: false,
        }),
    });

    let response = {}
    try {
        const result = await client
        .mutate({
          mutation: FORGOT_PASSWORD,
          variables: {email: data.email}
        })
        response = result;
    } catch (err) {
      return err;
      console.error("Mutation error:", err);
    }
    return forgotPasswordModel(response);
  };

export const resetPassword = async (data) => {
    // console.log("userRegistration", data);
    const apolloHttpLink = createHttpLink({
        uri: Config.baseURL,
    });
    const client = new ApolloClient({
        link: apolloAuthLink.concat(apolloHttpLink),
        cache: new InMemoryCache({
            addTypename: false,
        }),
    });

    let response = {}
    try {
        const result = await client
        .mutate({
          mutation: RESET_PASSWORD_MUTATION,
          variables: {
                email: data.email,
                verificationCode: data.verificationCode,
                newPassword: data.newPassword,
                userType: "Patient"
            }
        })
        response = result;
    } catch (err) {
      return err;
      console.error("Mutation error:", err);
    }
    return forgotPasswordModel(response);
  };