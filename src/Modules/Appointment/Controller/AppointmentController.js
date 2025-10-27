//AppointmentController.js
import { appointmentListData, getPricingDetails, practitionerListData } from '../Model/AppointmentModel';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Config from '../../../Utility/Config';
import { gql } from '@apollo/client';
// import { client, clientAuth } from "../../../Utility/Client"

import { store } from "../../../Store/configureStore"

import { APPOINTMENT_LIST, POMS_APPOINTMENT_UPDATE, POMS_APPOINTMENT_UPDATE_MUTATION } from "../../../GraphQL/Mutation"
import { GET_PRICING_DETAILS, GET_PRACTITIONER_LIST } from "../../../GraphQL/Queries"
import { LogOut } from '../../../Utility/Components/LogOut';
import { setToken } from '../../Login/Actions/LoginAction';

const { clearLocalStorage } = LogOut();
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
    }else{
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

const refreshTokenFn = async() =>{
  const apolloHttpLink1 = createHttpLink({
    uri: Config.baseURL,
  });
  const client1 = new ApolloClient({
    link: apolloHttpLink1.concat(apolloHttpLink1),
    cache: new InMemoryCache({
      addTypename: false,
    }),
  });

    const result = await client1
      .mutate({
        mutation: gql`
        mutation{
          refreshToken(
            resource:{
              resourceType:User,
              email:"${state?.currentUserDetails?.email}"
                refreshToken:"${token?.refreshToken}"
            
            })
            {
              status
              tokenresult
            }
        }`,
      })

      let tokenresultJson = JSON.parse(result.data.refreshToken.tokenresult)

      // console.log("=====================================Result==========================",result.data.refreshToken.tokenresult);
      const tokenHash = {
          refreshToken: tokenresultJson.refreshToken.token,
          accesToken: tokenresultJson.accessToken.jwtToken,
          tokenExpiryDate: tokenresultJson.accessToken.payload.exp,
          loginUserId: token?.loginUserId
      };
      store.dispatch(setToken(tokenHash));
      return tokenresultJson.accessToken.jwtToken
}

//Appointment Screen function
export const getAppointmentList = async (data) => {
  // console.log("getAppointmentList", data);
  let response = {}
  try {
    const result = await clientAuth
      .query({
        query: APPOINTMENT_LIST,
        variables: { id: data.id },
        fetchPolicy: 'network-only', // Bypass cache to get fresh data
      })
    response = result;
  } catch (err) {
    console.log('getAppointmentList Error==>>>>>', err)
    return err;
    console.error("Mutation error:", err);
  }
  return appointmentListData(response);
};

export const pomsAppointmentUpdate = async (data) => {
  let response = {}
  try {
    const result = await clientAuth
      .mutate({
        mutation: POMS_APPOINTMENT_UPDATE,
        variables: {
          id: data.id.toString(),
          resource: {
            resourceType: "PomsAppointment", // or whatever the resource type is
            appointmentStatusType: 1,
            appointmentStatus: "VideoToken",
            id: data.id, // Add any other required fields for the resource
          }
        }
      })
    response = result;
  } catch (err) {
    return err;
    console.error("Mutation error:", err);
  }
  return response;
};

export const get_pricing_details = async (data) => {
  // console.log("getAppointmentList", data);
  let response = {}
  try {
    const result = await clientAuth
      .query({
        query: GET_PRICING_DETAILS
      })
    response = result;
  } catch (err) {
    return err;
    console.error("Mutation error:", err);
  }
  return getPricingDetails(response);
};

export const cancelAppointment = async (data) => {
  let response = {};
  try {
    const mutation = gql`
        mutation {
          PomsAppointmentUpdate(
            id: "${data.variables.id}",
            resource: {
              resourceType: PomsAppointment,
              appointmentStatusType: 2,
              appointmentStatus: "Cancelled",
              id: "${data.variables.id}",
              cancellationPrice: "${data.variables.cancellationPrice}",
              refundPrice: "${data.variables.refundPrice}",
              cancellationType: "${data.variables.cancellationType}"
            }
          ) {
            id
          }
        }
      `;

    const result = await clientAuth.mutate({
      mutation,
      errorPolicy: 'all', // Include error policy if needed
    });
    response = result;
  } catch (err) {
    return err;
    console.error("Mutation error:", err);
  }

  return response;
};

export const getPractitionerList  = async (data) => {
  // console.log("getAppointmentList", data);
  let response = {}
  try {
    const result = await clientAuth
      .query({
        query: GET_PRACTITIONER_LIST,
        variables: { searchText: "" },
        fetchPolicy: 'network-only', // Bypass cache to get fresh data
      })
    response = result;
  } catch (err) {
    return err;
    console.error("Mutation error:", err);
  }
  return practitionerListData(response);
};