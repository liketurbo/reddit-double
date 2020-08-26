import DataLoader from "dataloader";
import Updoot, { UpdootValue } from "../entities/Updoot";
import { In } from "typeorm";

const createUpdootValueLoader = (userId?: number) =>
  new DataLoader<number, UpdootValue | null>(async (postIds) => {
    const updoots = await Updoot.find({
      where: { userId, postId: In(postIds as number[]) },
    });

    const postIdToUpdootMap: {
      [key: number]: UpdootValue | null;
    } = Object.create(null);

    updoots.forEach((updoot) => {
      postIdToUpdootMap[updoot.postId] = updoot.value;
    });

    return postIds.map((postId) => postIdToUpdootMap[postId] || null);
  });

export default createUpdootValueLoader;
