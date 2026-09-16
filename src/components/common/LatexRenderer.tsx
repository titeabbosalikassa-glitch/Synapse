import React from 'react';
import katex from 'katex';

interface LatexRendererProps {
  content: string;
  className?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split content by $$ (block math) and $ (inline math)
  // Format tokens into segments
  const renderMathSegments = (text: string) => {
    // Check if there are block math delimiters $$...$$
    const blockRegex = /\$\$([\s\S]+?)\$\$/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = blockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderInlineMath(text.slice(lastIndex, match.index), `text-${lastIndex}`));
      }

      const formula = match[1];
      try {
        const html = katex.renderToString(formula, {
          displayMode: true,
          throwOnError: false,
        });
        parts.push(
          <div
            key={`block-${match.index}`}
            className="my-2 overflow-x-auto py-1 text-slate-800"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (err) {
        parts.push(
          <pre key={`block-err-${match.index}`} className="font-mono text-xs bg-slate-100 p-2 rounded">
            {formula}
          </pre>
        );
      }

      lastIndex = blockRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(renderInlineMath(text.slice(lastIndex), `text-${lastIndex}`));
    }

    return parts;
  };

  const renderInlineMath = (inlineText: string, keyPrefix: string) => {
    const inlineRegex = /\$([^\$]+?)\$/g;
    const elements: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = inlineRegex.exec(inlineText)) !== null) {
      if (match.index > lastIdx) {
        // Plain text with line breaks preserved
        const segment = inlineText.slice(lastIdx, match.index);
        elements.push(
          <span key={`${keyPrefix}-seg-${lastIdx}`} className="whitespace-pre-wrap">
            {segment}
          </span>
        );
      }

      const inlineFormula = match[1];
      try {
        const html = katex.renderToString(inlineFormula, {
          displayMode: false,
          throwOnError: false,
        });
        elements.push(
          <span
            key={`${keyPrefix}-inline-${match.index}`}
            className="inline-math mx-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (e) {
        elements.push(
          <code key={`${keyPrefix}-err-${match.index}`} className="bg-slate-100 text-xs px-1 rounded">
            ${inlineFormula}$
          </code>
        );
      }

      lastIdx = inlineRegex.lastIndex;
    }

    if (lastIdx < inlineText.length) {
      elements.push(
        <span key={`${keyPrefix}-end-${lastIdx}`} className="whitespace-pre-wrap">
          {inlineText.slice(lastIdx)}
        </span>
      );
    }

    return <React.Fragment key={keyPrefix}>{elements}</React.Fragment>;
  };

  return <div className={`latex-content leading-relaxed ${className}`}>{renderMathSegments(content)}</div>;
};
