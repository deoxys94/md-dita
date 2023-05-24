export const menuCascade = (xml: string, eventLogger: any) => 
{
    try {
        let auxArray = [];
        let tempReplacement: string;
    
        if (!/<checkMenu>(.|\n)*?<\/checkMenu>/g.test(xml)) 
        {
            eventLogger.logInfo(`No menu paths found.`);
            return xml;
        }
    
        auxArray = [...xml.match(/<checkMenu>(.|\n)*?<\/checkMenu>/g)]
    
        for (let element of auxArray) 
        {
            tempReplacement = element.replace(/<checkMenu>/, ``) // Replace temporary tags
                .replace(/<\/checkMenu>/, ``)
                .replace(/<codeph>/, ``) // And other tags that can break the <term> or <menucascade> elements
                .replace(/<\/codeph>/, ``);
    
            if (element.includes(`&gt;`)) // Check if the string has a > symbol.
            {
                let parts = tempReplacement.split('&gt;');
                let wrappedParts = parts.map(part => `<uicontrol>${part}</uicontrol>`);
                tempReplacement = wrappedParts.join('');
                tempReplacement = `<menucascade>${tempReplacement}</menucascade>`;
            } 
            else 
            {
                tempReplacement = `<term>${tempReplacement}</term>`;
            }
    
            xml = xml.replace(element, tempReplacement);
        }
    
        eventLogger.logInfo(`Converted menu paths to <menucascade> elements.`);
        return xml;
    } catch (error) 
    {
        eventLogger.logError(`Unable to convert menu paths to menu cascades. Verify the resulting file afterwards. (Error Code: 302)\n${error}`);
        return xml;
    }
}