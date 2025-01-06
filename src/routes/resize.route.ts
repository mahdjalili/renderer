import { Elysia, t } from "elysia";
import { magicResize } from "../services/resize.service";
import APIKeyMiddleware from "../middlewares/auth.middleware";

export const route = new Elysia()
    // .use(APIKeyMiddleware)
    .post(
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
            detail: {
                description: "Resize template",
                tags: ["Resize"],
                summary: "Resize template",
            },
        }
    );

export default route;
