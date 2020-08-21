import Post from "./entities/Post";
import User from "./entities/User";
import { __prod__ } from "./constants";
import { MikroORMOptions } from "mikro-orm";
import path from "path";

const MikroOrmConfig = {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  dbName: "reddit-double",
  type: "postgresql",
  debug: !__prod__,
  user: "Ramzan",
  password: "postgres",
  entities: [Post, User] as any,
} as MikroORMOptions;

export default MikroOrmConfig;
