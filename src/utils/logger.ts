import { createPinoLogger, logger as elysiaLogger, fileLogger as elysiaFileLogger } from "@bogeychan/elysia-logger";

export const fileLogger = elysiaFileLogger({
    file: "./out.log",
    level: "error",
});
export const log = createPinoLogger();
export const logger = elysiaLogger({
    level: "error",
});
