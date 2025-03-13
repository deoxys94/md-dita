import { fixCollapsibleElements } from "./html/collapsibleElements";
import { findConrefs } from "./html/conrefs";
import { fixFootnotes } from "./html/footnotes";
import { transformRawHtml } from "./html/htmlTags";
import { convertNotes } from "./html/notes";
import { convertHtmlTables } from "./html/tables";
import { ConceptRenderer } from "./renderer/conceptRenderer";
import { ReferenceRenderer } from "./renderer/referenceRenderer";
import { TaskRenderer } from "./renderer/taskRenderer";
import { fixConceptReference } from "./xmlFix/conceptReferenceFix";
import { fixMenuCascadeElements } from "./xmlFix/fixMenuCascades";
import { fixTask } from "./xmlFix/taskFix";
import { fixAnchorId } from "./xmlFix/anchorFix";

export class simpleLogger {
  private _logContainer: string[] = [];
  private _verbose = false;


  constructor(verbose = false) {
    this._verbose = verbose;
  }

  public get logContainer() {
    return this._logContainer;
  }

  public set logContainer(newValue: string[]) {
    this._logContainer = newValue;
  }

  public logWarning(message: string) {
    message = `[Warning] ${message}`;
    this._logContainer.push(message);

    console.warn(message);
  }

  public logError(message: string) {
    message = `[Error] ${message}`;
    this._logContainer.push(message);

    console.error(message);
    console.trace();
  }

  public logInfo(message: string) {
    if (!this._verbose) return;

    message = `[Info] ${message}`;
    console.info(message);
  }
}

export class MdDita {
  private eventLogger: simpleLogger;

  constructor(verbose: boolean) {
    this.eventLogger = new simpleLogger(verbose);
  }

  public get getLogs() {
    return this.eventLogger.logContainer;
  }

  private fixCommonElements(markdown: string) {
    markdown = markdown.trimStart();

    markdown = transformRawHtml(markdown, this.eventLogger);
    markdown = findConrefs(markdown, this.eventLogger);
    markdown = fixCollapsibleElements(markdown, this.eventLogger);
    markdown = fixFootnotes(markdown, this.eventLogger);

    return markdown;
  }

  private fixPendingTasks(markdown: string, type: number) {
    let topicId: string = "";

    console.log(`File before last fix: ${markdown}`)

    markdown = markdown.replace(
      /([\s\S]+?)(?=\s<\?xml version="1\.0" encoding="utf-8"\?>\s)/,
      ``,
    ); // Remove slugs

    // Fix any internal anchors.
    if (type === 1)
      topicId = markdown
        .match(/<concept id=\"(.*?)\">/)[0]
        .replace(/<concept id=\"/, ``)
        .replace(/">/, ``);
    if (type === 2)
      topicId = markdown
        .match(/<reference id=\"(.*?)\">/)[0]
        .replace(/<reference id=\"/, ``)
        .replace(/">/, ``);
    if (type === 3)
      topicId = markdown
        .match(/<task id=\"(.*?)\">/)[0]
        .replace(/<task id=\"/, ``)
        .replace(/">/, ``);

    markdown = markdown.replace(/href="#/g, `href="#${topicId}/`);
    markdown = markdown.replace(
      /href="http/g,
      `format="html" scope="external" href="http`,
    );
    markdown = markdown.replace(/<term><sup>/g, `<sup>`);
    markdown = markdown.replace(/<\/sup><\/term>/g, `</sup>`);
    markdown = fixAnchorId(markdown, this.eventLogger);

    return markdown;
  }

  /**
   * Converts Markdown to DITA Concept XML format.
   * @param markdown - The markdown string to be converted.
   * @returns The converted DITA XML string or an empty string if conversion fails.
   */
  mdToConcept(markdown: string): string {
    // Initialize the log container
    this.eventLogger.logContainer = [];

    // Create a new ConceptRenderer instance
    const renderer = new ConceptRenderer();

    // Fix common elements in the markdown
    markdown = this.fixCommonElements(markdown);

    // Convert the pre-treated markdown to DITA Concept format
    markdown = renderer.toDitaConcept(markdown, this.eventLogger);

    // Return an empty string if conversion failed
    if (markdown === ``) return ``;

    // Convert menu paths to <menucascade> or term
    markdown = fixMenuCascadeElements(markdown, this.eventLogger);

    // Convert HTML tables to DITA tables
    markdown = convertHtmlTables(markdown, this.eventLogger);

    // Convert notes and tips to DITA format
    markdown = convertNotes(markdown, this.eventLogger);

    // Fix concept references
    markdown = fixConceptReference(markdown, 1, this.eventLogger);

    // Return an empty string if fixing references failed
    if (markdown === ``) return ``;

    // Fix pending tasks and internal anchors
    markdown = this.fixPendingTasks(markdown, 1);

    // Return the final converted markdown
    return markdown;
  }

  mdToReference(markdown: string) {
    this.eventLogger.logContainer = [];
    const renderer = new ReferenceRenderer();

    markdown = this.fixCommonElements(markdown);

    markdown = renderer.toDitaReference(markdown, this.eventLogger);

    console.log(`Current MD file: ${markdown}`);

    if (markdown === ``) return ``;

    // Find all menu paths and convert them to <menucascade> or term
    markdown = fixMenuCascadeElements(markdown, this.eventLogger);

    // Find all tables and convert them to DITA tables
    // Verify if there are any HTML tables
    markdown = convertHtmlTables(markdown, this.eventLogger);

    // Find all notes and tips.
    markdown = convertNotes(markdown, this.eventLogger);

    markdown = fixConceptReference(markdown, 2, this.eventLogger);

    if (markdown === ``) return ``;

    markdown = this.fixPendingTasks(markdown, 2);

    return markdown;
  }

  mdToTask(markdown: string) {
    this.eventLogger.logContainer = [];
    const renderer = new TaskRenderer();

    markdown = this.fixCommonElements(markdown);

    markdown = renderer.toDitaTask(markdown, this.eventLogger);

    if (markdown === ``) return ``;

    // Find all menu paths and convert them to <menucascade> or term
    markdown = fixMenuCascadeElements(markdown, this.eventLogger);

    // Find all tables and convert them to DITA tables
    // Verify if there are any HTML tables
    markdown = convertHtmlTables(markdown, this.eventLogger);

    // Find all notes and tips.
    markdown = convertNotes(markdown, this.eventLogger);

    console.log(markdown);

    markdown = fixTask(markdown, this.eventLogger);

    if (markdown === ``) return ``;

    markdown = this.fixPendingTasks(markdown, 3);

    return markdown;
  }
}
