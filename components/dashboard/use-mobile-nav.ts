"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SCROLL_LOCK_CLASS = "cf-dash-main--scroll-locked";

export function useMobileNav() {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const main = document.querySelector(".cf-dash-shell .cf-dash-main");
    if (!main) return;

    if (navOpen) {
      main.classList.add(SCROLL_LOCK_CLASS);
    } else {
      main.classList.remove(SCROLL_LOCK_CLASS);
    }

    return () => {
      main.classList.remove(SCROLL_LOCK_CLASS);
    };
  }, [navOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setNavOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return { navOpen, setNavOpen };
}