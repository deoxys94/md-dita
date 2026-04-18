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

// ---------------------------------------------------------------------------
// GFM alert fixtures
// ---------------------------------------------------------------------------

export const GFM_ALERT_NOTE = `# My Topic

> [!NOTE]
> This is a note.`;

export const GFM_ALERT_TIP = `# My Topic

> [!TIP]
> This is a tip.`;

export const GFM_ALERT_IMPORTANT = `# My Topic

> [!IMPORTANT]
> This is important.`;

export const GFM_ALERT_WARNING = `# My Topic

> [!WARNING]
> This is a warning.`;

export const GFM_ALERT_CAUTION = `# My Topic

> [!CAUTION]
> This is a caution.`;

export const GFM_PLAIN_BLOCKQUOTE = `# My Topic

> This is a plain blockquote.`;

// ---------------------------------------------------------------------------
// Auto-detect fixtures
// ---------------------------------------------------------------------------

export const AUTO_PROSE_ONLY = `# Overview

Some introductory text with no lists or tables.

Another paragraph here.`;

export const AUTO_ORDERED_LIST = `# Installation Steps

1. Download the package
2. Run the installer
3. Verify the installation`;

export const AUTO_PIPE_TABLE = `# API Reference

| Parameter | Type   | Description      |
|-----------|--------|------------------|
| id        | string | The resource ID  |
| name      | string | The display name |`;

export const AUTO_HTML_TABLE = `# Configuration

<table>
  <thead><tr><th>Key</th><th>Value</th></tr></thead>
  <tbody><tr><td>debug</td><td>false</td></tr></tbody>
</table>`;

export const AUTO_TABLE_AND_ORDERED_LIST = `# Mixed Content

| Column A | Column B |
|----------|----------|
| Value 1  | Value 2  |

1. First step
2. Second step`;

export const AUTO_LIST_IN_FENCE = `# Documentation

Some prose here.

\`\`\`
1. This is inside a code block
2. Should not trigger task detection
\`\`\`

More prose after the block.`;

export const AUTO_INDENTED_LIST = `# My Topic

Some text.

  1. This list is indented — not a top-level ordered list`;

export const AUTO_LARGE_ORDERED_LIST = `# Setup Guide

1. Step one
2. Step two
3. Step three
4. Step four
5. Step five
6. Step six
7. Step seven
8. Step eight
9. Step nine
10. Step ten
11. Step eleven`;
