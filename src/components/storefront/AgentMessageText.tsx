import { Fragment } from "react";
import { Link } from "react-router-dom";

/**
 * Renders the agent's reply text with real, tappable links.
 *
 * The model is instructed to write a bare path (e.g. "/checkout",
 * "/product/chicken-curry-cut") when it wants to point somewhere on the site,
 * rather than markdown or a full URL — this is the other half of that
 * contract: turning that plain text into an actual link, since a raw string
 * in a chat bubble was not clickable at all.
 *
 * Internal paths become a client-side router Link (no full page reload) and
 * close the assistant panel on click, so the customer actually sees the page
 * they were sent to instead of it being hidden behind the fullscreen widget.
 * External URLs open in a new tab. Everything else is plain text.
 */

// A leading-slash path: /checkout, /product/some-slug, /track-order?x=1 — stops
// at whitespace or a closing bracket/paren so it doesn't swallow trailing prose.
const PATH_PATTERN = /(?<![\w/])\/[a-zA-Z0-9][\w\-./?=&%]*/g;
const URL_PATTERN = /https?:\/\/[^\s)\]]+/g;
const COMBINED_PATTERN = new RegExp(
  `${URL_PATTERN.source}|${PATH_PATTERN.source}`,
  "g",
);

export function AgentMessageText({
  text,
  onNavigate,
}: {
  text: string;
  onNavigate: () => void;
}) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  COMBINED_PATTERN.lastIndex = 0;
  while ((match = COMBINED_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Fragment key={key++}>{text.slice(lastIndex, match.index)}</Fragment>,
      );
    }

    const token = match[0];
    if (token.startsWith("http")) {
      parts.push(
        <a
          key={key++}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--store-red)] underline underline-offset-2"
        >
          {token}
        </a>,
      );
    } else {
      // Strip a trailing punctuation mark that is prose, not part of the path
      // (e.g. "...at /checkout." should not link the final period).
      const trailingPunctuation = /[.,;:!?]+$/.exec(token);
      const cleanPath = trailingPunctuation
        ? token.slice(0, -trailingPunctuation[0].length)
        : token;
      const suffix = trailingPunctuation ? trailingPunctuation[0] : "";

      parts.push(
        <Link
          key={key++}
          to={cleanPath}
          onClick={onNavigate}
          className="font-semibold text-[var(--store-red)] underline underline-offset-2"
        >
          {cleanPath}
        </Link>,
      );
      if (suffix) parts.push(<Fragment key={key++}>{suffix}</Fragment>);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }

  return <>{parts}</>;
}
