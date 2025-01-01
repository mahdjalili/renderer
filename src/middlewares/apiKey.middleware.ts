import Elysia from "elysia";

const VALID_API_KEYS = process.env.API_KEYS ? process.env.API_KEYS.split(",") : [];

export const APIKeyMiddleware = new Elysia().onBeforeHandle({ as: "scoped" }, ({ headers, error }) => {
    const apiKey = headers["x-api-key"];
    console.log(apiKey);

    if (!apiKey) {
        return error(401, { status: "error", message: "API Key is required" });
    }

    if (!VALID_API_KEYS.includes(apiKey)) {
        return error(401, { status: "error", message: "Invalid API Key" });
    }
});

export default APIKeyMiddleware;
