import { t } from "elysia";

/**
 * Paginate an array of data.
 * @param items - The array of items to paginate.
 * @param page - The current page number (1-based).
 * @param limit - The number of items per page.
 * @returns An object containing paginated data and metadata.
 */
export function paginate<T>(
    items: T[],
    page: number = 1,
    limit: number = 10
): {
    data: T[];
    meta: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        itemsPerPage: number;
    };
} {
    const pageNumber = Math.max(1, Math.floor(page));
    const limitNumber = Math.max(1, Math.floor(limit));

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / limitNumber);
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;

    const data = items.slice(startIndex, endIndex);

    return {
        data,
        meta: {
            totalItems,
            totalPages,
            currentPage: pageNumber,
            itemsPerPage: limitNumber,
        },
    };
}

export const paginateType = t.Union([
    t.Array(t.Any()),
    t.Object({
        data: t.Array(t.Any()),
        meta: t.Object({
            totalItems: t.Number(),
            totalPages: t.Number(),
            currentPage: t.Number(),
            itemsPerPage: t.Number(),
        }),
    }),
]);
