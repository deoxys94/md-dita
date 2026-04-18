/**
 * Tests for mdToConcept().
 *
 * HOW TO READ THESE TESTS:
 *   describe() = a group of related tests
 *   it()       = one individual test case
 *   expect()   = "I expect this value to [pass some check]"
 *
 * Common matchers used here:
 *   .toContain(str)       → output must include this substring
 *   .not.toContain(str)   → output must NOT include this substring
 *   .toBe(value)          → output must equal this exactly
 *   .toMatch(/regex/)     → output must match this pattern
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MdDita } from '../src/md-dita';
import {
    CONCEPT_BASIC,
    CONCEPT_EMPTY,
    CONCEPT_NO_H1,
    CONCEPT_WITH_BOLD_ITALIC,
    CONCEPT_WITH_CODE,
    CONCEPT_WITH_IMAGE,
    CONCEPT_WITH_LINK,
    CONCEPT_WITH_LIST,
    CONCEPT_WITH_SECTION,
} from './fixtures';

// Create one MdDita instance shared across all concept tests.
// verbose=false → suppresses console output during tests.
let mdDita: MdDita;
beforeEach(() => {
    mdDita = new MdDita(false);
});

// ---------------------------------------------------------------------------
// STRUCTURE — does the output have the right DITA skeleton?
// ---------------------------------------------------------------------------

describe('concept structure', () => {
    it('produces valid XML declaration', () => {
        const result = mdDita.mdToConcept(CONCEPT_BASIC);
        expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
    });

    it('produces DOCTYPE for concept', () => {
        const result = mdDita.mdToConcept(CONCEPT_BASIC);
        expect(result).toContain('<!DOCTYPE concept');
    });

    it('wraps content in <concept> element', () => {
        const result = mdDita.mdToConcept(CONCEPT_BASIC);
        expect(result).toContain('<concept');
        expect(result).toContain('</concept>');
    });

    it('contains <conbody> element', () => {
        const result = mdDita.mdToConcept(CONCEPT_BASIC);
        expect(result).toContain('<conbody>');
        expect(result).toContain('</conbody>');
    });

    it('sets xml:lang attribute to en-us', () => {
        const result = mdDita.mdToConcept(CONCEPT_BASIC);
        expect(result).toContain('xml:lang="en-us"');
    });
});

// ---------------------------------------------------------------------------
// TITLE — H1 becomes the topic title and generates the topic ID
// ---------------------------------------------------------------------------

describe('concept title', () => {
    it('converts H1 to <title>', () => {
        const result = mdDita.mdToConcept(CONCEPT_BASIC);
        expect(result).toContain('<title>My Concept</title>');
    });

    it('generates topic id from H1 text (lowercase, spaces become underscores)', () => {
        const result = mdDita.mdToConcept(CONCEPT_BASIC);
        // "My Concept" → id="my_concept"
        expect(result).toContain('id="my_concept"');
    });

    it('replaces placeholder id with real id', () => {
        const result = mdDita.mdToConcept(CONCEPT_BASIC);
        expect(result).not.toContain('topic-id-placeholder');
    });
});

// ---------------------------------------------------------------------------
// SECTIONS — H2 headings become <section> elements
// ---------------------------------------------------------------------------

describe('concept sections', () => {
    it('converts H2 to <section> with <title>', () => {
        const result = mdDita.mdToConcept(CONCEPT_WITH_SECTION);
        expect(result).toContain('<section');
        expect(result).toContain('<title>Section Title</title>');
    });

    it('wraps section content inside <section>', () => {
        const result = mdDita.mdToConcept(CONCEPT_WITH_SECTION);
        expect(result).toContain('Section content.');
    });
});

// ---------------------------------------------------------------------------
// INLINE ELEMENTS
// ---------------------------------------------------------------------------

describe('concept inline elements', () => {
    it('converts inline code to <codeph>', () => {
        const result = mdDita.mdToConcept(CONCEPT_WITH_CODE);
        expect(result).toContain('<codeph>code here</codeph>');
    });

    it('converts fenced code block to <codeblock>', () => {
        const result = mdDita.mdToConcept(CONCEPT_WITH_CODE);
        expect(result).toContain('<codeblock>');
        expect(result).toContain('code block');
    });

    it('converts bold (**text**) to <uicontrol>', () => {
        const result = mdDita.mdToConcept(CONCEPT_WITH_BOLD_ITALIC);
        expect(result).toContain('<uicontrol>Bold text</uicontrol>');
    });

    it('converts italic (*text*) to <cite>', () => {
        const result = mdDita.mdToConcept(CONCEPT_WITH_BOLD_ITALIC);
        expect(result).toContain('<cite>italic text</cite>');
    });

    it('converts link to <xref> with href', () => {
        const result = mdDita.mdToConcept(CONCEPT_WITH_LINK);
        expect(result).toContain('<xref');
        expect(result).toContain('href="http://example.com"');
        expect(result).toContain('>example</xref>');
    });

    it('adds format="html" and scope="external" to external links', () => {
        const result = mdDita.mdToConcept(CONCEPT_WITH_LINK);
        expect(result).toContain('format="html"');
        expect(result).toContain('scope="external"');
    });

    it('converts image to <image> element with href', () => {
        const result = mdDita.mdToConcept(CONCEPT_WITH_IMAGE);
        expect(result).toContain('<image');
        expect(result).toContain('href="images/photo.png"');
        // NOTE: alt text is currently lost during conversion (known bug —
        // markdown-it does not surface alt text to the custom image rule).
        // When that bug is fixed, add: expect(result).toContain('alt="Alt text"')
    });
});

// ---------------------------------------------------------------------------
// LISTS
// ---------------------------------------------------------------------------

describe('concept lists', () => {
    it('converts unordered list to <ul>', () => {
        const result = mdDita.mdToConcept(CONCEPT_WITH_LIST);
        expect(result).toContain('<ul>');
        expect(result).toContain('</ul>');
    });

    it('wraps list items in <li>', () => {
        const result = mdDita.mdToConcept(CONCEPT_WITH_LIST);
        expect(result).toContain('<li>');
        expect(result).toContain('First item');
        expect(result).toContain('Second item');
        expect(result).toContain('Third item');
    });
});

// ---------------------------------------------------------------------------
// ERROR CASES — bad input must not crash, must return empty string
// ---------------------------------------------------------------------------

describe('concept error cases', () => {
    it('returns empty string when no H1 present', () => {
        const result = mdDita.mdToConcept(CONCEPT_NO_H1);
        expect(result).toBe('');
    });

    it('returns empty string for empty input', () => {
        const result = mdDita.mdToConcept(CONCEPT_EMPTY);
        expect(result).toBe('');
    });
});
