export const conceptReferenceFix = (xml: string, type: number) => {
    // Step 3: Extract id attribute value from concept tag
    let id = xml.match(/<title>(.*?)<\/title>/)[0];
    id = id.replace(`<title>`, ``).replace(`</title>`, ``);

    // Step 4: Modify and insert the id attribute value back into the concept tag
    id = id.replace(/[^A-Za-z0-9 ]/g, "").replace(/\s+/g, "_");

    xml = type === 1 ? xml.replace(/<concept\s+.*?id=".*?"/, `<concept id="${id}"`) : xml.replace(/<reference\s+.*?id=".*?"/, `<reference id="${id}"`);

    console.info(`[Info] Transformed markdown to DITA Concept/Reference.`);
    
    return xml;
}