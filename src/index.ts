import { MikroORM } from "@mikro-orm/core";
import { Post } from "./entities/Posts";

import mikroOrmConfig from "./mikro-orm.config";

const main = async () => {
  // connects to db
  const orm = await MikroORM.init(mikroOrmConfig);
  //   runns migration
  await orm.getMigrator().up();

  const post = orm.em.create(Post, { title: "my first post" });
  await orm.em.persistAndFlush(post);
};

main().catch((error) => {
  console.log(error);
});
