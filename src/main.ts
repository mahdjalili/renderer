import { renderTemplate, magicResize } from "./utils/utils.js";
import { Elysia, t } from "elysia";
import { swagger } from '@elysiajs/swagger'

const render = new Elysia()
    .post('/render', async ({ body }) => {
        let image = await renderTemplate(body.template);
        return { image }
    }, {
        body: t.Object({
            template: t.Any(),
            data: t.Object({
                name: t.String(),
            })
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
	.listen(3000)
    .onStart(() => {
        console.log("App Started on port 3000")
    })

