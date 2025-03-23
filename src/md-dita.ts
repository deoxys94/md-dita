import { convertNotes } from "./html/notes";
import { convertHtmlTables } from "./html/tables";
import { ConceptRenderer } from "./renderer/conceptRenderer";
import { ReferenceRenderer } from "./renderer/referenceRenderer";
import { TaskRenderer } from "./renderer/taskRenderer";
import { fixConceptReference } from "./xmlFix/conceptReferenceFix";
import { fixMenuCascadeElements } from "./xmlFix/fixMenuCascades";
import { fixTask } from "./xmlFix/taskFix";
import { fixAnchorIdForTitles } from "./xmlFix/anchorFix";
import * as cheerio from 'cheerio';
import { fixCommonElements } from "./preliminaryFixes/preliminaryFixes";

export class simpleLogger
{
  private _logContainer: string[] = [];
  private _verbose = false;


  constructor(verbose = false)
  {
    this._verbose = verbose;
  }

  public get logContainer()
  {
    return this._logContainer;
  }

  public set logContainer(newValue: string[])
  {
    this._logContainer = newValue;
  }

  public logWarning(message: string)
  {
    message = `[Warning] ${message}`;
    this._logContainer.push(message);

    console.warn(message);
  }

  public logError(message: string)
  {
    message = `[Error] ${message}`;
    this._logContainer.push(message);

    console.error(message);
    console.trace();
  }

  public logInfo(message: string)
  {
    if (!this._verbose) return;

    message = `[Info] ${message}`;
    console.info(message);
  }

  public logDebug(message: string)
  {
    if (!this._verbose) return;

    message = `[Debug] ${message}`;
    console.debug(message);
  }
}

export class MdDita
{
  private eventLogger: simpleLogger;

  constructor(verbose: boolean)
  {
    this.eventLogger = new simpleLogger(verbose);
  }

  public get getLogs()
  {
    return this.eventLogger.logContainer;
  }

  private fixPendingTasks(markdown: string, type: number): string
  {
    this.eventLogger.logInfo(`Fixing pending tasks before finising conversion`);
    let topicId = '';

    this.eventLogger.logInfo("Removing unnecessary XML declarations");
    // Remove anything before the first XML declaration

    const xmlDeclaration = '<?xml version="1.0" encoding="utf-8"?>';
    const index = markdown.indexOf(xmlDeclaration);
    if (index > -1) {
      markdown = markdown.substring(index);
    }

    this.eventLogger.logInfo("Loading content into Cheerio");
    // Load the content into Cheerio
    const $ = cheerio.load(markdown, {
      xml: true,
    });

    this.eventLogger.logInfo("Transforming leftover HTML tags");
    // Replace <strong> tags with <uicontrol> while preserving content
    $('strong').replaceWith((_, el) => `<uicontrol>${$(el).html()}</uicontrol>`);

    // Convert <a> tags to DITA <xref> tags, preserving href and content
    $('a').replaceWith((_, el) => `<xref href="${$(el).attr('href')}">${$(el).html()}</xref>`);

    // Remove all leftover br elements
    $('br').remove();

    // Check all the <p> elements
    $('p').each((_, el) => {
      $(el).children('p').each((_, childEl) => {
        if ($(childEl).html()?.trim() === '') {
          $(childEl).remove();
        }
      });
    });

    // Check all the li elements
    $('li').each((_, el) => {
      if ($(el).children('p').length > 0) return

      $(el).replaceWith(`<li><p>${$(el).html()}</p></li>`);
    });

    $('xref').each((_, el) =>
    {
      // Check if the elements have the anchor-only class
      if (!$(el).hasClass('anchor-only'))
        return;

      // Save the id attribute
      const id = $(el).attr('id');

      // Find the parent element
      const parent = $(el).parent();
      // Add the id attribute to the parent element
      parent.attr('id', id);

      // Remove the xref element
      $(el).remove();

    });


    // Extract the topicId based on type

    switch (type)
    {
      case 1:
        topicId = $('concept').attr('id') || '';
        break;
      case 2:
        topicId = $('reference').attr('id') || '';
        break;
      case 3:
        topicId = $('task').attr('id') || '';
        break;
    }

    // Update internal anchors
    $('xref[href^="#"]').attr('href', (_, value) =>
    {
      const href = value as string;

      if (href.startsWith('#') && !href.startsWith(`#${topicId}/`))
        return `#${topicId}/${href.substring(1)}`;

      return href;
    });

    // Update external links
    $('xref[href^="http"]').attr({
      format: 'html',
      scope: 'external',
    });

    // Fix term and sup tags
    $('term > sup').each((_, element) =>
    {
      const $sup = $(element);
      const $term = $sup.parent();
      $sup.insertAfter($term);
      $term.remove();
    });

    // Apply fixAnchorIdForTitles (assuming it's a separate function that needs to be called)
    return fixAnchorIdForTitles($.html(), this.eventLogger);
  }

