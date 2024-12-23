import { Elysia, t } from "elysia";
import { renderTemplate } from "../services/render.service";

export const route = new Elysia()
    .post(
        "/render",
        async ({ body }) => {
            let result = await renderTemplate(body.template);
            return { result };
        },
        {
            body: t.Object({
                template: t.Any(),
            }),
            response: t.Object({
                result: t.String(),
            }),
        }
    )
    .post(
        "/render/bulk",
        async ({ body }) => {
            const results = await Promise.all(body.templates.map((template) => renderTemplate(template)));
            return { results };
        },
        {
            body: t.Object({
                templates: t.Array(t.Any()),
                data: t.Object({
                    name: t.String(),
                }),
            }),
            response: t.Object({
                results: t.Array(t.String()),
            }),
        }
    );

export default route;
