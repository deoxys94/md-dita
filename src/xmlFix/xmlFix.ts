import { conceptReferenceFix } from "./conceptReference";
import { menuCascade } from "./menuCascade";

export const xmlFix = (xml: string, selection: number) => {
    // Find all menu paths and convert them to <menucascade> or term
    xml = menuCascade(xml);

    // Find all tables and convert them to DITA tables
    // Verify if there are any tables
    // xml = processTables(xml);

    // Find all notes and tips.
    // xml = convertNotes(xml);

    // Topic-specific fixes
    // 1 = Concept
    // 2 = Reference
    // 3 = task
    switch (selection) {
        case 1:
            xml = conceptReferenceFix(xml, 1);
            break
        case 2:
            xml = conceptReferenceFix(xml, 2);
            break;
        case 3:
            xml = taskFix(xml);
            break;
        default:
            console.log("%c[Error] An internal error has occurred. Please try again later. If the issue persists, contact your support provider. (Error code: 8)", "color:red");
            return ``;
    }

    xml = xml.replace(/href="http/g, `format="html" scope="external" href="http`);
    return xml;
}