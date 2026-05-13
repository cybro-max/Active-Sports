'use client';

import React from 'react';

export default function WidgetConfig({ apiKey }: { apiKey?: string }) {
  return (
    <api-sports-widget 
      data-type="config"
      data-key={apiKey}
      data-sport="football"
      data-theme="dark"
      suppressHydrationWarning
    ></api-sports-widget>
  );
}
