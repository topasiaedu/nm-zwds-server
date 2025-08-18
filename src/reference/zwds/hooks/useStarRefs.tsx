import { useRef, useState, useEffect } from "react";
import { ChartData } from "../../../utils/zwds/types";

/**
 * Custom hook to manage star DOM element references in the ZWDS chart
 */
interface UseStarRefsReturn {
  starRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  palaceRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  refsReady: boolean;
  setRefsReady: React.Dispatch<React.SetStateAction<boolean>>;
  registerStarRef: (palaceNumber: number, starName: string, element: HTMLDivElement | null) => void;
}

const useStarRefs = (chartData: ChartData, selectedPalace: number | null): UseStarRefsReturn => {
  // Ref to store references to star DOM elements
  const starRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Ref to store references to palace DOM elements
  const palaceRefs = useRef<(HTMLDivElement | null)[]>(Array(12).fill(null));
  
  // State to track starRefs population status
  const [refsReady, setRefsReady] = useState<boolean>(false);

  // Function to register a star element reference
  const registerStarRef = (palaceNumber: number, starName: string, element: HTMLDivElement | null) => {
    const key = `${palaceNumber}:${starName}`;
    
    if (element) {
      starRefs.current.set(key, element);
    }
  };

  // Reset starRefs when chart data actually changes (use a stable reference)
  useEffect(() => {
    starRefs.current = new Map();
  }, [chartData.lunarDate.year, chartData.lunarDate.month, chartData.lunarDate.day]);

  // Set refs ready immediately when palace is selected
  useEffect(() => {
    if (selectedPalace) {
      // Small delay to ensure DOM elements are rendered, but much shorter
      const timer = setTimeout(() => {
        setRefsReady(true);
      }, 10); // Reduced from 100ms to 10ms
      
      return () => clearTimeout(timer);
    } else {
      // If no palace selected, refs are ready immediately
      setRefsReady(true);
    }
  }, [selectedPalace]);

  return {
    starRefs,
    palaceRefs,
    refsReady,
    setRefsReady,
    registerStarRef
  };
};

export default useStarRefs; 