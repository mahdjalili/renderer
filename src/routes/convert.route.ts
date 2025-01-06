import { Elysia, t } from "elysia";
import { psdUrlToTemplate, replaceTemplateVariables } from "../services/convert.service";
import APIKeyMiddleware from "../middlewares/auth.middleware";

export const route = new Elysia()
    // .use(APIKeyMiddleware)
    .post(
        "/convert/psd",
        async ({ body }: { body: { psdUrl: string } }) => {
            return await psdUrlToTemplate(body.psdUrl);
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
        async ({ body }: { body: { template: any; replacements: any } }) => {
            return await replaceTemplateVariables(body.template, body.replacements);
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
