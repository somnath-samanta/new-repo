import { appointmentListData } from '../Model/DocumentManagementModel';
import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Config from '../../../Utility/Config';
import { SAVE_PATIENT_DOCUMENT } from "../../../GraphQL/Mutation"
// import { client, clientAuth } from "../../../Utility/Client"

import { store } from "../../../Store/configureStore"

import { APPOINTMENT_LIST } from "../../../GraphQL/Mutation"
import { MY_DOCUMENT_QUERY } from "../../../GraphQL/Queries"
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
export const getMyDocumentList = async (data) => {
    let response = {}
    try {
        let variables = {
            id: data.id,
            fetchingFrom: 'APP'
        }
        if(data.timeline && data.timeline != ""){
            variables.timeline = data.timeline;
        }
        if(data.documentType && data.documentType != ""){
            variables.documentType = data.documentType;
        }
        // console.log("variables", variables);
        const result = await clientAuth.query({
            query: MY_DOCUMENT_QUERY,
            variables: variables,
            fetchPolicy: 'network-only',
        });
        response = result;
    } catch (err) {
        console.error("Query error in getMyDocumentList:", err);
        // Return a safe empty structure to avoid crashes in callers
        return { PomsPatientDocumentList: [] };
    }
    return appointmentListData(response);
};

//Questionnaire Screen function
export const savePatientDocumentsMutation = async (data) => {
    // console.log("getQuestionnaireList", data);
    
    let response = {}
    try {
        const result = await clientAuth
        .mutate({
            mutation: SAVE_PATIENT_DOCUMENT,
            variables: data.variables, 
        })
        response = result;          
    } catch (err) {
        return err;
        console.error("Mutation error:", err);
    }
    return response;
};
