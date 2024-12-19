import { Elysia, t } from "elysia";
import { magicResize } from "../services/resize.service";

export const resize = new Elysia().post(
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
