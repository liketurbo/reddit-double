import {
  Resolver,
  Mutation,
  InputType,
  Field,
  Arg,
  Ctx,
  ObjectType,
  Query,
} from "type-graphql";
import { MyContext } from "src/types";
import User from "../entities/User";
import argon2 from "argon2";
import usernameValidation from "../validation/username";
import passwordValidation from "../validation/password";
import emailValidation from "../validation/email";
import usernameOrEmailValidation from "../validation/usernameOrEmail";

@InputType()
class LoginInput {
  @Field()
  usernameOrEmail: string;

  @Field()
  password: string;
}

@InputType()
class RegisterInput {
  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  email: string;
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
  @Query(() => UserResponse)
  async me(@Ctx() { session, em }: MyContext): Promise<UserResponse> {
    try {
      if (session.userId) {
        const user = await em.findOneOrFail(User, { id: session.userId });

        return {
          user,
        };
      }

      throw new Error("Session doesn't have userId");
    } catch (err) {
      return {
        errors: [{ field: "user", message: "User is not authenticated" }],
      };
    }
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { session }: MyContext): Promise<Boolean> {
    return new Promise((res) =>
      session.destroy((err) => {
        if (err) {
          console.error(err);
          res(false);
        }

        res(true);
      })
    );
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("input") { username, password, email }: RegisterInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    try {
      const usernameErrors = usernameValidation(username);
      const passwordErrors = passwordValidation(password);
      const emailErrors = emailValidation(email);

      if (usernameErrors.length || passwordErrors.length || emailErrors.length)
        return {
          errors: [...usernameErrors, ...passwordErrors, ...emailErrors],
        };

      const passwordHash = await argon2.hash(password);

      const user = em.create(User, { username, passwordHash, email });
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
    @Arg("input") { usernameOrEmail, password }: LoginInput,
    @Ctx() { em, session }: MyContext
  ): Promise<UserResponse> {
    const usernameOrEmailErrors = usernameOrEmailValidation(usernameOrEmail);
    const passwordErrors = passwordValidation(password);

    if (usernameOrEmailErrors.length || passwordErrors.length)
      return {
        errors: [...usernameOrEmailErrors, ...passwordErrors],
      };

    const user = await em.findOne(User, {
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user)
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Invalid username or email",
          },
        ],
      };

    const valid = await argon2.verify(user.passwordHash, password);

    if (!valid)
      return {
        errors: [
          {
            field: "password",
            message: "Invalid password",
          },
        ],
      };

    session.userId = user.id;

    return { user };
  }
}
