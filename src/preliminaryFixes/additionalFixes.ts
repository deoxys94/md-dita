import { simpleLogger } from "../md-dita";

export const applyAdditionalFixes = (markdown: string, eventLogger: simpleLogger): string =>
{
	eventLogger.logInfo(`Applying additional fixes`);

	const styleRegex = /\{\:\s*style=\"[^\"]*\"\s*\}/g;

	markdown = markdown.replace("**Footnotes:**", "");
	markdown = markdown.replace(styleRegex, "");
	markdown = markdown.replace("## ", "\n## ");

	return markdown
}