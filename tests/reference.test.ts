/**
 * Tests for mdToReference().
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MdDita } from '../src/md-dita';
import {
    REFERENCE_BASIC,
    REFERENCE_NO_H1,
    REFERENCE_WITH_TABLE,
} from './fixtures';

let mdDita: MdDita;
beforeEach(() => {
    mdDita = new MdDita({ verbose: false });
});

// ---------------------------------------------------------------------------
// STRUCTURE
// ---------------------------------------------------------------------------

describe('reference structure', () => {
    it('produces valid XML declaration', () => {
        const result = mdDita.mdToReference(REFERENCE_BASIC);
        expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
    });

    it('produces DOCTYPE for reference', () => {
        const result = mdDita.mdToReference(REFERENCE_BASIC);
        expect(result).toContain('<!DOCTYPE reference');
    });

    it('wraps content in <reference> element', () => {
        const result = mdDita.mdToReference(REFERENCE_BASIC);
        expect(result).toContain('<reference');
        expect(result).toContain('</reference>');
    });

    it('contains <refbody> element', () => {
        const result = mdDita.mdToReference(REFERENCE_BASIC);
        expect(result).toContain('<refbody>');
        expect(result).toContain('</refbody>');
    });

    it('sets xml:lang attribute to en-us', () => {
        const result = mdDita.mdToReference(REFERENCE_BASIC);
        expect(result).toContain('xml:lang="en-us"');
    });
});

// ---------------------------------------------------------------------------
// TITLE
// ---------------------------------------------------------------------------

describe('reference title', () => {
    it('converts H1 to <title>', () => {
        const result = mdDita.mdToReference(REFERENCE_BASIC);
        expect(result).toContain('<title>My Reference</title>');
    });

    it('generates topic id from H1 text (lowercase, spaces become underscores)', () => {
        const result = mdDita.mdToReference(REFERENCE_BASIC);
        expect(result).toContain('id="my_reference"');
    });

    it('replaces placeholder id with real id', () => {
        const result = mdDita.mdToReference(REFERENCE_BASIC);
        expect(result).not.toContain('topic-id-placeholder');
    });
});

// ---------------------------------------------------------------------------
// TABLES — reference topics commonly use tables
// ---------------------------------------------------------------------------

describe('reference tables', () => {
    it('converts markdown table to DITA <table>', () => {
        const result = mdDita.mdToReference(REFERENCE_WITH_TABLE);
        expect(result).toContain('<table>');
        expect(result).toContain('</table>');
    });

    it('contains table header row', () => {
        const result = mdDita.mdToReference(REFERENCE_WITH_TABLE);
        expect(result).toContain('Column A');
        expect(result).toContain('Column B');
    });

    it('contains table data cells', () => {
        const result = mdDita.mdToReference(REFERENCE_WITH_TABLE);
        expect(result).toContain('Cell 1');
        expect(result).toContain('Cell 4');
    });

    it('generates <tgroup> with cols attribute', () => {
        const result = mdDita.mdToReference(REFERENCE_WITH_TABLE);
        expect(result).toContain('<tgroup');
        expect(result).toContain('cols="2"');
    });
});

// ---------------------------------------------------------------------------
// ERROR CASES
// ---------------------------------------------------------------------------

describe('reference error cases', () => {
    it('returns empty string when no H1 present', () => {
        const result = mdDita.mdToReference(REFERENCE_NO_H1);
        expect(result).toBe('');
    });

    it('returns empty string for empty input', () => {
        const result = mdDita.mdToReference('');
        expect(result).toBe('');
    });
});
