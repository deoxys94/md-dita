import { describe, it, expect, beforeEach } from 'vitest';
import { MdDita } from '../src/md-dita';
import { FlavorType } from '../src/types';
import {
    GFM_ALERT_NOTE,
    GFM_ALERT_TIP,
    GFM_ALERT_IMPORTANT,
    GFM_ALERT_WARNING,
    GFM_ALERT_CAUTION,
    GFM_PLAIN_BLOCKQUOTE,
} from './fixtures';

let mdDita: MdDita;
beforeEach(() => {
    mdDita = new MdDita({ flavor: FlavorType.GFM, verbose: false });
});

// ---------------------------------------------------------------------------
// GFM ALERTS — > [!TYPE] blockquotes become DITA <note> elements
// ---------------------------------------------------------------------------

describe('GFM alerts', () => {
    it('converts [!NOTE] to <note> with no type attribute', () => {
        const result = mdDita.mdToConcept(GFM_ALERT_NOTE);
        expect(result).toContain('<note>');
        expect(result).toContain('This is a note.');
        expect(result).not.toContain('[!NOTE]');
    });

    it('converts [!TIP] to <note type="tip">', () => {
        const result = mdDita.mdToConcept(GFM_ALERT_TIP);
        expect(result).toContain('<note type="tip">');
        expect(result).toContain('This is a tip.');
        expect(result).not.toContain('[!TIP]');
    });

    it('converts [!IMPORTANT] to <note type="important">', () => {
        const result = mdDita.mdToConcept(GFM_ALERT_IMPORTANT);
        expect(result).toContain('<note type="important">');
        expect(result).toContain('This is important.');
        expect(result).not.toContain('[!IMPORTANT]');
    });

    it('converts [!WARNING] to <note type="warning">', () => {
        const result = mdDita.mdToConcept(GFM_ALERT_WARNING);
        expect(result).toContain('<note type="warning">');
        expect(result).toContain('This is a warning.');
        expect(result).not.toContain('[!WARNING]');
    });

    it('converts [!CAUTION] to <note type="caution">', () => {
        const result = mdDita.mdToConcept(GFM_ALERT_CAUTION);
        expect(result).toContain('<note type="caution">');
        expect(result).toContain('This is a caution.');
        expect(result).not.toContain('[!CAUTION]');
    });

    it('leaves plain blockquotes as <lq>', () => {
        const result = mdDita.mdToConcept(GFM_PLAIN_BLOCKQUOTE);
        expect(result).toContain('<lq>');
        expect(result).toContain('This is a plain blockquote.');
        expect(result).not.toContain('<note');
    });
});
