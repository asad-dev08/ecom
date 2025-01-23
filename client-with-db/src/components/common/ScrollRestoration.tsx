import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollRestoration = () => {
  const { pathname, key } = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      const element = document.documentElement;
      element.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    };

    scrollToTop();
  }, [pathname, key]);

  return null;
};