  /**
   * Converts Markdown to DITA Concept XML format.
   * @param markdown - The markdown string to be converted.
   * @returns The converted DITA XML string or an empty string if conversion fails.
   */
  mdToConcept(markdown: string): Promise<string>
  {
    // Initialize the log container
    this.eventLogger.logContainer = [];

    // Create a new ConceptRenderer instance
    const renderer = new ConceptRenderer();

    // Fix common elements in the markdown
    markdown = fixCommonElements(markdown, this.eventLogger);

    // Convert the pre-treated markdown to DITA Concept format
    markdown = renderer.toDitaConcept(markdown, this.eventLogger);

    // Return an empty string if conversion failed
    if (markdown === ``) return Promise.resolve(``);

    // Convert menu paths to <menucascade> or term
    markdown = fixMenuCascadeElements(markdown, this.eventLogger);

    // Convert HTML tables to DITA tables
    markdown = convertHtmlTables(markdown, this.eventLogger);

    // Convert notes and tips to DITA format
    markdown = convertNotes(markdown, this.eventLogger);

    // Fix concept references
    markdown = fixConceptReference(markdown, 1, this.eventLogger);

    // Return an empty string if fixing references failed
    if (markdown === ``) return Promise.resolve(``);

    // Fix pending tasks and internal anchors
    markdown = this.fixPendingTasks(markdown, 1);

    // Return the final converted markdown
    return Promise.resolve(markdown);
  }

  mdToReference(markdown: string): Promise<string>
  {
    this.eventLogger.logContainer = [];
    const renderer = new ReferenceRenderer();

    markdown = fixCommonElements(markdown, this.eventLogger);

    markdown = renderer.toDitaReference(markdown, this.eventLogger);

    if (markdown === ``) return Promise.resolve(``);

    // Find all menu paths and convert them to <menucascade> or term
    markdown = fixMenuCascadeElements(markdown, this.eventLogger);

    // Find all tables and convert them to DITA tables
    // Verify if there are any HTML tables
    markdown = convertHtmlTables(markdown, this.eventLogger);

    // Find all notes and tips.
    markdown = convertNotes(markdown, this.eventLogger);

    markdown = fixConceptReference(markdown, 2, this.eventLogger);

    if (markdown === ``) return Promise.resolve(``);

    markdown = this.fixPendingTasks(markdown, 2);

    return Promise.resolve(markdown);
  }

  mdToTask(markdown: string): Promise<string>
  {
    this.eventLogger.logContainer = [];
    const renderer = new TaskRenderer();

    markdown = fixCommonElements(markdown, this.eventLogger);

    markdown = renderer.toDitaTask(markdown, this.eventLogger);

    if (markdown === ``) return Promise.resolve(``);

    // Find all menu paths and convert them to <menucascade> or term
    markdown = fixMenuCascadeElements(markdown, this.eventLogger);

    // Find all tables and convert them to DITA tables
    // Verify if there are any HTML tables
    markdown = convertHtmlTables(markdown, this.eventLogger);

    // Find all notes and tips.
    markdown = convertNotes(markdown, this.eventLogger);

    markdown = fixTask(markdown, this.eventLogger);

    if (markdown === ``) return Promise.resolve(``);

    markdown = this.fixPendingTasks(markdown, 3);

    return Promise.resolve(markdown);
  }
}
