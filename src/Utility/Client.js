// Client.js
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import Config from "./Config";
import { store } from "../Store/configureStore";

const httpLink = createHttpLink({
  uri: Config.baseURL,
});

const authLink = setContext((_, { headers }) => {
  const state = store.getState(); // ✅ always get fresh token
  const token = state?.token?.accesToken || "";

  if (!token) {
    console.log("No access token found.");
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
