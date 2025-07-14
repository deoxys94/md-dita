import { fixCollapsibleElements } from "./html/collapsibleElements";
import { findConrefs } from "./html/conrefs";
import { fixFootnotes } from "./html/footnotes";
import { deleteExtraHTMLTags } from "./html/htmlTags";
import { convertNotes } from "./html/notes";
import { convertHtmlTables } from "./html/tables";
import { ConceptRenderer } from "./renderer/conceptRenderer";
import { ReferenceRenderer } from "./renderer/referenceRenderer";
import { TaskRenderer } from "./renderer/taskRenderer";
import { fixConceptReference } from "./xmlFix/conceptReferenceFix";
import { menuCascade } from "./xmlFix/menuCascade";
import { fixSections } from "./xmlFix/sections";

export class MdDita {
    private fixCommonElements (markdown: string)
    {
        markdown = markdown.replace(/([\s\S]+?)(?=\s#\s)/, ``); // Remove slugs
        markdown = markdown.trimStart();

        markdown = findConrefs(markdown);
        markdown = fixCollapsibleElements(markdown);
        markdown = fixFootnotes(markdown);
        markdown = deleteExtraHTMLTags(markdown);

        return markdown;
    }

    mdToConcept (markdown: string)
    {
        const renderer = new ConceptRenderer();

        markdown = this.fixCommonElements(markdown)

        markdown = renderer.toDitaConcept(markdown);
        markdown = fixSections(markdown, 1);
        // Find all menu paths and convert them to <menucascade> or term
        markdown = menuCascade(markdown);

        // Find all tables and convert them to DITA tables
        // Verify if there are any HTML tables
        markdown = convertHtmlTables(markdown);

        // Find all notes and tips.
        markdown = convertNotes(markdown);
        markdown = fixConceptReference(markdown, 1);

        markdown = markdown.replace(/href="http/g, `format="html" scope="external" href="http`);

        return markdown;
    }

    mdToReference (markdown: string){
        const renderer = new ReferenceRenderer();

        markdown = this.fixCommonElements(markdown)

        markdown = renderer.toDitaReference(markdown);
        markdown = fixSections(markdown, 2);
        // Find all menu paths and convert them to <menucascade> or term
        markdown = menuCascade(markdown);

        // Find all tables and convert them to DITA tables
        // Verify if there are any HTML tables
        markdown = convertHtmlTables(markdown);

        // Find all notes and tips.
        markdown = convertNotes(markdown);
        markdown = fixConceptReference(markdown, 2);

        markdown = markdown.replace(/href="http/g, `format="html" scope="external" href="http`);

        return markdown;
    }

    mdToTask (markdown: string){
        const renderer = new TaskRenderer();

        markdown = this.fixCommonElements(markdown)

        markdown = renderer.toDitaTask(markdown);
        markdown = fixSections(markdown, 2);
        // Find all menu paths and convert them to <menucascade> or term
        markdown = menuCascade(markdown);

        // Find all tables and convert them to DITA tables
        // Verify if there are any HTML tables
        markdown = convertHtmlTables(markdown);

        // Find all notes and tips.
        markdown = convertNotes(markdown);
        markdown = fixConceptReference(markdown, 2);

        markdown = markdown.replace(/href="http/g, `format="html" scope="external" href="http`);

        return markdown;
    }
}