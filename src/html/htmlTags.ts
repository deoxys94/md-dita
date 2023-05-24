export const deleteExtraHTMLTags = (xml: string, eventLogger: any) =>
{
    try {
        eventLogger.logInfo(`Deleting unnecessary HTML tags.`);
    
        xml = xml.replace(/<(span|div|p|i|pre|li)[^>]*class\s*=\s*['"]code['"][^>]*>([\s\S]*?)<\/(span|div|p|i|pre|li)>/g, '<codeblock>$2</codeblock>');
        xml = xml.replace(/<(span|div|p|i|pre|li)[^>]*class\s*=\s*['"]note['"][^>]*>([\s\S]*?)<\/(span|div|p|i|pre|li)>/g, '<note>$2</note>');
        xml = xml.replace(/<(span|div|p|i|pre|li)[^>]*class\s*=\s*['"]tip['"][^>]*>([\s\S]*?)<\/(span|div|p|i|pre|li)>/g, '<note type="tip">$2</note>');
        xml = xml.replace(/<(span|div|p|i|pre|li)[^>]*class\s*=\s*['"]ui['"][^>]*>([\s\S]*?)<\/(span|div|p|i|pre|li)>/g, '<checkMenu>$2</checkMenu>');
        xml = xml.replace(/<[^>]*(href\s*=\s*['"][^'"]*['"][^>]*)>([\s\S]*?)<\/[^>]+>/g, '<xref $1>$2</xref>');
        xml = xml.replace(/(<a name[\s\S]+?<\/a>)/g, `<!-- Unsure what these tags are for. Commenting them out... $1 -->`);
        xml = xml.replace(/<strong>([\s\S]*?)<\/strong>/g, '<term>$1</term>');
        xml = xml.replace(/<code>([\s\S]*?)<\/code>/g, '<codeblock>$1</codeblock>');
        xml = xml.replace(/<pre>/g, ``);
        xml = xml.replace(/<\/pre>/g, ``);
        xml = xml.replace(/<br\s*\/?>/g, ``);
        xml = xml.replace(/<hr\s*\/?>/g, ``);
        xml = xml.replace(/<\/br>/g, ``);
        xml = xml.replace(/<\/hr>/g, ``);
    
        return xml;
    } catch (error) {
        eventLogger.logWarning(`Unable to delete unecessary HTML tags. Verify the resulting DITA file afterwards. (Error Code: 104)\n${error}`);
        return xml;
    }
}