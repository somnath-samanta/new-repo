import { questionnaireListData } from '../Model/QuestionnaireModel';
import { Questionnaire, PatientQuestionnaireUpdate } from "../../../GraphQL/Mutation"
import { QUERY_GET_PATIENT_QUESTIONNAIRE } from "../../../GraphQL/Queries"
import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import Config from '../../../Utility/Config';
// import { client, clientAuth } from "../../../Utility/Client"

import { store } from "../../../Store/configureStore"
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
    } else {
      console.log("auth expired");
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

// Helper to recursively remove __typename from variables sent to GraphQL mutations
const stripTypenames = (value) => {
  if (Array.isArray(value)) {
    return value.map(stripTypenames);
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((acc, key) => {
      if (key === '__typename') return acc;
      acc[key] = stripTypenames(value[key]);
      return acc;
    }, {});
  }
  return value;
};

const refreshTokenFn = async () => {
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

//Questionnaire Screen function
export const getQuestionnaireList = async (data) => {
  // console.log("getQuestionnaireList-----", data);
  let response = {}
  try {
    let variables = {
      id: data.id,
      fetchingFrom: 'APP',
    };
    if (data.timeline) {
      variables.timeline = data.timeline;
    }
    if (data.sendBy) {
      variables.assignedBy = data.sendBy;
    }
    if (data.keyword) {
      variables.questionnaireName = data.keyword;
    }
    const result = await clientAuth
      .query({
        query: Questionnaire,
        variables: variables,
        fetchPolicy: 'network-only',
      })
    response = result;
  } catch (err) {
    console.log('getQuestionnaireList Error==>>>>>', err)
    return err
  }
  return questionnaireListData(response);
};

//Questionnaire Screen function
export const updatePatientQuestionnaireUpdate = async (data) => {
  // console.log("getQuestionnaireList", data);

  let response = {}
  try {
    // Clean variables to remove any __typename that the server will reject in input types
    const cleanedVariables = stripTypenames(data.variables || {});
    const result = await clientAuth
      .mutate({
        mutation: PatientQuestionnaireUpdate,
        variables: cleanedVariables,
      })
    response = result;
  } catch (err) {
    console.log('updatePatientQuestionnaireUpdate Error==>>>>>', err)
    return err;
  }
  return response;
};

// Fetch Patient Questionnaire with filters
export const getPatientQuestionnaireName = async (data) => {
  // console.log("getPatientQuestionnaire", data);
  let response = {}
  try {
    const result = await clientAuth.query({
      query: QUERY_GET_PATIENT_QUESTIONNAIRE,
      variables: {
        id: data.id,
        timeline: data.timeline || null,
        fetchingFrom: data.fetchingFrom || null,
        assignedBy: data.assignedBy || null,
        questionnaireName: data.questionnaireName || null,
      },
      fetchPolicy: 'network-only', // Ensures fresh data from server
    });
    response = result;
  } catch (err) {
    console.log('getPatientQuestionnaire Error==>>>>>', err);
    return err;
  }
  return response;
};
