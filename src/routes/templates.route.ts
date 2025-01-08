import { Elysia, t } from "elysia";

import { getTemplates } from "../models/templates.model";
import APIKeyMiddleware from "../middlewares/auth.middleware";

import { paginate, paginateType } from "../utils/paginate";
import { log } from "../utils/logger";

const templatesList = await getTemplates();

export const route = new Elysia()
    .use(APIKeyMiddleware)
    .get(
        "/templates",
        async ({ query: { page = 1, limit = 10 } }) => {
            return paginate(templatesList, page, limit);
        },
        {
            query: t.Object({
                page: t.Optional(t.Number()),
                limit: t.Optional(t.Number()),
            }),
            response: paginateType,
            detail: {
                description: "Get all templates",
                tags: ["Templates"],
                summary: "Get all templates",
            },
        }
    )
    .get(
        "/templates/:id",
        async ({ params: { id } }: { params: { id: number } }) => {
            const template = templatesList[id];
            return template;
        },
        {
            params: t.Object({
                id: t.Number(),
            }),
            response: t.Any(),
            detail: {
                description: "Get a template",
                tags: ["Templates"],
                summary: "Get a template",
            },
        }
    );

export default route;
