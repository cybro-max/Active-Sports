import React from 'react';

interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Reusable component to inject Schema.org JSON-LD structured data into the page.
 * This is critical for SEO and getting "Rich Snippets" in Google results.
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
