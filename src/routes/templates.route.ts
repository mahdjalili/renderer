import { Elysia, t } from "elysia";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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
        async ({ params: { id } }) => {
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
    ).post(
        "/templates",
        async ({ body }) => {
            await prisma.template.create({
                data: {
                    image: body.image,
                    ratio: body.ratio,
                    width: body.width,
                    height: body.height,
                    fonts: body.fonts,
                    pages: body.pages,
                    keywords: {
                        connectOrCreate: body.keywords.map((keyword: string) => {
                            return { where: { name: keyword }, create: { name: keyword } };
                        }),
                    },
                },
            });

            log.info(`Template created: ${body.image}`);
        },
        {
            body: t.Object({
                image: t.String(),
                ratio: t.String(),
                width: t.Number(),
                height: t.Number(),
                fonts: t.String(),
                pages: t.Number(),
                keywords: t.Array(t.String()),
            }),
            response: t.Any(),
            detail: {
                description: "Create a template",
                tags: ["Templates"],
                summary: "Create a template",
            },
        }
    );

export default route;
