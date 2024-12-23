import { Elysia, t } from "elysia";
import { convertPSDToTemplate } from "../services/psd.service";

export const convert = new Elysia().get(
    "/convert/psd",
    async () => {
        const psdFile = await Bun.file("./public/single.psd").arrayBuffer();
        const template = convertPSDToTemplate(psdFile);
        return template;
    },
    {
        // body: t.Object({
        //     psd: t.String(),
        // }),
        response: t.Any(),
    }
);
