"use client";

import { useEffect, useState } from "react";

/** Hide mobile sticky bottom chrome when the store footer scrolls into view. */
export function useHideStickyNearFooter() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { root: null, threshold: 0.08, rootMargin: "0px 0px -4px 0px" },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return hidden;
}