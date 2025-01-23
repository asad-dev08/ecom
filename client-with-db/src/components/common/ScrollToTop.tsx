import { useEffect, useState } from "react";
import { ArrowUpIcon } from "lucide-react";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 z-50 p-3 bg-secondary-600 text-white rounded-full shadow-lg hover:bg-secondary-700 transition-all duration-300 animate-fade-in"
          aria-label="Scroll to top"
        >
          {/* ArrowUpIcon */}
          <ArrowUpIcon className="w-5 h-5" />
        </button>
      )}
    </>
  );
};
