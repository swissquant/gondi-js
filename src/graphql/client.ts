import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { withScalars } from "apollo-link-scalars";
import { buildSchema } from "graphql";

import { Credential, SessionToken } from "@/auth";
import { Wallet } from "@/blockchain";
import { apiUrl } from "@/const";
import lendingSchemaText from "@generated/graphql/lending-schema.graphql";

const lendingSchema = buildSchema(lendingSchemaText);

Object.assign(BigInt.prototype, {
  toJSON() {
    return this.toString();
  },
});

const typesMap = {
  datetime: {
    serialize: (parsed: unknown) => {
      if (parsed instanceof Date) return parsed.toISOString();
      return null;
    },
    parseValue: (raw: unknown) => {
      if (typeof raw === "string") return new Date(raw);
      return null;
    },
  },
  BigInt: {
    serialize: (parsed: unknown) => {
      if (typeof parsed === "bigint") return String(parsed);
      return null;
    },
    parseValue: (raw: unknown) => {
      if (typeof raw === "string") return BigInt(raw);
      return null;
    },
  },
};

const authLink = (credential: Credential) =>
  setContext(async (request) => {
    return await credential.authorizeRequest(request);
  });

const link = ApolloLink.from([
  withScalars({ schema: lendingSchema, typesMap }),
  createHttpLink({
    uri: ({ operationName }) =>
      `${apiUrl()}?operation=${encodeURIComponent(operationName)}`,
  }) as unknown as ApolloLink,
]);

export const apolloClient = (wallet: Wallet) => {
  const credential = new SessionToken({ wallet });
  return new ApolloClient({
    link: ApolloLink.from([authLink(credential), link]),
    defaultOptions: {
      query: {
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
    cache: new InMemoryCache({}),
  });
};
