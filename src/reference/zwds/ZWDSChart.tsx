import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChartData } from "../../utils/zwds/types";

// Import our modular components and hooks
import useStarRefs from "./hooks/useStarRefs";
import useTransformations from "./hooks/useTransformations";
import Palace from "./components/Palace";
import CenterInfo from "./components/CenterInfo";
import TransformationLines from "./components/TransformationLines";
import { useLanguage } from "../../context/LanguageContext";
import { useChartSettings } from "../../context/ChartSettingsContext";
import { PALACE_NAMES } from "../../utils/zwds/constants";

// Breakpoint constants - matching TailwindCSS defaults
const SCREEN_SM = 640;

// Palace tags in clockwise order starting from the selected palace
const PALACE_TAGS = [
  "大命",
  "大兄",
  "大夫",
  "大子",
  "大财",
  "大疾",
  "大迁",
  "大友",
  "大官",
  "大田",
  "大福",
  "大父",
];
const PALACE_TAGS_EN = [
  "Da Ming",
  "Da Xiong",
  "Da Fu",
  "Da Zi",
  "Da Cai",
  "Da Ji",
  "Da Qian",
  "Da You",
  "Da Guan",
  "Da Tian",
  "Da Fu",
  "Da Fu",
];

// Month mapping to palace names - this is used to determine the starting month
const PALACE_TO_MONTH_MAPPING = {
  命宫: "Jan",
  兄弟: "Feb",
  夫妻: "Mar",
  子女: "Apr",
  财帛: "May",
  疾厄: "Jun",
  迁移: "Jul",
  交友: "Aug",
  官禄: "Sep",
  田宅: "Oct",
  福德: "Nov",
  父母: "Dec",
} as const;

const PALACE_TO_MONTH_MAPPING_EN = {
  命宫: "January",
  兄弟: "February",
  夫妻: "March",
  子女: "April",
  财帛: "May",
  疾厄: "June",
  迁移: "July",
  交友: "August",
  官禄: "September",
  田宅: "October",
  福德: "November",
  父母: "December",
} as const;

// Array of months in order for easy cycling
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface ZWDSChartProps {
  chartData: ChartData;
  targetYear?: number; // Optional prop to specify which year's annual flow to display
  simulatedAge?: number; // Optional prop to simulate a specific age for highlighting Da Xian
  selectedDaXianPalace?: number; // Optional prop to auto-select a palace for Da Ming tags
  disableInteraction?: boolean; // Optional prop to disable all user interactions
  isPdfExport?: boolean; // Optional prop to indicate PDF export mode
}

/**
 * Component to display the Zi Wei Dou Shu chart in a 4x4 grid layout
 */
