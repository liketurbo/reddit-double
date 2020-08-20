import { MikroORM } from "mikro-orm";
import { __prod__ } from "./constants";
import MikroOrmConfig from "./mikro-orm.config";
import Post from "./entities/Post";

const start = async () => {
  const orm = await MikroORM.init(MikroOrmConfig);

  await orm.getMigrator().up();

  const post = orm.em.create(Post, { title: "Hello, World!" });
  orm.em.persistAndFlush(post);
};

start().catch((err) => {
  console.error(err);
});
