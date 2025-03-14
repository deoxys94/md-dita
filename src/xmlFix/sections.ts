/**
 * Gets the contents of each section from a given "raw" XML
 * 
 * Due to limitations with Markdown, Markdown-it can only return something like this:
 * ```
 *  <refbody>
 *      <section>
 *        <title>Foo bar 1</title>
 *      </section>
 *       Lorem ipsum dolor sit amet...
 *      <section>
 *        <title>Foo bar 2</title>
 *      </section>
 *      Lorem ipsum dolor sit amet...
 * </refbody>
 * ````
 * The idea of this method is grabbing the content between an opening section tag and the line right before the next one. For example
 * 
 * ```
 *      <section>
 *        <title>Foo bar 1</title>
 *      </section>
 *       Lorem ipsum dolor sit amet...
 * ```
 * 
 *  This will be useful later to generate the sections properly later on
 */
const generateSections = (xml: string, type: number,  eventLogger: any): string[] => 
{
    // Regular expressions
    const refbodyPattern: RegExp = /<refbody[\s\S]+?<\/refbody>/;
    const conbodyPattern: RegExp = /<conbody[\s\S]+?<\/conbody>/;
    const sectionPattern: RegExp = /(<section>)([\s\S]*?)(?=<section>)/g;
    const lastSectionPattern: RegExp = /(<section>)[\s\S]*/;

    let sections: string[] = [];
    let topicBody = type === 1 ? xml.match(conbodyPattern)[0] : xml.match(refbodyPattern)[0]; // Get all the content inside the conbody/refbody element

    // Get rid of both the opening and closing tag
    topicBody = type === 1 ? topicBody.replace("<conbody>", ``) : topicBody.replace("<refbody>", ``);
    topicBody = type === 1 ? topicBody.replace("<\/conbody>", ``) : topicBody.replace("<\/refbody>", ``); 

    // Check if there are any sections
    if (!topicBody.includes("<section>")) 
    { // If there are no sections, return
        eventLogger.logInfo(`No sections detected.`);
        return [];
    }

    // Check how many sections there are
    if (sectionPattern.test(topicBody)) 
    {
        // Grab everything between two opening section tags
        sections = topicBody.match(sectionPattern);

        for (let element of sections)
            topicBody = topicBody.replace(element, ``); // Remove the contents from the actual XML object
    }

    // The last section always remains by itself. Grab it as well
    sections.push(topicBody.match(lastSectionPattern)[0]); 

    eventLogger.logInfo(`Sections generated.`);
    return sections;
};

/**
 * Fixes the sections based on the information from the generateSections function.
 * After getting the "raw" sections, this function will clean them up and put them in the correct place
 */
export const fixSections = (xml: string, type: number,  eventLogger: any) => 
{
    const refbodyPattern: RegExp = /<refbody>\n<section>/;
    try 
    {
        let auxArray: string[] = generateSections(xml, type, eventLogger); // Get the raw sections
        let tempReplacement: string = ``;
    
        if (auxArray.length === 0) // Check if there are any sections
            return (type === 1) ? xml : xml.replace("<refbody>", `<refbody>\n<section>`).replace("</refbody>", `</section>\n</refbody>`); // If there are no sections, return a refbody with one section

        for (let element of auxArray) 
        {
            tempReplacement = element.replace(`</section>`, ``); // Remove the closing section tag right next to the title
            tempReplacement = `${tempReplacement}\n</section>\n`; // Add the right closing section tag

            xml = xml.replace(element, tempReplacement); // Replace the raw section with the cleaned one
        }
    
        if(type === 2) // If it's a reference, fix the malformed refbody
        {
            if(!refbodyPattern.test(xml))
                xml = xml.replace("<section>", `</section>\n<section>`).replace("<refbody>", `<refbody>\n<section>`)
        }

        return xml;
    } catch (error) {
        eventLogger.logError(`Unable to generate sections`);
        return;
    }
};
