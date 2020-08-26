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
import Updoot from "../entities/Updoot";
import User from "../entities/User";

@InputType()
class PostCreateInput {
  @Field()
  title: string;

  @Field()
  content: string;
}

@InputType()
class PostUpdateInput extends PostCreateInput {
  @Field(() => Int)
  id: number;
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

  @FieldResolver(() => User)
  creator(@Root() root: Post, @Ctx() { loaders }: MyContext): Promise<User> {
    return loaders.UserLoader.load(root.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  voteStatus(
    @Root() root: Post,
    @Ctx() { loaders }: MyContext
  ): Promise<Number | null> {
    return loaders.UpdootValueLoader.load(root.id);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuthenticated)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { session }: MyContext
  ): Promise<Boolean> {
    const updoot = await Updoot.findOne({
      where: { postId, userId: session.userId },
    });

    if (updoot?.value === value) return false;

    const qr = getConnection().createQueryRunner();
    await qr.connect();

    qr.startTransaction();

    try {
      const pending: Promise<any>[] = [];

      if (updoot)
        pending.push(
          qr.manager.update(
            Updoot,
            {
              postId,
              userId: session.userId,
            },
            {
              value: value > 0 ? 1 : -1,
            }
          )
        );
      else
        pending.push(
          qr.manager.insert(Updoot, {
            userId: session.userId,
            postId,
            value: value > 0 ? 1 : -1,
          })
        );

      pending.push(
        value > 0
          ? qr.manager
              .getRepository(Post)
              .increment({ id: postId }, "points", updoot ? 2 : 1)
          : qr.manager
              .getRepository(Post)
              .decrement({ id: postId }, "points", updoot ? 2 : 1)
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
    @Arg("cursor", () => Date, { nullable: true }) cursor: Date | null
  ): Promise<PaginatedPosts> {
    limit = Math.min(50, limit) + 1;

    const qb = getConnection()
      .createQueryBuilder(Post, "p")
      .orderBy("p.createdAt", "DESC")
      .limit(limit);

    if (cursor)
      qb.where('p."createdAt" < :cursor', {
        cursor,
      });

    let posts = await qb.getMany();

    return {
      posts: posts.length === limit ? posts.slice(0, -1) : posts,
      hasMore: posts.length === limit,
    };
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    console.log(id);

    return (await Post.findOne(id)) || null;
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuthenticated)
  async createPost(
    @Arg("input") input: PostCreateInput,
    @Ctx() { session }: MyContext
  ): Promise<Post> {
    return Post.create({ ...input, creator: { id: session.userId } }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuthenticated)
  async updatePost(
    @Arg("input") { id, title, content }: PostUpdateInput,
    @Ctx() { session }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post, { title, content })
      .where("id = :id AND creatorId = :userId", {
        id,
        userId: session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuthenticated)
  async removePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { session }: MyContext
  ): Promise<Boolean> {
    return (
      (await Post.delete({ id, creatorId: session.userId })).affected === 1
    );
  }
}
