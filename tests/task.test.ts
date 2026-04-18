/**
 * Tests for mdToTask().
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MdDita } from '../src/md-dita';
import {
    TASK_BASIC,
    TASK_NO_H1,
    TASK_WITH_CONTEXT,
} from './fixtures';

let mdDita: MdDita;
beforeEach(() => {
    mdDita = new MdDita(false);
});

// ---------------------------------------------------------------------------
// STRUCTURE
// ---------------------------------------------------------------------------

describe('task structure', () => {
    it('produces valid XML declaration', () => {
        const result = mdDita.mdToTask(TASK_BASIC);
        expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
    });

    it('produces DOCTYPE for task', () => {
        const result = mdDita.mdToTask(TASK_BASIC);
        expect(result).toContain('<!DOCTYPE task');
    });

    it('wraps content in <task> element', () => {
        const result = mdDita.mdToTask(TASK_BASIC);
        expect(result).toContain('<task');
        expect(result).toContain('</task>');
    });

    it('contains <taskbody> element', () => {
        const result = mdDita.mdToTask(TASK_BASIC);
        expect(result).toContain('<taskbody>');
        expect(result).toContain('</taskbody>');
    });

    it('sets xml:lang attribute to en-us', () => {
        const result = mdDita.mdToTask(TASK_BASIC);
        expect(result).toContain('xml:lang="en-us"');
    });
});

// ---------------------------------------------------------------------------
// TITLE
// ---------------------------------------------------------------------------

describe('task title', () => {
    it('converts H1 to <title>', () => {
        const result = mdDita.mdToTask(TASK_BASIC);
        expect(result).toContain('<title>My Task</title>');
    });

    it('generates topic id from H1 text (lowercase, spaces become underscores)', () => {
        const result = mdDita.mdToTask(TASK_BASIC);
        expect(result).toContain('id="my_task"');
    });

    it('replaces placeholder id with real id', () => {
        const result = mdDita.mdToTask(TASK_BASIC);
        expect(result).not.toContain('topic-id-placeholder');
    });
});

// ---------------------------------------------------------------------------
// STEPS — ordered lists become DITA steps
// ---------------------------------------------------------------------------

describe('task steps', () => {
    it('converts ordered list to <steps>', () => {
        const result = mdDita.mdToTask(TASK_BASIC);
        expect(result).toContain('<steps>');
        expect(result).toContain('</steps>');
    });

    it('wraps each list item in <step>', () => {
        const result = mdDita.mdToTask(TASK_BASIC);
        expect(result).toContain('<step>');
        expect(result).toContain('</step>');
    });

    it('wraps step content in <cmd>', () => {
        const result = mdDita.mdToTask(TASK_BASIC);
        expect(result).toContain('<cmd>');
        expect(result).toContain('Do the first thing');
    });

    it('includes all steps', () => {
        const result = mdDita.mdToTask(TASK_BASIC);
        expect(result).toContain('Do the first thing');
        expect(result).toContain('Do the second thing');
        expect(result).toContain('Do the third thing');
    });
});

// ---------------------------------------------------------------------------
// CONTEXT — paragraphs before steps become <context>
// ---------------------------------------------------------------------------

describe('task context', () => {
    it('wraps pre-step paragraphs in <context>', () => {
        const result = mdDita.mdToTask(TASK_WITH_CONTEXT);
        expect(result).toContain('<context>');
        expect(result).toContain('Some context before the steps.');
    });
});

// ---------------------------------------------------------------------------
// ERROR CASES
// ---------------------------------------------------------------------------

describe('task error cases', () => {
    it('returns empty string when no H1 present', () => {
        const result = mdDita.mdToTask(TASK_NO_H1);
        expect(result).toBe('');
    });

    it('returns empty string for empty input', () => {
        const result = mdDita.mdToTask('');
        expect(result).toBe('');
    });
});
