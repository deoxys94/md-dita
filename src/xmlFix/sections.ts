const generateSections = (xml: string, type: number,  eventLogger: any) => 
{
    let conceptBody = type === 1 ? xml.match(/<conbody[\s\S]+?<\/conbody>/)[0] : xml.match(/<refbody[\s\S]+?<\/refbody>/)[0]; // Get all the content inside the conbody/refbody element
    conceptBody = type === 1 ? conceptBody.replace(/<conbody>/, ``) : conceptBody.replace(/<refbody>/, ``);
    conceptBody = type === 1 ? conceptBody.replace(/<\/conbody>/, ``) : conceptBody.replace(/<\/refbody>/, ``);

    let sections = [];

    if (!/<section>/g.test(conceptBody)) 
    { // If there are no sections, return
        eventLogger.logInfo(`No sections detected.`);
        return [];
    }

    if (/(<section>)([\s\S]*?)(?=<section>)/g.test(conceptBody)) 
    { // Verify if there are more than 1 sections
        sections = conceptBody.match(/(<section>)([\s\S]*?)(?=<section>)/g); // Get all sections

        for (let element of sections)
            conceptBody = conceptBody.replace(element, ``); // Remove them from the main
    }

    sections.push(conceptBody.match(/(<section>)[\s\S]*/)[0]); // Grab the "lonely" subsection

    eventLogger.logInfo(`Sections generated.`);
    return sections;
};

export const fixSections = (xml: string, type: number,  eventLogger: any) => 
{
    try {
        let auxArray = generateSections(xml, type, eventLogger);
        let tempReplacement: string;
    
        if (auxArray.length === 0)
            return (type === 1) ? xml : xml.replace(/<refbody>/, `<refbody>\n<section>`).replace(/<\/refbody>/, `</section>\n</refbody>`);
        

        for (let element of auxArray) 
        {
            tempReplacement = `${element.replace(/<\/section>/, ``)}\n</section>\n`;
            xml = xml.replace(element, tempReplacement);
        }
    
        return xml;
    } catch (error) {
        eventLogger.logError(`Unable to generate sections`);
        return;
    }
};