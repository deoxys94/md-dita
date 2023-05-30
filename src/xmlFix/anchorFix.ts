export const fixAnchorId = (xmlString: string, eventLogger: any): string => 
{
    eventLogger.logInfo(`Adding IDs.`);
    let titleArray = [...xmlString.match(/<title[\s\S]+?<\/title>/g)];
    let anchorID: string;
    let tempReplacement: string;
    
    for (let element of titleArray) {
        if (!/\{(#.*?)\}/.test(element))
            continue;

        anchorID = element.match(/\{(#.*?)\}/)[0].replace(`{`, ``).replace(`}`, ``);
        tempReplacement = element.replace(/<title>/, `<title id="${anchorID.replace(`{`, ``).replace(`}`, ``)}">`).replace(/\{(#.*?)\}/, ``);
        tempReplacement = tempReplacement.replace(`id="#`, `id="`);

        xmlString = xmlString.replace(element, tempReplacement);
    }
    
    return xmlString;
}