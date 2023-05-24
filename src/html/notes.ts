export const convertNotes = (xml: string, eventLogger: any) =>
{
    try {
        let auxArray = [];
        let tempReplacement: any;
    
        if (!/<p[\s\S]+?<\/p>/g.test(xml))
        {
            eventLogger.logInfo("No notes found");
            return xml;
        }
    
        auxArray = [...xml.match(/<p[\s\S]+?<\/p>/g)];
    
        for (let element of auxArray)
        {
            if (!/{[\s\S]+?}/.test(element))
                continue;
    
            if (/.note/.test(element))
                xml = xml.replace(element, `<note>${element.replace(/{[\s\S]+?}/, ``)}</note>`);
    
            if (/.tip/.test(element))
                xml = xml.replace(element, `<note type="tip">${element.replace(/{[\s\S]+?}/, ``)}</note>`);
            
            if (/.warning/.test(element))
                xml = xml.replace(element, `<note type="warning">${element.replace(/{[\s\S]+?}/, ``)}</note>`);
        }
    
        eventLogger.logInfo(`Converted notes to DITA XML notes.`);
        return xml;
    } catch (error) {
        eventLogger.logWarning(`Unable to convert notes to DITA. Verify the resulting DITA file afterwards. (Error Code: 105)\n${error}`);
        return xml;
    }
}