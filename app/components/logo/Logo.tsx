'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Logo({ logo }: { logo?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (logo) {
      document.body.dispatchEvent(
        new CustomEvent('pagelogo', { detail: logo })
      );
    }
  }, [logo, pathname]);

  return null;
}
