import React from "react";
import { motion } from "framer-motion";
import {
  Palace as PalaceType,
  Transformation,
} from "../../../utils/zwds/types";
import { useLanguage } from "../../../context/LanguageContext";
import { translateStarName } from "../utils/helpers";
import ZodiacIcons from "../icons";
import ZodiacIconWrapper from "./ZodiacIconWrapper";
import { FaSyncAlt } from "react-icons/fa";
import { ChartSettings } from "../../../context/ChartSettingsContext";

// Map earthly branches to their zodiac animals
const getZodiacIcon = (earthlyBranch: string): React.ElementType | null => {
  const branchToZodiac: Record<string, keyof typeof ZodiacIcons> = {
    子: "rat",
    丑: "ox",
    寅: "tiger",
    卯: "rabbit",
    辰: "dragon",
    巳: "snake",
    午: "horse",
    未: "goat",
    申: "monkey",
    酉: "rooster",
    戌: "dog",
    亥: "pig",
  };

  const zodiacKey = branchToZodiac[earthlyBranch];
  return zodiacKey ? ZodiacIcons[zodiacKey] : null;
};

interface PalaceProps {
  palaceNumber: number;
  palace: PalaceType;
  isSelected: boolean;
  isTargetPalace: boolean;
  transformationType: string | null;
  selectedPalace: number | null;
  birthYear: number;
  targetYear: number;
  palaceTag: string | null;
  registerStarRef: (palaceNumber: number, starName: string, element: HTMLDivElement | null) => void;
  handlePalaceClick: (palaceNumber: number) => void;
  handleDaXianClick: (palaceNumber: number) => void;
  handleYearClick: (palaceNumber: number, e: React.MouseEvent) => void;
  handlePalaceNameClick: (palaceNumber: number, e: React.MouseEvent) => void;
  monthDisplay: string | null;
  showMonths: number | null;
  palaceRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  delay: number;
  secondaryPalaceName: string | null;
  simulatedAge?: number; // Optional prop to simulate a specific age for highlighting Da Xian
  isPdfExport?: boolean; // Optional prop to indicate PDF export mode
  disableInteraction?: boolean; // Optional prop to disable all user interactions
  chartSettings: ChartSettings; // Chart settings to control feature visibility
}

/**
 * Component to render a single palace in the ZWDS chart
 */
