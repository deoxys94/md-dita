import { BaseDitaRenderer } from "./defaultRenderer";

export class ConceptRenderer extends BaseDitaRenderer
{
    constructor()
    {
        super();

        this.md.renderer.rules.heading_open = (tokens, idx) => tokens[idx].tag === 'h1' ? `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE concept PUBLIC "-//OASIS//DTD DITA Concept//EN" "concept.dtd">\n<concept id="topic-id-placeholder" xml:lang="en-us">\n<title>` : `<section><title>`;

        this.md.renderer.rules.heading_close = (tokens, idx) => tokens[idx].tag === 'h1' ? `</title>\n<conbody>\n` : `</title></section>\n`;

    }

    toDitaConcept(markdown: string, eventLogger: any): string
    {
        try
        {
            let htmlString = this.md.render(markdown);

            if (!htmlString.includes(`<?xml version="1.0" encoding="utf-8"?>`))
                throw "NoHeaders";

            return `${htmlString}\n</conbody>\n</concept>`;
        } catch (error)
        {
            eventLogger.logError(`Unable to convert document to DITA XML. Verify your file is properly formatted and try again. (Error code: 201)\n${error}`);
            return ``;
        }
    }
}
