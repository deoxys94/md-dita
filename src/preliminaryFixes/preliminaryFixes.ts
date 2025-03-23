import { simpleLogger } from "../md-dita";
import { applyAdditionalFixes } from "./additionalFixes";
import { fixCollapsibleElements } from "./collapsibleElements";
import { findConrefs } from "./conrefs";

export const fixCommonElements = (markdown: string, eventLogger: simpleLogger): string =>
{
  eventLogger.logInfo(`Fixing common elements before conversion`);

  markdown = markdown.trimStart();
  markdown = fixCollapsibleElements(markdown, eventLogger);
  markdown = findConrefs(markdown, eventLogger);
  markdown = applyAdditionalFixes(markdown, eventLogger);

  return markdown;
}