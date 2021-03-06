import {
  Resolver,
  Mutation,
  InputType,
  Field,
  Arg,
  Ctx,
  ObjectType,
  Query,
  FieldResolver,
  Root,
} from "type-graphql";
import { MyContext } from "../types";
import User from "../entities/User";
import argon2 from "argon2";
import usernameValidation from "../validation/username";
import passwordValidation from "../validation/password";
import emailValidation from "../validation/email";
import usernameOrEmailValidation from "../validation/usernameOrEmail";
import sendEmail from "../utils/sendEmail";
import * as uuid from "uuid";
import { FORGET_PASSWORD_PREFIX } from "../constants";
import ms from "ms";

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

@ObjectType()
class OperationResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Boolean, { defaultValue: false })
  success?: Boolean = false;
}

@InputType()
class ChangePasswordInput {
  @Field()
  token: string;

  @Field()
  newPassword: string;
}

@Resolver(User)
export default class UserResolver {
  @FieldResolver(() => String)
  email(@Root() { id, email }: User, @Ctx() { session }: MyContext) {
    if (session.userId === id) return email;

    throw new Error("Not authorized");
  }

  @Mutation(() => OperationResponse)
  async changePassword(
    @Arg("input", () => ChangePasswordInput)
    { newPassword, token }: ChangePasswordInput,
    @Ctx() { redis, session }: MyContext
  ): Promise<OperationResponse> {
    const errors = passwordValidation(newPassword, "newPassword");

    if (errors.length)
      return {
        errors,
      };

    const key = `${FORGET_PASSWORD_PREFIX}:${token}`;

    const userId = await redis.get(key);

    if (!userId)
      return {
        errors: [{ field: "token", message: "Reset link expired" }],
      };

    const user = await User.findOne(+userId);

    if (!user)
      return {
        errors: [{ field: "token", message: "User no longer exists" }],
      };

    const passwordHash = await argon2.hash(newPassword);

    await User.update({ id: +userId }, { passwordHash });

    session.userId = user.id;

    await redis.del(key);

    return {
      success: true,
    };
  }

  @Mutation(() => OperationResponse)
  async forgotPassword(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Ctx() { redis }: MyContext
  ): Promise<OperationResponse> {
    const errors = usernameOrEmailValidation(usernameOrEmail);

    if (errors.length)
      return {
        errors,
      };

    const user = await User.findOne({
      where: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user)
      return {
        success: true,
      };

    const token = uuid.v4();

    await redis.set(
      `${FORGET_PASSWORD_PREFIX}:${token}`,
      user.id,
      "px",
      ms("1h")
    );
    await sendEmail(
      user.email,
      `<a href="http://localhost:1234/change-password/${token}">Reset password</a><br>Link will expire in 1 hour.`
    );

    return { success: true };
  }

  @Query(() => UserResponse)
  async me(@Ctx() { session }: MyContext): Promise<UserResponse> {
    try {
      if (session.userId) {
        const user = await User.findOneOrFail(session.userId);

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
    @Ctx() { session }: MyContext
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

      const user = await User.create({ username, passwordHash, email }).save();

      session.userId = user.id;

      return { user };
    } catch (err) {
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
    @Ctx() { session }: MyContext
  ): Promise<UserResponse> {
    const usernameOrEmailErrors = usernameOrEmailValidation(usernameOrEmail);
    const passwordErrors = passwordValidation(password);

    if (usernameOrEmailErrors.length || passwordErrors.length)
      return {
        errors: [...usernameOrEmailErrors, ...passwordErrors],
      };

    const user = await User.findOne({
      where: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
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
