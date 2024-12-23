import axios from "axios";

import { convertPSDToTemplate } from "../services/psd.service";

export default class Convert {
    convertPsdToTemplate = async (padUrl: string) => {
        const response = await axios.get(padUrl, { responseType: "arraybuffer" });
        const psdFile = response.data;
        const template = convertPSDToTemplate(psdFile);
        return template;
    };
}
