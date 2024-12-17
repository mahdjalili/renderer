import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

import { renderTemplate, magicResize } from "./utils/utils.js";

const templatesFile = Bun.file(`./src/templates/templates.json`, {
    type: "application/json",
});
const templates = await templatesFile.json();

const port = process.env.PORT || 3000;

const template = new Elysia().get(
    "/templates/:id?",
    async ({ params: { id } }) => {
        if (id) {
            return { templates: [templates[id]] };
        }

        return { templates: templates };
    },
    {
        response: t.Object({
            templates: t.Array(t.Any()),
        }),
    }
);

const resize = new Elysia().post(
    "/resize",
    async ({ body }) => {
        let template = magicResize(body.template, body.data.width, body.data.height);
        return { template };
    },
    {
        body: t.Object({
            template: t.Any(),
            data: t.Object({
                width: t.Number(),
                height: t.Number(),
            }),
        }),
        response: t.Object({
            template: t.Any(),
        }),
    }
);

const render = new Elysia()
    .post(
        "/render",
        async ({ body }) => {
            let image = await renderTemplate(body.template);
            return { image };
        },
        {
            body: t.Object({
                template: t.Any(),
            }),
            response: t.Object({
                image: t.String(),
            }),
        }
    )
    .post(
        "/render/bulk",
        async ({ body }) => {
            const images = await Promise.all(body.templates.map((template) => renderTemplate(template)));
            return { images };
        },
        {
            body: t.Object({
                templates: t.Array(t.Any()),
                data: t.Object({
                    name: t.String(),
                }),
            }),
            response: t.Object({
                images: t.Array(t.String()),
            }),
        }
    );

const app = new Elysia()
    .use(
        cors({
            origin: "*",
            methods: "*",
            credentials: true, // Allow credentials (cookies, etc.)
        })
    )
    .use(swagger())
    .use(template)
    .use(render)
    .use(resize)
    .get("/", "Hello World")
    .listen(port);

console.log(`App started on port ${port}`);
