import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { log, logger, fileLogger } from "./utils/logger";

// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

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
    .use(fileLogger)
    .use(logger)
    .use(templates)
    .use(render)
    .use(resize)
    .use(convert)
    .get("/", "Hello World!", {
        detail: {
            hide: true,
        },
    });

async function main() {
    app.listen(port);

    if (process.env.NODE_ENV === "development") {
        log.info(`Server is running on http://localhost:${port}`);
    } else {
        log.info(`Server is running on port ${port}`);
    }
}

main()
    .then(async () => {
        // await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        // await prisma.$disconnect();
        process.exit(1);
    });
