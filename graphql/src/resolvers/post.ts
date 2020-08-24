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
  Info,
} from "type-graphql";
import Post from "../entities/Post";
import { MyContext } from "../types";
import isAuthenticated from "../middleware/isAuthenticated";
import { getConnection, QueryRunner } from "typeorm";
import { GraphQLResolveInfo } from "graphql";
import graphqlFields from "graphql-fields";
import Updoot, { UpdootValue } from "../entities/Updoot";

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
  contentSnippet(@Root() root: Post): String {
    return root.content.slice(0, 150);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuthenticated)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { session }: MyContext
  ): Promise<Boolean> {
    const qr = getConnection().createQueryRunner();
    await qr.connect();

    qr.startTransaction();

    try {
      const pending: Promise<any>[] = [];

      pending.push(
        qr.manager.insert(Updoot, {
          userId: session.userId,
          postId,
          value: value > 0 ? 1 : -1,
        })
      );

      pending.push(
        qr.manager.getRepository(Post).increment({ id: postId }, "points", 1)
      );

      await Promise.all(pending);

      await qr.commitTransaction();

      return true;
    } catch (err) {
      console.log(err);

      await qr.rollbackTransaction();

      return false;
    } finally {
      await qr.release();
    }
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => Date, { nullable: true }) cursor: Date | null,
    @Info() info: GraphQLResolveInfo
  ): Promise<PaginatedPosts> {
    limit = Math.min(50, limit) + 1;

    const qb = getConnection()
      .createQueryBuilder(Post, "p")
      .orderBy("p.createdAt", "DESC")
      .limit(limit);

    if ("creator" in graphqlFields(info).posts)
      qb.leftJoinAndSelect("p.creator", "c");

    if (cursor)
      qb.where('p."createdAt" < :cursor', {
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
