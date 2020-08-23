import Post from "./entities/Post";
import User from "./entities/User";
import { PRODUCTION } from "./constants";
import { MikroORMOptions } from "mikro-orm";
import path from "path";

const MikroOrmConfig = {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  dbName: "reddit-double",
  type: "postgresql",
  debug: !PRODUCTION,
  user: "Ramzan",
  password: "postgres",
  entities: [Post, User] as any,
} as MikroORMOptions;

export default MikroOrmConfig;
