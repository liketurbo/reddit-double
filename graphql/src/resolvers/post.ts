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
  FieldResolver,
  Root,
  ObjectType,
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

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];

  @Field()
  hasMore: Boolean;
}

@Resolver(Post)
export default class PostResolver {
  @FieldResolver(() => String)
  contentSnippet(@Root() root: Post) {
    return root.content.slice(0, 150);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => Date, { nullable: true }) cursor: Date | null
  ): Promise<PaginatedPosts> {
    limit = Math.min(50, limit) + 1;

    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .orderBy('"createdAt"', "DESC")
      .take(limit);

    if (cursor)
      qb.where('"createdAt" < :cursor', {
        cursor,
      });

    const posts = await qb.getMany();

    return {
      posts: posts.length === limit ? posts.slice(0, -1) : posts,
      hasMore: posts.length === limit,
    };
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
