import { useState, useEffect } from 'react';

interface Resolution {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

export const useResolution = (): Resolution => {
  const [resolution, setResolution] = useState<Resolution>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: window.innerWidth
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setResolution({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width
      });
    };

    // Set initial resolution
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return resolution;
};