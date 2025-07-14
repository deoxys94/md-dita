"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MdDita = void 0;
const collapsibleElements_1 = require("./html/collapsibleElements");
const conrefs_1 = require("./html/conrefs");
const footnotes_1 = require("./html/footnotes");
const htmlTags_1 = require("./html/htmlTags");
const notes_1 = require("./html/notes");
const tables_1 = require("./html/tables");
const conceptRenderer_1 = require("./renderer/conceptRenderer");
const referenceRenderer_1 = require("./renderer/referenceRenderer");
const taskRenderer_1 = require("./renderer/taskRenderer");
const conceptReferenceFix_1 = require("./xmlFix/conceptReferenceFix");
const menuCascade_1 = require("./xmlFix/menuCascade");
const sections_1 = require("./xmlFix/sections");
class MdDita {
    fixCommonElements(markdown) {
        markdown = markdown.replace(/([\s\S]+?)(?=\s#\s)/, ``);
        markdown = markdown.trimStart();
        markdown = (0, conrefs_1.findConrefs)(markdown);
        markdown = (0, collapsibleElements_1.fixCollapsibleElements)(markdown);
        markdown = (0, footnotes_1.fixFootnotes)(markdown);
        markdown = (0, htmlTags_1.deleteExtraHTMLTags)(markdown);
        return markdown;
    }
    mdToConcept(markdown) {
        const renderer = new conceptRenderer_1.ConceptRenderer();
        markdown = this.fixCommonElements(markdown);
        markdown = renderer.toDitaConcept(markdown);
        markdown = (0, sections_1.fixSections)(markdown, 1);
        markdown = (0, menuCascade_1.menuCascade)(markdown);
        markdown = (0, tables_1.convertHtmlTables)(markdown);
        markdown = (0, notes_1.convertNotes)(markdown);
        markdown = (0, conceptReferenceFix_1.fixConceptReference)(markdown, 1);
        markdown = markdown.replace(/href="http/g, `format="html" scope="external" href="http`);
        return markdown;
    }
    mdToReference(markdown) {
        const renderer = new referenceRenderer_1.ReferenceRenderer();
        markdown = this.fixCommonElements(markdown);
        markdown = renderer.toDitaReference(markdown);
        markdown = (0, sections_1.fixSections)(markdown, 2);
        markdown = (0, menuCascade_1.menuCascade)(markdown);
        markdown = (0, tables_1.convertHtmlTables)(markdown);
        markdown = (0, notes_1.convertNotes)(markdown);
        markdown = (0, conceptReferenceFix_1.fixConceptReference)(markdown, 2);
        markdown = markdown.replace(/href="http/g, `format="html" scope="external" href="http`);
        return markdown;
    }
    mdToTask(markdown) {
        const renderer = new taskRenderer_1.TaskRenderer();
        markdown = this.fixCommonElements(markdown);
        markdown = renderer.toDitaTask(markdown);
        markdown = (0, sections_1.fixSections)(markdown, 2);
        markdown = (0, menuCascade_1.menuCascade)(markdown);
        markdown = (0, tables_1.convertHtmlTables)(markdown);
        markdown = (0, notes_1.convertNotes)(markdown);
        markdown = (0, conceptReferenceFix_1.fixConceptReference)(markdown, 2);
        markdown = markdown.replace(/href="http/g, `format="html" scope="external" href="http`);
        return markdown;
    }
}
exports.MdDita = MdDita;
