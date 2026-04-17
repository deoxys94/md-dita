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
import { TopicType } from "./types";

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

  private fixPendingTasks(markdown: string, type: TopicType): string
  {
    this.eventLogger.logInfo(`Fixing pending tasks before finishing conversion`);
    let topicId = '';

    this.eventLogger.logInfo("Removing unnecessary XML declarations");
    const xmlDeclaration = '<?xml version="1.0" encoding="utf-8"?>';
    const index = markdown.indexOf(xmlDeclaration);
    if (index > -1) {
      markdown = markdown.substring(index);
    }

    this.eventLogger.logInfo("Loading content into Cheerio");
    const $ = cheerio.load(markdown, {
      xml: true,
    });

    this.eventLogger.logInfo("Transforming leftover HTML tags");
    $('strong').replaceWith((_, el) => `<uicontrol>${$(el).html()}</uicontrol>`);
    $('a').replaceWith((_, el) => `<xref href="${$(el).attr('href')}">${$(el).html()}</xref>`);
    $('br').remove();

    $('p').each((_, el) => {
      $(el).children('p').each((_, childEl) => {
        if ($(childEl).html()?.trim() === '') {
          $(childEl).remove();
        }
      });
    });

    $('li').each((_, el) => {
      if ($(el).children('p').length > 0) return;
      $(el).replaceWith(`<li><p>${$(el).html()}</p></li>`);
    });

    $('xref').each((_, el) =>
    {
      if (!$(el).hasClass('anchor-only')) return;
      const id = $(el).attr('id');
      const parent = $(el).parent();
      parent.attr('id', id);
      $(el).remove();
    });

    switch (type)
    {
      case TopicType.Concept:
        topicId = $('concept').attr('id') || '';
        break;
      case TopicType.Reference:
        topicId = $('reference').attr('id') || '';
        break;
      case TopicType.Task:
        topicId = $('task').attr('id') || '';
        break;
    }

    $('xref[href^="#"]').attr('href', (_, value) =>
    {
      const href = value as string;
      if (href.startsWith('#') && !href.startsWith(`#${topicId}/`))
        return `#${topicId}/${href.substring(1)}`;
      return href;
    });

    $('xref[href^="http"]').attr({
      format: 'html',
      scope: 'external',
    });

    $('term > sup').each((_, element) =>
    {
      const $sup = $(element);
      const $term = $sup.parent();
      $sup.insertAfter($term);
      $term.remove();
    });

    return fixAnchorIdForTitles($.html(), this.eventLogger);
  }

  /**
   * Converts Markdown to DITA Concept XML format.
   * @param markdown - The markdown string to be converted.
   * @returns The converted DITA XML string or an empty string if conversion fails.
   */
  mdToConcept(markdown: string): string
  {
    this.eventLogger.logContainer = [];
    const renderer = new ConceptRenderer();

    markdown = fixCommonElements(markdown, this.eventLogger);
    markdown = renderer.toDitaConcept(markdown, this.eventLogger);

    if (markdown === ``) return ``;

    markdown = fixMenuCascadeElements(markdown, this.eventLogger);
    markdown = convertHtmlTables(markdown, this.eventLogger);
    markdown = convertNotes(markdown, this.eventLogger);
    markdown = fixConceptReference(markdown, TopicType.Concept, this.eventLogger);

    if (markdown === ``) return ``;

    return this.fixPendingTasks(markdown, TopicType.Concept);
  }

  mdToReference(markdown: string): string
  {
    this.eventLogger.logContainer = [];
    const renderer = new ReferenceRenderer();

    markdown = fixCommonElements(markdown, this.eventLogger);
    markdown = renderer.toDitaReference(markdown, this.eventLogger);

    if (markdown === ``) return ``;

    markdown = fixMenuCascadeElements(markdown, this.eventLogger);
    markdown = convertHtmlTables(markdown, this.eventLogger);
    markdown = convertNotes(markdown, this.eventLogger);
    markdown = fixConceptReference(markdown, TopicType.Reference, this.eventLogger);

    if (markdown === ``) return ``;

    return this.fixPendingTasks(markdown, TopicType.Reference);
  }

  mdToTask(markdown: string): string
  {
    this.eventLogger.logContainer = [];
    const renderer = new TaskRenderer();

    markdown = fixCommonElements(markdown, this.eventLogger);
    markdown = renderer.toDitaTask(markdown, this.eventLogger);

    if (markdown === ``) return ``;

    markdown = fixMenuCascadeElements(markdown, this.eventLogger);
    markdown = convertHtmlTables(markdown, this.eventLogger);
    markdown = convertNotes(markdown, this.eventLogger);
    markdown = fixTask(markdown, this.eventLogger);

    if (markdown === ``) return ``;

    return this.fixPendingTasks(markdown, TopicType.Task);
  }
}
