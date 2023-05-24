import { BaseDitaRenderer } from "./defaultRenderer";

export class ReferenceRenderer extends BaseDitaRenderer
{
    constructor()
    {
        super();

        this.md.renderer.rules.heading_open = (tokens, idx) => tokens[idx].tag === 'h1' ? `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE reference PUBLIC "-//OASIS//DTD DITA Reference//EN" "reference.dtd">\n<reference id="<tbd>">\n<title>` : `<section>\n<title>`;

        this.md.renderer.rules.heading_close = (tokens, idx) => tokens[idx].tag === 'h1' ? `</title>\n<refbody>\n` : `</title>\n</section>\n`;

    }

    toDitaReference(markdown: string, eventLogger: any): string
    {
        try 
        {
            markdown = this.md.render(markdown);

            if (!/<\?xml version="1.0" encoding="utf-8"\?>/.test(markdown))
                throw "NoHeaders";
    
            return `${markdown}\n</refbody>\n</reference>`;
        } catch (error)
        {
            eventLogger.logError(`Unable to convert document to DITA XML. Verify your file is properly formatted and try again. (Error code: 202)\n${error}`);
            return ``;
        }
    }
}