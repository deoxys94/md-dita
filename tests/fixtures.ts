/**
 * Shared markdown input strings used across test files.
 *
 * Why a separate file? Avoid copy-pasting the same strings in every test.
 * If the format of a fixture needs to change, you change it in one place.
 */

// ---------------------------------------------------------------------------
// Concept fixtures
// ---------------------------------------------------------------------------

export const CONCEPT_BASIC = `# My Concept

Some paragraph text here.`;

export const CONCEPT_WITH_SECTION = `# My Concept

Intro paragraph.

## Section Title

Section content.`;

export const CONCEPT_WITH_CODE = `# My Concept

Inline \`code here\` in text.

\`\`\`
code block
line two
\`\`\``;

export const CONCEPT_WITH_BOLD_ITALIC = `# My Concept

**Bold text** and *italic text* in a paragraph.`;

export const CONCEPT_WITH_LINK = `# My Concept

Visit [example](http://example.com) for details.`;

export const CONCEPT_WITH_IMAGE = `# My Concept

![Alt text](images/photo.png)`;

export const CONCEPT_WITH_LIST = `# My Concept

- First item
- Second item
- Third item`;

export const CONCEPT_NO_H1 = `## No H1 here

Just a subheading and text.`;

export const CONCEPT_EMPTY = ``;

// ---------------------------------------------------------------------------
// Reference fixtures
// ---------------------------------------------------------------------------

export const REFERENCE_BASIC = `# My Reference

Some reference content.`;

export const REFERENCE_WITH_TABLE = `# My Reference

| Column A | Column B |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |`;

export const REFERENCE_NO_H1 = `## Subheading only

No H1 present.`;

// ---------------------------------------------------------------------------
// Task fixtures
// ---------------------------------------------------------------------------

export const TASK_BASIC = `# My Task

1. Do the first thing
2. Do the second thing
3. Do the third thing`;

export const TASK_WITH_CONTEXT = `# My Task

Some context before the steps.

1. First step
2. Second step`;

export const TASK_NO_H1 = `## No H1

1. A step without a topic title`;
