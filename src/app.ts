import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

import { templates } from "./routes/templates.route";
import { render } from "./routes/render.route";
import { resize } from "./routes/resize.route";
import { convert } from "./routes/convert.route";

import { logger } from "./utils/logger";

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
    .use(convert)
    .use(templates)
    .use(render)
    .use(resize)
    .get("/", "Hello World")
    .listen(port);

logger(`App started on port ${port}`);
