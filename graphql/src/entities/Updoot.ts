import { ObjectType, Field, Int } from "type-graphql";
import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import User from "./User";
import Post from "./Post";

export enum UpdootValue {
  UP = 1,
  DOWN = -1,
}

@ObjectType()
@Entity()
export default class Updoot extends BaseEntity {
  @Field(() => Int)
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.updoots)
  user: User;

  @Field(() => Int)
  @PrimaryColumn()
  postId: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.updoots)
  post: Post;

  @Field(() => Int)
  @Column({ type: "enum", enum: UpdootValue })
  value: UpdootValue;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;
}
