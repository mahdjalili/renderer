import { Elysia, t } from "elysia";
import { paginate, paginateType } from "../utils/paginate";
import { getTemplates } from "../models/templates.model";
import { convertPSDToTemplate } from "../services/psd.service";

const templatesList = await getTemplates();

export const templates = new Elysia()
    .get(
        "/templates",
        ({ query: { page = 1, limit = 10 } }) => {
            return paginate(templatesList, page, limit);
        },
        {
            query: t.Object({
                page: t.Optional(t.Number()),
                limit: t.Optional(t.Number()),
            }),
            response: paginateType,
        }
    )
    .get(
        "/templates/:id",
        async ({ params: { id } }) => {
            return [templatesList[id]];
        },
        {
            params: t.Object({
                id: t.Number(),
            }),
            response: t.Array(t.Any()),
        }
    )
    .get(
        "/templates/converter",
        async ({ body }) => {
            const psdFile = await Bun.file("./public/single.psd").arrayBuffer();
            const templates = convertPSDToTemplate(psdFile);
            return { templates };
        },
        {
            // body: t.Object({
            //     psd: t.String(),
            // }),
            response: t.Object({
                templates: t.Array(t.Any()),
            }),
        }
    );
