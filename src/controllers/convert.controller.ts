import axios from "axios";

import { convertPSDToTemplate } from "../services/psd.service";
import { replaceTemplateVariables } from "../services/resize.service";

export default class Convert {
    convertPsdToTemplate = async (psdUrl: string) => {
        const response = await axios.get(psdUrl, { responseType: "arraybuffer" });
        const psdFile = response.data;
        return convertPSDToTemplate(psdFile);
    };
    replaceTemplateVariables = replaceTemplateVariables;
}
