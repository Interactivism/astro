import { describe, it, expect } from 'vitest';
import { summaryToHtml, summaryToText } from './summary';

const LINKED = 'Here are the five. [Which one is yours?](#which-one-is-yours)';

describe('summaryToText', () => {
  it('flattens a link to its label', () => {
    expect(summaryToText(LINKED)).toBe('Here are the five. Which one is yours?');
  });

  it('leaves a summary without links alone', () => {
    expect(summaryToText('No links here.')).toBe('No links here.');
  });

  it('never leaves markdown syntax in a meta description', () => {
    expect(summaryToText(LINKED)).not.toMatch(/[[\]()#]/);
  });
});

describe('summaryToHtml', () => {
  it('renders a fragment link as an anchor to that id', () => {
    const html = summaryToHtml(LINKED);
    expect(html).toContain('href="#which-one-is-yours"');
    expect(html).toContain('>Which one is yours?</a>');
  });

  it('restates color and weight, so the link matches the text around it', () => {
    // DESIGN.md: the global `a` rule forces ink-900 at weight 500.
    const html = summaryToHtml(LINKED);
    expect(html).toContain('text-body');
    expect(html).toContain('font-light');
    expect(html).toContain('decoration-accent');
  });

  it('escapes HTML an editor types', () => {
    expect(summaryToHtml('5 < 6 & "quoted"')).toBe('5 &lt; 6 &amp; &quot;quoted&quot;');
  });

  it('neutralizes a script tag rather than emitting it', () => {
    expect(summaryToHtml('<script>alert(1)</script>')).not.toContain('<script>');
  });

  // The reason the pattern is fragment-only: this is the one place a summary
  // is rendered with set:html, so it must not be able to emit an arbitrary href.
  it.each([
    'javascript:alert(1)',
    'https://evil.example.com',
    '/velocity-profile/',
    '#bad id',
  ])('refuses to build an anchor for %s', (target) => {
    const html = summaryToHtml(`[click](${target})`);
    expect(html).not.toContain('<a');
  });

  it('leaves a refused target as visible literal text, not silently dropped', () => {
    expect(summaryToHtml('[click](https://evil.example.com)')).toContain('[click]');
  });

  it('agrees with summaryToText on which targets are links', () => {
    const external = '[click](https://example.com)';
    expect(summaryToText(external)).toBe(external);
    expect(summaryToHtml(external)).toContain('[click]');
  });
});