const ZWDSChart: React.FC<ZWDSChartProps> = ({
  chartData,
  targetYear = new Date().getFullYear(),
  simulatedAge,
  selectedDaXianPalace,
  disableInteraction = false,
  isPdfExport = false,
}) => {
  // State to track the selected palace for transformations
  const [selectedPalace, setSelectedPalace] = useState<number | null>(null);
  // State to track the selected Da Xian for palace tags
  const [selectedDaXian, setSelectedDaXian] = useState<number | null>(
    selectedDaXianPalace || null
  );
  // State to track whether to show months instead of years
  const [showMonths, setShowMonths] = useState<number | null>(null);
  // State to track clicked palace name for secondary palace names
  const [selectedPalaceName, setSelectedPalaceName] = useState<number | null>(
    null
  );

  const { language } = useLanguage();
  const { settings } = useChartSettings();

  // Reference to the chart container
  const chartRef = useRef<HTMLDivElement>(null);

  // State to track window size changes
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Remove redraw counter as it's no longer needed and causes flashing

  // Use our custom hooks
  const { starRefs, palaceRefs, refsReady, setRefsReady, registerStarRef } =
    useStarRefs(chartData, selectedPalace);
  const {
    calculateTransformations,
    getTargetPalaces,
    calculateOppositePalaceInfluences,
  } = useTransformations(chartData, selectedPalace);

  // Update window size when resized
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      // Window resize handled by TransformationLines component
    };

    window.addEventListener("resize", handleResize);

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /**
   * Calculate all activation lines to draw, including opposite palace influences
   */
  const getAllTransformations = () => {
    // Get regular transformations when a palace is selected
    const regularTransformations = selectedPalace
      ? calculateTransformations()
      : [];

    // Get opposite palace influences for all palaces
    let oppositeInfluences: Array<{
      type: "祿" | "權" | "科" | "忌";
      fromPalace: number;
      toPalace: number;
      starName: string;
      isOppositeInfluence: true;
    }> = [];

    // Loop through all palaces to find all opposite palace influences
    for (let i = 1; i <= 12; i++) {
      const palaceInfluences = calculateOppositePalaceInfluences(i);
      if (palaceInfluences.length > 0) {
        oppositeInfluences = [...oppositeInfluences, ...palaceInfluences];
      }
    }

    // Build transformations array based on settings
    const allTransformations = [];

    // Add regular transformations (from palace clicks) if palace click interaction is enabled
    if (settings.palaceClickInteraction && selectedPalace) {
      allTransformations.push(...regularTransformations);
    }

    // Add opposite palace influences if transformation lines setting is enabled
    if (settings.transformationLines) {
      allTransformations.push(...oppositeInfluences);
    }

    return allTransformations;
  };

  /**
   * Calculate palace tag for a given palace based on the selected Da Xian
   * Tags are assigned anticlockwise starting from the selected palace
   * Da Ming (大命) should be at the selected palace, then Da Xiong (大兄) anticlockwise, etc.
   */
  const getPalaceTag = (
    palaceNumber: number
  ): { tag: string | null; delay: number } => {
    if (!selectedDaXian || !settings.daXianClickInteraction)
      return { tag: null, delay: 0 };

    // Calculate the anticlockwise distance from the selected palace
    // Palace numbers go 1-12, but we need 0-11 for array indexing
    let tagIndex = (selectedDaXian - palaceNumber) % 12;
    if (tagIndex < 0) tagIndex += 12;

    return {
      tag: language === "en" ? PALACE_TAGS_EN[tagIndex] : PALACE_TAGS[tagIndex],
      delay: tagIndex * 0.05, // delay still based on distance
    };
  };

  /**
   * Animation variants for different elements
   */
  const containerVariants = isPdfExport
    ? undefined
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
          },
        },
      };

  /**
   * Handle palace click
   */
  const handlePalaceClick = (palaceNumber: number) => {
    if (disableInteraction || !settings.palaceClickInteraction) return;

    console.log("🏰 Palace clicked:", palaceNumber);

    const newSelectedPalace =
      selectedPalace === palaceNumber ? null : palaceNumber;
    console.log("🏰 New selected palace will be:", newSelectedPalace);

    setSelectedPalace(newSelectedPalace);

    // Ensure refs are ready for rendering activation lines
    if (!refsReady) {
      setRefsReady(true);
    }

    // Redraw counter removed to prevent flashing
  };

  /**
   * Handle Da Xian click
   */
  const handleDaXianClick = (palaceNumber: number) => {
    if (disableInteraction || !settings.daXianClickInteraction) return;

    setSelectedDaXian(selectedDaXian === palaceNumber ? null : palaceNumber);
  };

  /**
   * Handle year click to show months
   */
  const handleYearClick = (palaceNumber: number, e: React.MouseEvent) => {
    if (disableInteraction || !settings.yearAgeClickInteraction) return;

    e.stopPropagation();
    setShowMonths(showMonths === palaceNumber ? null : palaceNumber);
  };

  /**
   * Handle palace name click to show secondary palace name
   */
  const handlePalaceNameClick = (palaceNumber: number, e: React.MouseEvent) => {
    if (disableInteraction || !settings.palaceNameClickInteraction) return;

    e.stopPropagation();
    setSelectedPalaceName(
      selectedPalaceName === palaceNumber ? null : palaceNumber
    );
  };

  /**
   * Get month for a palace based on the clicked palace number
   */
  const getMonthForPalace = (
    clickedPalaceNumber: number,
    currentPalaceNumber: number
  ): string | null => {
    if (!showMonths || !settings.yearAgeClickInteraction) return null;

    // Get the bottom right palace (palace number 10)
    const bottomRightPalace = chartData.palaces[9];
    if (!bottomRightPalace) return null;

    // Get the starting month based on the bottom right palace's name
    const monthMapping =
      language === "en" ? PALACE_TO_MONTH_MAPPING_EN : PALACE_TO_MONTH_MAPPING;
    const startingMonth =
      monthMapping[bottomRightPalace.name as keyof typeof monthMapping];
    if (!startingMonth) return null;

    // Find the index of the starting month
    const months = language === "en" ? MONTHS_EN : MONTHS;
    const startingMonthIndex = months.indexOf(startingMonth);
    if (startingMonthIndex === -1) return null;

    // Calculate how many positions to move from the clicked palace
    let distance = currentPalaceNumber - clickedPalaceNumber;
    if (distance < 0) {
      distance += 12; // Wrap around for negative distances
    }

    // Calculate the final month index
    const monthIndex = (startingMonthIndex + distance) % 12;
    return months[monthIndex];
  };

  /**
   * Get secondary palace name based on clicked palace
   */
  const getSecondaryPalaceName = (
    currentPalaceNumber: number
  ): string | null => {
    if (!selectedPalaceName || !settings.palaceNameClickInteraction)
      return null;

    // Calculate how many positions to move from the clicked palace
    let distance = selectedPalaceName - currentPalaceNumber;
    if (distance < 0) {
      distance += 12; // Wrap around for negative distances
    }

    // Return the palace name at this position
    return PALACE_NAMES[distance];
  };

  /**
   * Render a single palace in the chart
   */
  const renderPalace = (palaceNumber: number) => {
    const palace = chartData.palaces[palaceNumber - 1];
    if (!palace) return null;

    // Check if this palace is selected
    const isSelected = selectedPalace === palaceNumber;

    // Get target palaces that are pointed to by transformations from the selected palace
    const targetPalaces = getTargetPalaces();
    // Convert to boolean to match the prop type expected by Palace component
    const isTargetPalace = Boolean(
      selectedPalace && targetPalaces[palaceNumber]
    );
    const transformationType = isTargetPalace
      ? targetPalaces[palaceNumber]?.type
      : null;

    // Get the palace tag if a Da Xian is selected
    const { tag: palaceTag, delay } = getPalaceTag(palaceNumber);

    // Get month display if a palace year was clicked
    let monthDisplay = null;
    if (showMonths !== null) {
      const clickedPalace = chartData.palaces[showMonths - 1];
      if (clickedPalace) {
        monthDisplay = getMonthForPalace(showMonths, palaceNumber);
      }
    }

    // Get the secondary palace name if a palace was clicked
    const secondaryPalaceName = getSecondaryPalaceName(palaceNumber);

    return (
      <Palace
        key={palaceNumber}
        palaceNumber={palaceNumber}
        palace={palace}
        isSelected={isSelected}
        isTargetPalace={isTargetPalace}
        transformationType={transformationType}
        selectedPalace={selectedPalace}
        birthYear={chartData.lunarDate.year}
        targetYear={targetYear}
        palaceTag={palaceTag}
        registerStarRef={registerStarRef}
        handlePalaceClick={handlePalaceClick}
        handleDaXianClick={handleDaXianClick}
        handleYearClick={handleYearClick}
        handlePalaceNameClick={handlePalaceNameClick}
        monthDisplay={monthDisplay}
        showMonths={showMonths}
        palaceRefs={palaceRefs}
        delay={delay}
        secondaryPalaceName={secondaryPalaceName}
        simulatedAge={simulatedAge}
        isPdfExport={isPdfExport}
        disableInteraction={disableInteraction}
        chartSettings={settings}
      />
    );
  };

  return (
    <motion.div
      className="w-full mx-auto aspect-square md:aspect-square relative"
      initial={isPdfExport ? false : "hidden"}
      animate={isPdfExport ? false : "visible"}
      variants={containerVariants}
      ref={chartRef}
      data-zwds-chart-container="true"
      style={{
        minHeight:
          windowSize.width < SCREEN_SM ? "calc(100vh - 50px)" : undefined,
        height:
          windowSize.width < SCREEN_SM ? "calc(100vh - 260px)" : undefined,
        maxHeight: "900px", // Increased from 800px to give more room
      }}>
      <motion.div
        className={`grid grid-cols-4 grid-rows-4 gap-1.5 xs:gap-2 sm:gap-1.5 md:gap-1 p-1 xs:p-1.5 sm:p-1 md:p-1 h-full rounded-xl ${
          isPdfExport ? "bg-white" : ""
        }`}
        initial={isPdfExport ? false : { opacity: 0 }}
        animate={isPdfExport ? false : { opacity: 1 }}
        transition={isPdfExport ? { duration: 0 } : { duration: 0.5 }}>
        {/* First row (top) */}
        {renderPalace(1)}
        {renderPalace(2)}
        {renderPalace(3)}
        {renderPalace(4)}

        {/* Second row */}
        {renderPalace(12)}
        {/* Center info spans 2x2 */}
        <div className="col-span-2 row-span-2">
          <CenterInfo chartData={chartData} isPdfExport={isPdfExport} />
        </div>
        {renderPalace(5)}

        {/* Third row */}
        {renderPalace(11)}
        {/* Center info already spans here */}
        {renderPalace(6)}

        {/* Fourth row (bottom) */}
        {renderPalace(10)}
        {renderPalace(9)}
        {renderPalace(8)}
        {renderPalace(7)}
      </motion.div>

      {/* Render transformation lines as overlay */}
      <TransformationLines
        transformations={getAllTransformations()}
        chartRef={chartRef}
        palaceRefs={palaceRefs}
        starRefs={starRefs}
        refsReady={refsReady}
        selectedPalace={selectedPalace}
        windowSize={windowSize}
        disableAnimations={isPdfExport}
      />
    </motion.div>
  );
};

export default ZWDSChart;
