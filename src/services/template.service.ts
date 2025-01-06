import { log } from "../utils/logger";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { getTemplates } from "../models/templates.model";
const templatesList = await getTemplates();

export const updateTemplates = async () => {
    for (const template of templatesList) {
        const name = template.image ?? "";
        const regex = /\/\d{4}-\d{2}-\d{2}-(.+)\.jpg$/;
        const match = name.match(regex)[1] ?? "other";
        const keywords = match ? match.split("-") : [];

        await prisma.template.create({
            data: {
                image: template.image,
                ratio: template.ratio,
                width: template.width,
                height: template.height,
                fonts: template.fonts,
                pages: template.pages,
                keywords: {
                    connectOrCreate: keywords.map((keyword: string) => {
                        return { where: { name: keyword }, create: { name: keyword } };
                    }),
                },
            },
        });

        log.info(`Template created: ${match}`);
    }
};

export const addTemplate = async (template: any) => {
    await prisma.template.create({
        data: {
            image: template.image,
            ratio: template.ratio,
            width: template.width,
            height: template.height,
            fonts: template.fonts,
            pages: template.pages,
            keywords: {
                connectOrCreate: templates.keywords.map((keyword: string) => {
                    return { where: { name: keyword }, create: { name: keyword } };
                }),
            },
        },
    });

    log.info(`Template created: ${match}`);
};
