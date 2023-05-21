const generateSections = (xml: string, type: number) => 
{
    let conceptBody = type === 1 ? xml.match(/<conbody[\s\S]+?<\/conbody>/)[0] : xml.match(/<refbody[\s\S]+?<\/refbody>/)[0]; // Get all the content inside the conbody/refbody element
    conceptBody = type === 1 ? conceptBody.replace(/<conbody>/, ``) : conceptBody.replace(/<refbody>/, ``);
    conceptBody = type === 1 ? conceptBody.replace(/<\/conbody>/, ``) : conceptBody.replace(/<\/refbody>/, ``);

    let sections = [];

    if (!/<section>/g.test(conceptBody)) 
    { // If there are no sections, return
        console.info(`[Info] No sections detected.`);
        return [];
    }

    if (/(<section>)([\s\S]*?)(?=<section>)/g.test(conceptBody)) 
    { // Verify if there are more than 1 sections
        sections = conceptBody.match(/(<section>)([\s\S]*?)(?=<section>)/g); // Get all sections

        for (let element of sections)
            conceptBody = conceptBody.replace(element, ``); // Remove them from the main
    }

    sections.push(conceptBody.match(/(<section>)[\s\S]*/)[0]); // Grab the "lonely" subsection

    console.log(`[Info] sections generated.`);
    return sections;
};

export const fixSections = (xml: string, type: number) => 
{
    try {
        let auxArray = generateSections(xml, type);
        let tempReplacement: string;
    
        if (auxArray.length === 0)
            return xml;
    
        for (let element of auxArray) 
        {
            tempReplacement = `${element.replace(/<\/section>/, ``)}\n</section>\n`;
            xml = xml.replace(element, tempReplacement);
        }
    
        return xml;
    } catch (error) {
        console.error(error)
    }
};