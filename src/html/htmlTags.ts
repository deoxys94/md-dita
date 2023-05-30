export const deleteExtraHTMLTags = (xml: string, eventLogger: any) =>
{
    try {
        eventLogger.logInfo(`Deleting unnecessary HTML tags.`);
    
        xml = xml.replace(/<(span|div|p|i|pre|li)[^>]*class\s*=\s*['"]code['"][^>]*>([\s\S]*?)<\/(span|div|p|i|pre|li)>/g, '<codeblock>$2</codeblock>');
        xml = xml.replace(/<(span|div|p|i|pre|li)[^>]*class\s*=\s*['"]note['"][^>]*>([\s\S]*?)<\/(span|div|p|i|pre|li)>/g, '<note>$2</note>');
        xml = xml.replace(/<(span|div|p|i|pre|li)[^>]*class\s*=\s*['"]tip['"][^>]*>([\s\S]*?)<\/(span|div|p|i|pre|li)>/g, '<note type="tip">$2</note>');
        xml = xml.replace(/<(span|div|p|i|pre|li)[^>]*class\s*=\s*['"]ui['"][^>]*>([\s\S]*?)<\/(span|div|p|i|pre|li)>/g, '<checkMenu>$2</checkMenu>');
        xml = xml.replace(/<[^>]*(href\s*=\s*['"][^'"]*['"][^>]*)>([\s\S]*?)<\/[^>]+>/g, '<xref $1>$2</xref>');
        xml = xml.replace(/<a[^>]*name\s*=\s*['"]([^'"]*)['"][^>]*>.*?<\/a>/g, `<p id="$1"></p>`);
        xml = xml.replace(/<strong>([\s\S]*?)<\/strong>/g, '<term>$1</term>');
        xml = xml.replace(/<em>([\s\S]*?)<\/em>/g, '<cite>$1</cite>');
        xml = xml.replace(/<code>([\s\S]*?)<\/code>/g, '<codeblock>$1</codeblock>');
        xml = xml.replace(/<pre>/g, ``);
        xml = xml.replace(/<\/pre>/g, ``);
        xml = xml.replace(/<br\s*\/?>/g, ``);
        xml = xml.replace(/<hr\s*\/?>/g, ``);
        xml = xml.replace(/<\/br>/g, ``);
        xml = xml.replace(/<\/hr>/g, ``);
        xml = xml.replace(/\sstyle\s*=\s*"[^"]*"/, ``);

        return xml;
    } catch (error) {
        eventLogger.logWarning(`Unable to delete unecessary HTML tags. Verify the resulting DITA file afterwards. (Error Code: 104)\n${error}`);
        return xml;
    }
}