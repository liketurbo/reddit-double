import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types";

const isAuthenticated: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.session.userId) throw new Error("Not authenticated");

  return next();
};

export default isAuthenticated;
