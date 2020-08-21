import { Entity, PrimaryKey, Property } from "mikro-orm";
import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
@Entity()
export default class Post {
  @Field(() => Int)
  @PrimaryKey()
  id: number;

  @Field(() => Date)
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(() => Date)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({ type: "text" })
  title: string;
}
