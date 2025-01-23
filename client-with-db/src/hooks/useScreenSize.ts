import { useState, useEffect } from "react";

interface ScreenSize {
  isMobile: boolean; // < 640px
  isTablet: boolean; // >= 640px && < 1024px
  isDesktop: boolean; // >= 1024px
  isLargeDesktop: boolean; // >= 1280px
  width: number;
}

export const useScreenSize = (): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    width: typeof window !== "undefined" ? window.innerWidth : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
        isLargeDesktop: width >= 1280,
        width,
      });
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenSize;
};
