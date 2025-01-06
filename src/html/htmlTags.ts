export const deleteExtraHTMLTags = (xml: string, eventLogger: any) =>
{
    try {
        eventLogger.logInfo(`Deleting unnecessary HTML tags.`);
		let result: string = xml;

        result = result.replace(/<(span|div|p|i|pre|li)[^>]*class\s*=\s*['"]code['"][^>]*>([\s\S]*?)<\/(span|div|p|i|pre|li)>/g, '<codeblock>$2</codeblock>');
        result = result.replace(/<(span|div|p|i|pre|li)[^>]*class\s*=\s*['"]note['"][^>]*>([\s\S]*?)<\/(span|div|p|i|pre|li)>/g, '<note>$2</note>');
        result = result.replace(/<(span|div|p|i|pre|li)[^>]*class\s*=\s*['"]tip['"][^>]*>([\s\S]*?)<\/(span|div|p|i|pre|li)>/g, '<note type="tip">$2</note>');
        result = result.replace(/<(span|div|p|i|pre|li)[^>]*class\s*=\s*['"]ui['"][^>]*>([\s\S]*?)<\/(span|div|p|i|pre|li)>/g, '<checkMenu>$2</checkMenu>');
        result = result.replace(/<[^>]*(href\s*=\s*['"][^'"]*['"][^>]*)>([\s\S]*?)<\/[^>]+>/g, '<xref $1>$2</xref>');
        result = result.replace(/<a[^>]*name\s*=\s*['"]([^'"]*)['"][^>]*>.*?<\/a>/g, `<p id="$1"></p>`);
        result = result.replace(/<strong>([\s\S]*?)<\/strong>/g, '<term>$1</term>');
        result = result.replace(/<em>([\s\S]*?)<\/em>/g, '<cite>$1</cite>');
        result = result.replace(/<code>([\s\S]*?)<\/code>/g, '<codeblock>$1</codeblock>');
        result = result.replace(/<pre>/g, ``);
        result = result.replace(/<\/pre>/g, ``);
        result = result.replace(/<br\s*\/?>/g, ``);
        result = result.replace(/<hr\s*\/?>/g, ``);
        result = result.replace(/<\/br>/g, ``);
        result = result.replace(/<\/hr>/g, ``);
        result = result.replace(/\sstyle\s*=\s*"[^"]*"/, ``);

        return result;
    } catch (error) {
        eventLogger.logWarning(`Unable to delete unecessary HTML tags. Verify the resulting DITA file afterwards. (Error Code: 104)\n${error}`);
        return xml;
    }
}