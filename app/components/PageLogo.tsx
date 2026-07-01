'use client';

import { useEffect } from 'react';

export default function PageLogo({ logo }: { logo?: string }) {
  useEffect(() => {
    if (logo) {
      document.body.dispatchEvent(
        new CustomEvent('pagelogo', { detail: logo })
      );
    }
  }, [logo]);

  return null;
}
