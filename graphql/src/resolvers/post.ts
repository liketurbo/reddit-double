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
  posts(): Promise<Post[]> {
    return Post.find();
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
