import { ObjectType, Field, Int } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from "typeorm";
import User from "./User";

@ObjectType()
@Entity()
export default class Post extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column()
  title: string;

  @ManyToOne(() => User, (user) => user.posts, { nullable: false })
  creator: User;

  @Field()
  @Column()
  content: string;

  @Field()
  @Column({ default: 0 })
  points: number;
}
