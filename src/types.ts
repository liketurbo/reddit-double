import { EntityManager, IDatabaseDriver, Connection } from "mikro-orm";

export interface MyContext {
  em: EntityManager<IDatabaseDriver<Connection>>;
  session: Express.Session;
}
