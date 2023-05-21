export const menuCascade = (xml: string) => 
{
    try {
        let auxArray = [];
        let tempReplacement: string;
    
        if (!/<checkMenu>(.|\n)*?<\/checkMenu>/g.test(xml)) 
        {
            console.info(`[Info] No menu paths found.`);
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
    
        console.info(`[Info] Converted menu paths to <menucascade> elements.`);
        return xml;
    } catch (error) 
    {
        console.error(error)
    }
}