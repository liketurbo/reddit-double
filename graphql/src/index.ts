import "reflect-metadata";
import dotenv from "dotenv";
import { PRODUCTION } from "./constants";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import HelloResolver from "./resolvers/hello";
import PostResolver from "./resolvers/post";
import UserResolver from "./resolvers/user";
import express from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import ms from "ms";
import { MyContext } from "./types";
import Redis from "ioredis";
import { createConnection } from "typeorm";
import Post from "./entities/Post";
import User from "./entities/User";
import path from "path";
import Updoot from "./entities/Updoot";
import createUserLoader from "./loaders/createUserLoader";
import createUpdootValueLoader from "./loaders/createUpdootValueLoader";

dotenv.config({
  path: PRODUCTION ? ".env.production" : ".env",
});

const RedisStore = connectRedis(session);

const redisClient = new Redis(process.env.REDIS_URL);

const start = async () => {
  const con = await createConnection({
    type: "postgres",
    entities: [Post, User, Updoot],
    logging: true,
    synchronize: !PRODUCTION,
    migrations: [
      path.join(
        __dirname,
        `./migrations/*${PRODUCTION ? "PRODUCTION" : "DEVELOPMENT"}.*`
      ),
    ],
    url: process.env.DATABASE_URL,
  });

  await con.runMigrations();

  const app = express();

  app.use(
    session({
      name: "sid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      cookie: {
        maxAge: ms("10y"),
        httpOnly: true,
        secure: PRODUCTION,
        sameSite: "lax",
        domain: PRODUCTION ? ".10mem.ru" : undefined,
      },
      saveUninitialized: false,
    })
  );

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req }): MyContext => ({
      session: req.session as Express.Session,
      redis: redisClient,
      loaders: {
        UserLoader: createUserLoader(),
        UpdootValueLoader: createUpdootValueLoader(req.session?.userId),
      },
    }),
  });

  server.applyMiddleware({
    app,
    path: "/",
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
      maxAge: ms("1d"),
    },
  });

  app.listen(+process.env.PORT, () => {
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
  });
};

start();
