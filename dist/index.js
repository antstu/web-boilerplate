"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@mikro-orm/core");
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const express_session_1 = __importDefault(require("express-session"));
const redis_1 = require("redis");
const constants_1 = require("./constants");
const main = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    await orm.getMigrator().up();
    const app = (0, express_1.default)();
    app.set("trust proxy", 1);
    app.set("Access-Control-Allow-Origin", "https://studio.apollographql.com");
    app.set("Access-Control-Allow-Credentials", true);
    let RedisStore = require("connect-redis")(express_session_1.default);
    let redisClient = (0, redis_1.createClient)({ legacyMode: true });
    redisClient.connect().catch(console.error);
    app.use((0, express_session_1.default)({
        name: "qid",
        store: new RedisStore({
            client: redisClient,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: "none",
            secure: true,
        },
        saveUninitialized: false,
        secret: "keyboard cat",
        resave: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({ em: orm.em.fork(), req, res }),
        introspection: !constants_1.__prod__,
    });
    const cors = {
        credentials: true,
        origin: ["http://localhost:4000", "https://studio.apollographql.com"],
    };
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors });
    app.listen(4000, () => {
        console.log(`🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`);
    });
};
main().catch((error) => {
    console.log(error);
});
//# sourceMappingURL=index.js.map