import { describe, it, expect } from 'vitest';
import { detectTopicType } from '../src/cli/autoDetect';
import {
    AUTO_PROSE_ONLY,
    AUTO_ORDERED_LIST,
    AUTO_PIPE_TABLE,
    AUTO_HTML_TABLE,
    AUTO_TABLE_AND_ORDERED_LIST,
    AUTO_LIST_IN_FENCE,
    AUTO_INDENTED_LIST,
    AUTO_LARGE_ORDERED_LIST,
} from './fixtures';

describe('detectTopicType', () =>
{
    it('returns concept for plain prose with no lists or tables', () =>
    {
        expect(detectTopicType(AUTO_PROSE_ONLY)).toBe('concept');
    });

    it('returns task for a top-level ordered list', () =>
    {
        expect(detectTopicType(AUTO_ORDERED_LIST)).toBe('task');
    });

    it('returns reference for a pipe table', () =>
    {
        expect(detectTopicType(AUTO_PIPE_TABLE)).toBe('reference');
    });

    it('returns reference for an HTML <table> element', () =>
    {
        expect(detectTopicType(AUTO_HTML_TABLE)).toBe('reference');
    });

    it('returns reference (not task) when file has both table and ordered list — table wins', () =>
    {
        expect(detectTopicType(AUTO_TABLE_AND_ORDERED_LIST)).toBe('reference');
    });

    it('returns concept when an ordered list appears only inside a fenced code block', () =>
    {
        expect(detectTopicType(AUTO_LIST_IN_FENCE)).toBe('concept');
    });

    it('returns concept for an indented ordered list (not at column 0)', () =>
    {
        expect(detectTopicType(AUTO_INDENTED_LIST)).toBe('concept');
    });

    it('returns task for a large ordered list with double-digit item numbers', () =>
    {
        expect(detectTopicType(AUTO_LARGE_ORDERED_LIST)).toBe('task');
    });

    it('returns concept for an empty string', () =>
    {
        expect(detectTopicType('')).toBe('concept');
    });
});
