import { fixSubtasks } from "./subtasks";
import * as cheerio from "cheerio";
import { simpleLogger } from "../md-dita";

const fixClutteredCmd = ($cmd: any) =>
{
  // Find any p, ul, or ol elements that are direct children of cmd
  const $elementsToMove = $cmd.children("p, ul, ol");

  // If we found any elements to move
  if ($elementsToMove.length > 0) $cmd.after($elementsToMove); // Move them after the cmd element
};

export const fixTask = (xml: string, eventLogger: simpleLogger) =>
{
  eventLogger.logInfo(`Fixing task elements`);
  try
  {
    xml = fixSubtasks(xml, eventLogger);

    if (xml === ``) return ``;

    // Load the XML into Cheerio
    const $ = cheerio.load(xml, {
      xml: true,
    });

    // Step 3: Extract the first title element's content
    const titleContent = $("title").first().text();

    // Step 4: Modify and create ID from title
    const id = (titleContent
      .replace(/[^A-Za-z0-9 ]/g, "")
      .replace(/\s+/g, "_")
      .toLowerCase()) || "task";

    // Replace the id of the <concept> element
    $("task[id]").first().attr("id", id);

    // Select all the taskboody elements
    $("taskbody").each((_, element) =>
    {
      // Check if there is a child <steps> in the element
      if ($(element).children("steps").length === 0)
      {
        // If not, wrap the contents of the element with <context></context>
        $(element).wrapInner("<context></context>");
        return;
      }

      if ($(element).children("steps").length > 1)
      {
        // Iterate over all the steps elements
        $(element)
          .children("steps:not(:first)")
          .each((_, stepsElement) =>
          {
            const olContent = $(stepsElement)
              .children("step")
              .map((_, step) => "<li>" + $(step).html() + "</li>")
              .get()
              .join("");
            $(stepsElement).replaceWith("<ol>" + olContent + "</ol>");
          });
      }

      // Wrap the contents before <steps> with a <context></context>
      const prevElements = $(element)
        .children("steps")
        .prevAll()
        .toArray()
        .reverse();

      if (prevElements.length > 0)
      {
        $(prevElements).wrapAll("<context></context>");
      }

      $(element).children("steps").nextAll().wrapAll("<result></result>"); // Wrap the contents after <steps> with a <postreq></postreq>

      // Select the child steps element
      $(element)
        .children("steps")
        .each((_, stepsElement) =>
        {
          // Select all the step elements
          $(stepsElement)
            .children("step")
            .each((_, stepElement) =>
            {
              if ($(stepElement).children("p").length === 0)
                $(stepElement).wrapInner("<cmd></cmd>"); // If there are none, wrap the contents of the step element with a <cmd> element
              else
                $(stepElement)
                  .children("p")
                  .first()
                  .replaceWith(
                    (_, pElement) => `<cmd>${$(pElement).html()}</cmd>`,
                  ); // Replace the first <p> element with a <cmd> element preserving the contents

              fixClutteredCmd($(stepElement).children("cmd")); // Check if there are any p, ul, or ol elements that are direct children of cmd

              // Wrap the contents after the <cmd> element with a <info> element
              $(stepElement).children("cmd").nextAll().wrapAll("<info></info>");
            });
        });
    });

    return $.html();
  } catch (error)
  {
    eventLogger.logError(
      `Unable to convert document to DITA XML. Please try again. (Error Code: 303)\n${error}`,
    );
    return ``;
  }
};
