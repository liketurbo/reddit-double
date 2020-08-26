import DataLoader from "dataloader";
import User from "../entities/User";

const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);

    const idUserMap: { [key: number]: User } = Object.create(null);

    users.forEach((user) => {
      idUserMap[user.id] = user;
    });

    return userIds.map((userId) => idUserMap[userId]);
  });

export default createUserLoader;
