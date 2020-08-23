import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Int,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import Post from "../entities/Post";
import { MyContext } from "../types";
import isAuthenticated from "../middleware/isAuthenticated";
import { getConnection } from "typeorm";

@InputType()
class PostInput {
  @Field()
  title: string;

  @Field()
  content: string;
}

@Resolver()
export default class PostResolver {
  @Query(() => [Post])
  posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => Date, { nullable: true }) cursor: string | null
  ): Promise<Post[]> {
    limit = Math.min(50, limit);

    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .orderBy('"createdAt"', "DESC")
      .take(limit);

    if (cursor) qb.where('"createdAt" < :cursor', { cursor });

    return qb.getMany();
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return (await Post.findOne(id)) || null;
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuthenticated)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { session }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creator: { id: session.userId } }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);

    if (!post) return null;

    await Post.update({ id }, { title });

    return post;
  }

  @Mutation(() => Boolean)
  async removePost(@Arg("id", () => Int) id: number): Promise<Boolean> {
    return (await Post.delete(id)).affected === 1;
  }
}
