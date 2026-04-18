import { simpleLogger } from "../md-dita";
import { FlavorType } from "../types";

export const applyAdditionalFixes = (markdown: string, eventLogger: simpleLogger, flavor: FlavorType): string =>
{
	eventLogger.logInfo(`Applying additional fixes`);

	// Universal fixes — applied for all flavors
	markdown = markdown.replace("**Footnotes:**", "");
	markdown = markdown.replaceAll("## ", "\n## ");

	// MkDocs-specific: strip inline style attributes ({: style="..."})
	if (flavor === FlavorType.MkDocs)
	{
		const styleRegex = /\{\:\s*style="[^"]*"\s*\}/g;
		markdown = markdown.replace(styleRegex, "");
	}

	return markdown;
}