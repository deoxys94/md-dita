import { TopicTypeString } from "../types";

/**
 * Detects the most appropriate DITA topic type for a Markdown document
 * based on structural signals in the raw text.
 *
 * Detection order (first match wins):
 *   1. Table (pipe or HTML) → reference
 *   2. Top-level ordered list (line starts at col 0 with digit+period) → task
 *   3. Fallback → concept
 *
 * NOTE: Table is checked before ordered list because tables are a stronger
 * structural signal for reference material. Ordered lists can appear in any
 * document type as supporting content.
 */
export function detectTopicType(markdown: string): TopicTypeString
{
    if (hasTable(markdown)) return 'reference';
    if (hasTopLevelOrderedList(markdown)) return 'task';
    return 'concept';
}

function hasTable(md: string): boolean
{
    // Pipe table: any line that starts with | and contains at least one more |
    const pipeTable = /^\|.+\|/m;
    // HTML table tag
    const htmlTable = /<table[\s>]/i;
    return pipeTable.test(md) || htmlTable.test(md);
}

function hasTopLevelOrderedList(md: string): boolean
{
    // A line starting at column 0 with a digit, period, and space.
    // Skips content inside fenced code blocks to avoid false positives.
    const lines = md.split('\n');
    let inFence = false;
    for (const line of lines)
    {
        if (/^```/.test(line)) { inFence = !inFence; continue; }
        if (inFence) continue;
        if (/^\d+\.\s/.test(line)) return true;
    }
    return false;
}
