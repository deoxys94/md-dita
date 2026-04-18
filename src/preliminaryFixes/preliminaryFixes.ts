import { simpleLogger } from "../md-dita";
import { ConversionOptions, FlavorType } from "../types";
import { applyAdditionalFixes } from "./additionalFixes";
import { fixCollapsibleElements } from "./collapsibleElements";
import { findConrefs } from "./conrefs";
import { fixDocusaurusAdmonitions } from "./docusaurusAdmonitions";

export const fixCommonElements = (markdown: string, eventLogger: simpleLogger, options: ConversionOptions): string =>
{
  const flavor = options.flavor ?? FlavorType.CommonMark;
  eventLogger.logInfo(`Fixing common elements before conversion (flavor: ${flavor})`);

  markdown = markdown.trimStart();

  if (flavor === FlavorType.MkDocs)
  {
    markdown = fixCollapsibleElements(markdown, eventLogger);
    markdown = findConrefs(markdown, eventLogger);
  }

  if (flavor === FlavorType.Docusaurus)
  {
    markdown = fixDocusaurusAdmonitions(markdown, eventLogger);
  }

  markdown = applyAdditionalFixes(markdown, eventLogger, flavor);

  return markdown;
}