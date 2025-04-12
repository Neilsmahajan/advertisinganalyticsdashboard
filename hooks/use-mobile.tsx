"use client";

import { useEffect, useState } from "react";

// This hook detects if the user is on a mobile device and also provides the screen size information
// This can be used to optimize data fetching and rendering based on device type
export function useMobileDevice() {
  const [isMobile, setIsMobile] = useState(false);
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined;
    height: number | undefined;
  }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Check if device is mobile based on width
      setIsMobile(window.innerWidth < 768);
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Check if user agent suggests a mobile device
    const userAgent = navigator.userAgent;
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent,
      )
    ) {
      setIsMobile(true);
    }

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return {
    isMobile,
    windowSize,
    isTablet:
      windowSize.width !== undefined &&
      windowSize.width >= 768 &&
      windowSize.width < 1024,
    isDesktop: windowSize.width !== undefined && windowSize.width >= 1024,
    isSmallMobile: windowSize.width !== undefined && windowSize.width < 375,
  };
}
