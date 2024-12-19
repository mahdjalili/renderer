import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

import { templates } from "./routes/templates.route";
import { render } from "./routes/render.route";
import { resize } from "./routes/resize.route";

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
    .get("/", "Hello World")
    .listen(port);

console.log(`App started on port ${port}`);
