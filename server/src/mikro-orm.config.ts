import { __prod__ } from "./constants";
import { Post } from "./entities/Posts";

import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    glob: "!(*.d).{js,ts}", //
  },
  entities: [Post, User],
  dbName: "lireddit",
  type: "postgresql",
  user: "postgres",
  password: "postgres",
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
