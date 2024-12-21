import { spawn } from "child_process";

export const ocr = (imageType: string, imageData: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const pythonFile = "src/utils/ocr/ocr.py";
        const pythonProcess = spawn("python", [pythonFile, imageType, imageData]);

        let result = "";
        let error = "";

        pythonProcess.stdout.on("data", (data: Buffer) => {
            result += data.toString();
        });

        pythonProcess.stderr.on("data", (data: Buffer) => {
            error += data.toString();
        });

        pythonProcess.on("close", (code: number) => {
            if (code === 0) {
                resolve(result.trim());
            } else {
                reject(error.trim());
            }
        });
    });
};
