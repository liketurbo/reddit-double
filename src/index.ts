import { MikroORM } from "mikro-orm";
import { __prod__ } from "./constants";
import MikroOrmConfig from "./mikro-orm.config";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import HelloResolver from "./resolvers/hello";
import PostResolver from "./resolvers/post";

const start = async () => {
  const orm = await MikroORM.init(MikroOrmConfig);
  await orm.getMigrator().up();

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: { em: orm.em },
  });

  server.listen({ port: 4000 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
};

start().catch((err) => {
  console.error(err);
});
