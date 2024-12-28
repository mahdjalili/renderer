import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { logger } from "./utils/logger";

import templates from "./routes/templates.route";
import render from "./routes/render.route";
import resize from "./routes/resize.route";
import convert from "./routes/convert.route";

const port = process.env.PORT || 3000;

const app = new Elysia()
    .use(
        cors({
            origin: "*",
            methods: "*",
            credentials: true,
        })
    )
    .use(swagger())
    .use(templates)
    .use(render)
    .use(resize)
    .use(convert)
    .get("/", "Hello World!", {
        detail: {
            hide: true,
        },
    })
    .listen(port);

logger(`App started on port ${port}`);