const Palace: React.FC<PalaceProps> = ({
  palaceNumber,
  palace,
  isSelected,
  isTargetPalace,
  transformationType,
  selectedPalace,
  birthYear,
  targetYear,
  palaceTag,
  registerStarRef,
  handlePalaceClick,
  handleDaXianClick,
  handleYearClick,
  handlePalaceNameClick,
  monthDisplay,
  showMonths,
  palaceRefs,
  delay,
  secondaryPalaceName,
  simulatedAge,
  isPdfExport = false,
  disableInteraction = false,
  chartSettings,
}) => {
  const { t, language } = useLanguage();
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isHighlighted, setIsHighlighted] = React.useState(false);

  // Handle click with timing to support both single and double clicks
  const handleClick = () => {

    if (disableInteraction) return;
    
    if (clickTimeoutRef.current === null) {
      // First click
      clickTimeoutRef.current = setTimeout(() => {
        // Single click

        handlePalaceClick(palaceNumber);
        clickTimeoutRef.current = null;
      }, 250); // 250ms threshold for double click
    } else {
      // Second click within threshold
      console.log("Double click detected on palace", palaceNumber);
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      // Double click - toggle highlight
      setIsHighlighted(prev => !prev);
    }
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // Get the appropriate zodiac icon based on earthly branch
  const ZodiacIcon = getZodiacIcon(palace.earthlyBranch);

  // Check if this palace has an annual flow matching the target year
  const showAnnualFlow =
    palace.annualFlow && palace.annualFlow.year === targetYear;

  // Calculate age at the annual flow year if it exists
  const getAgeAtYear = (year: number): number => {
    return year - birthYear + 1;
  };

  // Calculate current age
  const currentAge = getAgeAtYear(new Date().getFullYear());

  // Check if current age (or simulated age) falls within this palace's Major Limit (da xian) range
  const ageToCheck = simulatedAge !== undefined ? simulatedAge : currentAge;
  const isCurrentDaXian =
    palace.majorLimit &&
    palace.majorLimit.startAge <= ageToCheck &&
    palace.majorLimit.endAge >= ageToCheck;

  // Calculate the year to display for this palace
  const calculateYearForPalace = (): number => {
    // If this is the starting palace (with annual flow), return the target year
    if (palaceNumber === 1) {
      return targetYear;
    }

    // Calculate how many positions away from the starting palace
    let distance = palaceNumber - 1;
    if (distance <= 0) {
      distance += 12; // Wrap around for a complete circle of 12 palaces
    }

    // Return the year that is 'distance' years after the target year
    return targetYear + distance;
  };

  // Get the year for this palace
  const palaceYear = calculateYearForPalace();

  // Animation variants for palaces
  const palaceVariants = isPdfExport ? undefined : {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.01,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      transition: {
        duration: 0.2,
      },
    },
    selected: {
      scale: 1.02,
      boxShadow: "0 0 0 2px rgba(79, 70, 229, 0.5)",
      transition: {
        duration: 0.3,
      },
    },
    pulse: {
      scale: [1.02, 1.03, 1.02],
      opacity: 1,
      boxShadow: [
        "0 0 0 2px rgba(79, 70, 229, 0.5)",
        "0 0 0 3px rgba(79, 70, 229, 0.4)",
        "0 0 0 2px rgba(79, 70, 229, 0.5)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        opacity: { duration: 0 },
      },
    },
    daxianGlow: {
      opacity: 1,
      scale: 1,
      boxShadow: [
        "0 0 15px rgba(251, 191, 36, 0.6)",
        "0 0 20px rgba(251, 191, 36, 0.8)",
        "0 0 15px rgba(251, 191, 36, 0.6)",
      ],
      transition: {
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
        // Keep other properties stable
        opacity: { duration: 0 },
        scale: { duration: 0 },
      },
    },
    target: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    daxian: {
      opacity: 1,
      scale: 1,
      boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.7)",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    reset: {
      opacity: 1,
      scale: 1,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  // Get transformation border color
  let transformationBorderColor = "";
  if (isTargetPalace) {
    switch (transformationType) {
      case "祿":
        transformationBorderColor = "ring-green-500";
        break;
      case "權":
        transformationBorderColor = "ring-blue-500";
        break;
      case "科":
        transformationBorderColor = "ring-yellow-500";
        break;
      case "忌":
        transformationBorderColor = "ring-red-500";
        break;
      default:
        transformationBorderColor = "";
    }
  }

  // Determine gradient background for selected palace
  // Purple to indigo gradient like the main button
  const gradientStyle = isSelected
    ? {
        background:
          "linear-gradient(135deg, rgb(124, 58, 237), rgb(79, 70, 229))",
        backgroundSize: "200% 200%",
      }
    : {};

  // Dark mode gradient
  const darkGradientStyle = isSelected
    ? {
        background:
          "linear-gradient(135deg, rgb(124, 58, 237, 0.8), rgb(79, 70, 229, 0.8))",
        backgroundSize: "200% 200%",
      }
    : {};

  // Choose which style to apply based on color scheme preference
  const isDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const selectedStyle = isSelected
    ? isDarkMode
      ? darkGradientStyle
      : gradientStyle
    : {};

  // Define border highlight style for target palaces
  let targetHighlightStyle = {};
  if (isTargetPalace && !isSelected) {
    const borderColor =
      transformationType === "祿"
        ? "rgba(16, 185, 129, 0.7)" // green
        : transformationType === "權"
        ? "rgba(56, 189, 248, 0.85)" // brighter sky blue with higher opacity
        : transformationType === "科"
        ? "rgba(245, 158, 11, 0.7)" // yellow
        : transformationType === "忌"
        ? "rgba(239, 68, 68, 0.7)" // red
        : "rgba(107, 114, 128, 0.7)"; // gray fallback

    targetHighlightStyle = {
      boxShadow: `0 0 0 2px ${borderColor}`,
    };
  }

  // Fixed style for current da xian with glow effect
  const daXianStyle =
    isCurrentDaXian && !isSelected
      ? {
          backgroundImage:
            "linear-gradient(135deg, rgba(252, 211, 77, 0.7), rgba(251, 191, 36, 0.65))",
          // Don't set the box-shadow here, as it will be controlled by the animation
        }
      : {};

  // Combine all style properties with proper reset handling
  const combinedStyle = {
    ...selectedStyle,
    ...daXianStyle,
    ...(isSelected
      ? { boxShadow: "0 0 15px rgba(79, 70, 229, 0.25)" }
      : isTargetPalace
      ? targetHighlightStyle
      : isCurrentDaXian
      ? {
          /* boxShadow already set in daXianStyle */
        }
      : isHighlighted
      ? { 
          borderColor: "#ef4444", // solid red
          borderWidth: "4px",
          borderStyle: "solid"
        }
      : { boxShadow: "none" }), // Explicitly reset boxShadow when not selected or target
    transition: "all 0.3s ease",
  };

  const getTransformationColor = (transformation: Transformation) => {
    switch (transformation) {
      case "化科":
        return "text-yellow-500";
      case "化權":
        return "text-blue-500";
      case "化祿":
        return "text-green-500";
      case "化忌":
        return "text-red-500";
      default:
        return "";
    }
  };

  // Handle click on the Major Limit (Da Xian) section
  const handleMajorLimitClick = (e: React.MouseEvent) => {
    if (disableInteraction) return;
    e.stopPropagation(); // Prevent the palace click from triggering
    if (palace.majorLimit) {
      handleDaXianClick(palaceNumber);
    }
  };

  // Desktop year display section
  const renderYearOrMonth = () => {
    const yearClassName = `${
      showAnnualFlow
        ? isSelected
          ? "text-red-300"
          : "text-red-600 dark:text-red-400"
        : ""
    } font-medium hidden sm:flex cursor-pointer hover:opacity-80`;

    return (
      <div className="flex flex-col items-center">
        <div 
          className={yearClassName}
          onClick={(e) => handleYearClick(palaceNumber, e)}>
          {palaceYear}
        </div>
        <div 
          className="text-2xs xs:text-2xs hidden sm:block cursor-pointer hover:opacity-80"
          onClick={(e) => handleYearClick(palaceNumber, e)}>
          {monthDisplay || getAgeAtYear(palaceYear)}
        </div>
      </div>
    );
  };

  // Mobile year display section
  const renderMobileYearOrMonth = () => {
    const yearClassName = `flex items-center gap-1 sm:hidden ${
      showAnnualFlow
        ? isSelected
          ? "text-red-300"
          : "text-red-600 dark:text-red-400"
        : ""
    } font-medium cursor-pointer hover:opacity-80`;

    return (
      <div 
        className={yearClassName}
        onClick={(e) => handleYearClick(palaceNumber, e)}>
        <span>
          {palaceYear}/
        </span>
        <span>
          {monthDisplay || getAgeAtYear(palaceYear)}
        </span>
      </div>
    );
  };

  return (
    <motion.div
      key={`palace-${palaceNumber}-${selectedPalace}`}
      className={`relative border ${isCurrentDaXian ? "pulse-button" : ""} border-gray-100 dark:border-gray-700 p-0.5 xs:p-1 sm:p-2 md:p-3 h-full overflow-hidden min-h-[140px] xs:min-h-[180px] sm:min-h-[130px] md:min-h-[150px] ${
        isSelected
          ? "bg-indigo-50/80 dark:bg-indigo-900/30 text-white"
          : isCurrentDaXian && !isSelected
          ? "bg-gradient-to-br from-yellow-100 to-amber-300 dark:from-yellow-400/70 dark:to-amber-400/60"
          : 
           "bg-white dark:bg-gray-800"
      } flex flex-col rounded-lg shadow-sm cursor-pointer ${
        isSelected
          ? "ring-1 sm:ring-2 ring-indigo-500"
          : isTargetPalace
          ? `ring-1 sm:ring-1 ${transformationBorderColor}`
          : isCurrentDaXian && !isSelected
          ? "ring-2 ring-amber-400/80 dark:ring-amber-400/80"
          : isHighlighted
          ? "ring-2 ring-red-500 dark:ring-red-500"
          : ""
      }`}
      variants={palaceVariants}
      whileHover={isPdfExport ? undefined : "hover"}
      animate={isPdfExport ? false : (isSelected ? "pulse" : isTargetPalace ? "target" : "visible")}
      initial={isPdfExport ? false : "hidden"}
      style={combinedStyle}
      onClick={handleClick}
      ref={(el) => {
        if (palaceRefs.current) {
          palaceRefs.current[palaceNumber - 1] = el;
        }
      }}>
      {/* Zodiac icon background */}
      {ZodiacIcon && (
        <div className="absolute inset-0 flex sm:items-center sm:justify-center pointer-events-none opacity-[0.07] dark:opacity-[0.15] z-10">
          <ZodiacIconWrapper
            Icon={ZodiacIcon}
            className="w-[70%] h-[70%] xs:w-[65%] xs:h-[65%] sm:w-[75%] sm:h-[75%]"
          />
        </div>
      )}

      {/* Secondary palace name - centered but at Liu Nian height */}
      {secondaryPalaceName && (
        <div className={`absolute  xs:bottom-[53px] ${showAnnualFlow && isCurrentDaXian ? "bottom-[90px] sm:bottom-[75px]" : "bottom-[75px] sm:bottom-[51px]"} left-0 right-0 flex justify-center items-center z-20`}>
          <div className={`text-2xs xs:text-xs font-bold ${
            isSelected
              ? "text-black dark:text-white"
              : "text-black dark:text-white"
          }`}>
            {language === "en" && t(`zwds.palaces.${secondaryPalaceName}`)
              ? t(`zwds.palaces.${secondaryPalaceName}`)
              : secondaryPalaceName}
          </div>
        </div>
      )}

      <style>
        {`
          .pulse-button {
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(252, 211, 77, 0.7);
            }
            70% {
              box-shadow: 0 0 0 20px rgba(252, 211, 77, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(252, 211, 77, 0);
            }
          }
        `}
      </style>

      {/* Palace Tag (Da Ming) - only shown when a palace is selected for Da Xian */}
      {palaceTag && (
        <div className="absolute top-0.5 xs:top-1 sm:top-2 right-0.5 xs:right-1 sm:right-2 z-30">
          <motion.div
            key={`palace-tag-${selectedPalace}-${palaceNumber}`}
            className={`text-2xs xs:text-xs sm:text-sm font-semibold px-1 py-0.5 rounded-md ${
              isSelected
                ? "bg-white/20 text-white"
                : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
            }`}
            initial={{ opacity: 0, scale: 0.8, y: -5 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              boxShadow: isSelected
                ? [
                    "0 0 0px rgba(255, 255, 255, 0.5)",
                    "0 0 8px rgba(255, 255, 255, 0.3)",
                    "0 0 0px rgba(255, 255, 255, 0.5)",
                  ]
                : [
                    "0 0 0px rgba(79, 70, 229, 0.3)",
                    "0 0 6px rgba(79, 70, 229, 0.2)",
                    "0 0 0px rgba(79, 70, 229, 0.3)",
                  ],
            }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              delay: delay,
              boxShadow: {
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              },
            }}>
            {palaceTag}
          </motion.div>
        </div>
      )}

      {/* Annual Year Tag and Da Yun Tag Container */}
      <div className="absolute bottom-[55px] xs:bottom-[53px] sm:bottom-[51px] right-1 xs:right-2 sm:right-3 z-20 flex gap-1">
        {showAnnualFlow && chartSettings.liuNianTag && (
          <div className={`text-2xs xs:text-xs font-semibold px-1.5 py-0.5 rounded-md ${
            isSelected
              ? "bg-orange-400/20"
              : "bg-orange-100 dark:bg-orange-900/40 "
          }`}>
            {language === "en" ? "Liu Nian" : "流年"}
          </div>
        )}
        {isCurrentDaXian && (
          <div className={`text-2xs xs:text-xs font-semibold px-1.5 py-0.5 rounded-md ${
            isSelected
              ? "bg-orange-400/20 text-amber-200"
              : "bg-orange-100 dark:bg-orange-900/40 text-amber-600 dark:text-amber-300"
          }`}>
            {language === "en" ? "Da Yun" : "大運"}
          </div>
        )}
      </div>

      {/* Top left: Stars section - with max-height limiting */}
      <div className="absolute top-0.5 xs:top-1 sm:top-2 left-0.5 xs:left-1 sm:left-2 z-30 max-h-[60%] sm:max-h-[75%] overflow-y-auto hide-scrollbar">
        <div className="flex flex-row flex-wrap gap-1 xs:gap-1.5 sm:gap-2 pr-1">
          {/* Minor Stars - with smaller font and tighter spacing */}
          {palace.minorStars.map((star, idx) => (
            <div
              key={`minor-${idx}`}
              className={`text-3xs xs:text-2xs sm:text-xs mb-1 flex flex-col items-start ${
                isSelected
                  ? "font-medium text-white dark:text-white"
                  : star.brightness === "bright"
                  ? "font-medium text-zinc-700 dark:text-zinc-300"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
              ref={(el) => registerStarRef(palaceNumber, star.name, el)}>
              {/* Split star name by spaces and render each word vertically */}
              {translateStarName(star.name, "minorStars", language, t)
                .split(" ")
                .map((word, wordIdx) => (
                  <span
                    key={`word-${wordIdx}`}
                    className="mb-0.5 leading-none sm:leading-tight">
                    {word}
                  </span>
                ))}
    
              {chartSettings.activationTags && star.transformations?.map((transformation, tidx) => (
                <span
                  key={tidx}
                  className={`text-3xs xs:text-2xs sm:text-xs mb-0.5 ${
                    isSelected
                      ? transformation === "化祿"
                        ? "text-green-300 font-bold bg-green-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                        : transformation === "化權"
                        ? "text-blue-300 font-bold bg-blue-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                        : transformation === "化科"
                        ? "text-yellow-300 font-bold bg-yellow-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                        : transformation === "化忌"
                        ? "text-red-300 font-bold bg-red-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                        : "text-rose-300 font-bold"
                      : transformation === "化祿"
                      ? "text-green-500 bg-green-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                      : transformation === "化權"
                      ? "text-blue-500 bg-blue-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                      : transformation === "化科"
                      ? "text-yellow-500 bg-yellow-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                      : transformation === "化忌"
                      ? "text-red-500 bg-red-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                      : "text-rose-500"
                  }`}>
                  {language === "en" &&
                  t(`zwds.transformations.${transformation}`)
                    ? t(`zwds.transformations.${transformation}`).split(" ")[0]
                    : transformation}
                </span>
              ))}
                        {star.selfInfluence && chartSettings.selfInfluenceIcon && (
                <span className="mb-0.5">
                  <FaSyncAlt
                    className={`${getTransformationColor(
                      star.selfInfluence[0]
                    )} text-3xs xs:text-2xs sm:text-xs`}
                  />
                </span>
              )}
            </div>
          ))}

          {/* Main Stars - with tighter spacing but still prominent */}
          {palace.mainStar &&
            palace.mainStar.length > 0 &&
            palace.mainStar.map((star, starIndex) => (
              <div
                key={`main-${starIndex}`}
                className={`mb-1 flex flex-col items-start font-medium text-3xs xs:text-2xs sm:text-xs ${
                  isSelected
                    ? "text-white dark:text-white font-semibold"
                    : "text-zinc-800 dark:text-zinc-200 font-semibold"
                }`}
                ref={(el) => registerStarRef(palaceNumber, star.name, el)}>
                {/* Split star name by spaces and render each word vertically */}
                {translateStarName(star.name, "mainStars", language, t)
                  .split(" ")
                  .map((word, wordIdx) => (
                    <span
                      key={`word-${wordIdx}`}
                      className="mb-0.5 leading-none sm:leading-tight">
                      {word}
                    </span>
                  ))}

                {chartSettings.activationTags && star.transformations?.map((transformation, idx) => (
                  <span
                    key={idx}
                    className={`text-3xs xs:text-2xs sm:text-xs mb-0.5 ${
                      isSelected
                        ? transformation === "化祿"
                          ? "text-green-300 font-bold bg-green-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                          : transformation === "化權"
                          ? "text-blue-300 font-bold bg-blue-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                          : transformation === "化科"
                          ? "text-yellow-300 font-bold bg-yellow-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                          : transformation === "化忌"
                          ? "text-red-300 font-bold bg-red-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                          : "text-rose-300 font-bold bg-rose-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                        : transformation === "化祿"
                        ? "text-green-500 bg-green-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                        : transformation === "化權"
                        ? "text-blue-500 bg-blue-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                        : transformation === "化科"
                        ? "text-yellow-500 bg-yellow-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                        : transformation === "化忌"
                        ? "text-red-500 bg-red-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                        : "text-rose-500 bg-rose-500/10 rounded-md px-0.5 py-0.5 sm:px-1 sm:py-0.5"
                    }`}>
                    {language === "en" &&
                    t(`zwds.transformations.${transformation}`)
                      ? t(`zwds.transformations.${transformation}`).split(
                          " "
                        )[0]
                      : transformation}
                  </span>
                ))}
                {star.selfInfluence && chartSettings.selfInfluenceIcon && (
                  <span className="mb-0.5">
                    <FaSyncAlt
                      className={`${getTransformationColor(
                        star.selfInfluence[0]
                      )} text-3xs xs:text-2xs sm:text-xs`}
                    />
                  </span>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Bottom section with grid layout - positioned absolute at bottom */}
      {isPdfExport ? (
        // PDF Export Version - Static 3-column layout without responsive classes
        <div className="absolute bottom-0 left-0 right-0 grid grid-cols-3 w-full text-xs text-zinc-800 dark:text-zinc-200 border-t border-gray-200 dark:border-gray-700 z-20">
          {/* First column - Heavenly Stem and Earthly Branch */}
          <div
            className={`flex flex-col items-center justify-center py-1.5 border-r border-gray-200 dark:border-gray-700 ${
              isSelected ? "text-white/90 dark:text-white/90" : ""
            }`}>
            <div>
              {language === "en" && t(`zwds.stems.${palace.heavenlyStem}`)
                ? t(`zwds.stems.${palace.heavenlyStem}`)
                : palace.heavenlyStem}
            </div>
            <div>
              {language === "en" && t(`zwds.branches.${palace.earthlyBranch}`)
                ? t(`zwds.branches.${palace.earthlyBranch}`)
                : palace.earthlyBranch}
            </div>
          </div>

          {/* Second column - Palace Name and Major Limit */}
          <div
            className={`flex flex-col items-center justify-center py-1.5 border-r border-gray-200 dark:border-gray-700 ${
              isSelected ? "text-white dark:text-white" : ""
            }`}>
            <div className="font-medium">
              {language === "en" && t(`zwds.palaces.${palace.name}`)
                ? t(`zwds.palaces.${palace.name}`)
                : palace.name}
            </div>
            {palace.majorLimit && (
              <div
                className={`text-zinc-500 dark:text-zinc-400 ${
                  isCurrentDaXian
                    ? "text-amber-900 dark:text-amber-200 font-bold"
                    : ""
                }`}>
                {palace.majorLimit.startAge}-{palace.majorLimit.endAge}
              </div>
            )}
          </div>

          {/* Third column - Year and Age */}
          <div
            className={`flex flex-col items-center justify-center py-1.5 ${
              isSelected
                ? "text-white/80 dark:text-white/80"
                : "text-zinc-500 dark:text-zinc-400"
            }`}>
            <div className={`${
              showAnnualFlow
                ? isSelected
                  ? "text-red-300"
                  : "text-red-600 dark:text-red-400"
                : ""
            } font-medium`}>
              {palaceYear}
            </div>
            <div className="text-xs">
              {monthDisplay || getAgeAtYear(palaceYear)}
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 grid grid-cols-1 sm:grid-cols-3 w-full text-3xs xs:text-2xs sm:text-xs text-zinc-800 dark:text-zinc-200 border-t border-gray-200 dark:border-gray-700 z-20">
          {/* First column (mobile and desktop) */}
          <div
            className={`flex flex-col items-start sm:items-center justify-center py-0.5 xs:py-1 sm:py-1.5 border-r border-gray-200 dark:border-gray-700 ${
              isSelected ? "text-white/90 dark:text-white/90" : ""
            }`}>
            {/* Mobile view: Palace Name - Updated with click handler */}
            <div
              className={`sm:hidden ${
                isSelected ? "text-white dark:text-white" : ""
              } cursor-pointer font-bold hover:opacity-80`}
              onClick={(e) => handlePalaceNameClick(palaceNumber, e)}>
              {language === "en" && t(`zwds.palaces.${palace.name}`)
                ? t(`zwds.palaces.${palace.name}`)
                : palace.name}
            </div>
            {/* Mobile view: Heavenly Stem and Earthly Branch on one line */}
            <div className="flex items-center gap-1 sm:hidden">
              <span>
                {language === "en" && t(`zwds.stems.${palace.heavenlyStem}`)
                  ? t(`zwds.stems.${palace.heavenlyStem}`)
                  : palace.heavenlyStem}
              </span>
              <span>
                {language === "en" && t(`zwds.branches.${palace.earthlyBranch}`)
                  ? t(`zwds.branches.${palace.earthlyBranch}`)
                  : palace.earthlyBranch}
              </span>
            </div>
            {/* Desktop view: Heavenly Stem */}
            <div className="hidden sm:block">
              {language === "en" && t(`zwds.stems.${palace.heavenlyStem}`)
                ? t(`zwds.stems.${palace.heavenlyStem}`)
                : palace.heavenlyStem}
            </div>
            {/* Desktop view: Earthly Branch */}
            <div className="hidden sm:block">
              {language === "en" && t(`zwds.branches.${palace.earthlyBranch}`)
                ? t(`zwds.branches.${palace.earthlyBranch}`)
                : palace.earthlyBranch}
            </div>

            {/* Mobile view: Major Limit */}
            {palace.majorLimit && (
              <div
                className={`sm:hidden text-zinc-500 dark:text-zinc-400 ${
                  isCurrentDaXian
                    ? "text-amber-900 dark:text-amber-200 font-bold cursor-pointer"
                    : "cursor-pointer hover:text-amber-600 dark:hover:text-amber-400"
                }`}
                onClick={handleMajorLimitClick}>
                {palace.majorLimit.startAge}-{palace.majorLimit.endAge}
              </div>
            )}
            {/* Mobile view: Year and Age - Modified to use renderMobileYearOrMonth */}
            {renderMobileYearOrMonth()}
          </div>

          {/* Second column (desktop only) - Updated with click handler */}
          <div
            className={`hidden sm:flex flex-col items-center justify-center py-0.5 xs:py-1 sm:py-1.5 border-r border-gray-200 dark:border-gray-700 ${
              isSelected ? "text-white dark:text-white" : ""
            }`}>
            <div 
              className="font-medium cursor-pointer hover:opacity-80"
              onClick={(e) => handlePalaceNameClick(palaceNumber, e)}>
              {language === "en" && t(`zwds.palaces.${palace.name}`)
                ? t(`zwds.palaces.${palace.name}`)
                : palace.name}
            </div>
            {palace.majorLimit && (
              <div
                className={`text-zinc-500 dark:text-zinc-400 ${
                  isCurrentDaXian
                    ? "text-amber-900 dark:text-amber-200 font-bold cursor-pointer"
                    : "cursor-pointer hover:text-amber-600 dark:hover:text-amber-400"
                }`}
                onClick={handleMajorLimitClick}>
                {palace.majorLimit.startAge}-{palace.majorLimit.endAge}
              </div>
            )}
          </div>

          {/* Third column (desktop only) - Modified to use renderYearOrMonth */}
          <div
            className={`hidden sm:flex flex-col items-center justify-center py-0.5 xs:py-1 sm:py-1.5 ${
              isSelected
                ? "text-white/80 dark:text-white/80"
                : "text-zinc-500 dark:text-zinc-400"
            }`}>
            {renderYearOrMonth()}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Palace;