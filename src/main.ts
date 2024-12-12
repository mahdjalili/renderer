import { renderTemplate, magicResize } from "./utils/utils.js";
import { Elysia, t } from "elysia";
import { swagger } from '@elysiajs/swagger'

const port = process.env.PORT || 3000

const resize = new Elysia()
    .post("/resize", async ({ body }) => {
        let template = magicResize(body.template, body.data.width, body.data.height)
        return {template}
    }, {
        body: t.Object({
            template: t.Any(),
            data: t.Object({
                width: t.Number(),
                height: t.Number(),
            })
        }),
        response: t.Object({
            template: t.Any(),
        })
    })

const render = new Elysia()
    .post('/render', async ({ body }) => {
        let image = await renderTemplate(body.template);
        return { image }
    }, {
        body: t.Object({
            template: t.Any(),
        }),
        response: t.Object({
            image: t.String(),
        })
    })
    .post('/render/bulk', async ({ body }) => {
        const images = await Promise.all(
            body.templates.map(template => renderTemplate(template))
        );
        return { images }
    }, {
        body: t.Object({
            templates: t.Array(t.Any()),
            data: t.Object({
                name: t.String(),
            })
        }),
        response: t.Object({
            images: t.Array(t.String()),
        })
    })

const app = new Elysia()
    .use(swagger())
    .use(render)
    .use(resize)
	.listen(port)

console.log(`App started on port ${port}`)
