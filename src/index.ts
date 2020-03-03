import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildFederatedSchema } from "./helpers/buildFederatedSchema";
import {
  Arena,
  Challenge,
  resolveChallengeReference
} from "./schema/ChallengeSchema";
import express_user_ip from "express-ip";
//?  decorators metadata

import connectDB from "./DB/index";
import { ChallengeResolver } from "./resolvers/ChallengeResolver";

const PORT: string = process.env.PORT || "3000";

(async () => {
  try {
    // Initialize the app
    const app = express();
    app.use(express_user_ip().getIpInfoMiddleware); //* get the user location data

    const server = new ApolloServer({
      schema: await buildFederatedSchema(
        {
          resolvers: [ChallengeResolver],
          orphanedTypes: [Arena, Challenge]
        },
        {
          Challenge: { __resolveReference: resolveChallengeReference }
        }
      ),
      context: req => req,
      formatError: err => {
        return err;
      }
    });
    // The GraphQL endpoint

    server.applyMiddleware({ app, path: "/graphql" });

    // Start the server
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Go to http://localhost:${PORT}/graphiql to run queries!`);
    });
  } catch (error) {
    console.log(error);
  }
})();