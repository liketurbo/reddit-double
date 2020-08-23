import "reflect-metadata";
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

const RedisStore = connectRedis(session);

const redisClient = new Redis();

const start = async () => {
  const con = await createConnection({
    type: "postgres",
    database: "reddit-double",
    username: "Ramzan",
    password: "postgres",
    entities: [Post, User],
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*.*")],
  });

  await con.runMigrations();

  const app = express();

  app.use(
    session({
      name: "sid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      secret: "keyboard cat",
      resave: false,
      cookie: {
        maxAge: ms("10y"),
        httpOnly: true,
        secure: PRODUCTION,
        sameSite: "lax",
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
    }),
  });

  server.applyMiddleware({
    app,
    path: "/",
    cors: {
      origin: "http://localhost:1234",
      credentials: true,
      maxAge: ms("1d"),
    },
  });

  app.listen({ port: 4000 }, () => {
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
  });
};

start();
