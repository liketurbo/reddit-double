import {
  Resolver,
  Mutation,
  InputType,
  Field,
  Arg,
  Ctx,
  ObjectType,
} from "type-graphql";
import { MyContext } from "src/types";
import User from "../entities/User";
import argon2 from "argon2";
import usernameValidation from "../validation/username";
import passwordValidation from "../validation/password";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export default class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("input") { username, password }: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    try {
      const usernameErrors = usernameValidation(username);
      const passwordErrors = passwordValidation(password);

      if (usernameErrors.length || passwordErrors.length)
        return {
          errors: [...usernameErrors, ...passwordErrors],
        };

      const passwordHash = await argon2.hash(password);

      const user = em.create(User, { username, passwordHash });
      await em.persistAndFlush(user);

      return { user };
    } catch (err) {
      em.clear();

      if (err.code === "23505")
        return {
          errors: [{ field: "username", message: "Username already in use" }],
        };

      console.error(err);

      return {
        errors: [{ field: "", message: "Internal server error" }],
      };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("input") { username, password }: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    try {
      const usernameErrors = usernameValidation(username);
      const passwordErrors = passwordValidation(password);

      if (usernameErrors.length || passwordErrors.length)
        return {
          errors: [...usernameErrors, ...passwordErrors],
        };

      const user = await em.findOneOrFail(User, { username });

      const valid = await argon2.verify(user.passwordHash, password);
      if (!valid) throw new Error("Invalid password");

      return { user };
    } catch {
      return {
        errors: [
          {
            field: "username,password",
            message: "Invalid password or username",
          },
        ],
      };
    }
  }
}
