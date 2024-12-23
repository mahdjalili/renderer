import { Elysia, t } from "elysia";
import { paginate, paginateType } from "../utils/paginate";
import { getTemplates } from "../models/templates.model";

const templatesList = await getTemplates();

export const route = new Elysia()
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
    );

export default route;
