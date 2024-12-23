import { Elysia, t } from "elysia";
import Controller from "../controllers/convert.controller";

const convert = new Controller();

export const route = new Elysia().post(
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
);

export default route;
