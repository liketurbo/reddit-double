import DataLoader from "dataloader";
import User from "../entities/User";

const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);

    const userIdToUserMap: { [key: number]: User } = Object.create(null);

    users.forEach((user) => {
      userIdToUserMap[user.id] = user;
    });

    return userIds.map((userId) => userIdToUserMap[userId]);
  });

export default createUserLoader;
