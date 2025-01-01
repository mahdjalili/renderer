import { Elysia, t } from "elysia";
import Controller from "../controllers/convert.controller";
import APIKeyMiddleware from "../middlewares/auth.middleware";

const convert = new Controller();

export const route = new Elysia()
    .use(APIKeyMiddleware)
    .post(
        "/convert/psd",
        async ({ body }) => {
            return await convert.convertPsdToTemplate(body.psdUrl);
        },
        {
            body: t.Object({
                psdUrl: t.String(),
            }),
            response: t.Any(),
            detail: {
                description: "Convert PSD to template",
                tags: ["Convert"],
                summary: "Convert PSD to template",
            },
        }
    )
    .post(
        "/convert/replacement",
        async ({ body }) => {
            return await convert.replaceTemplateVariables(body.template, body.replacements);
        },
        {
            body: t.Object({
                template: t.Any(),
                replacements: t.Any(),
            }),
            response: t.Any(),
            detail: {
                description: "Convert template with replacement",
                tags: ["Convert"],
                summary: "Convert template with replacement",
            },
        }
    );

export default route;
