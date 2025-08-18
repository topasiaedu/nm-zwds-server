import { useRef } from "react";
import { ChartData } from "../../../utils/zwds/types";
import { FOUR_TRANSFORMATIONS } from "../../../utils/zwds/constants";
import { normalizeChineseCharacters } from "../utils/helpers";

/**
 * Custom hook to handle transformation calculations and logic
 */
interface UseTransformationsReturn {
  findStarByName: (name: string) => { star: any; palaceNumber: number } | null;
  calculateTransformations: () => TransformationResult[];
  getTargetPalaces: () => Record<number, { type: string; starName: string }>;
  hasSelfTransformation: (palaceNumber: number, starName: string) => { has: boolean; type?: "祿" | "權" | "科" | "忌" };
  calculateOppositePalaceInfluences: (palaceNumber: number) => OppositeInfluenceResult[];
}

interface TransformationResult {
  type: "祿" | "權" | "科" | "忌";
  fromPalace: number;
  toPalace: number;
  starName: string;
}

interface OppositeInfluenceResult {
  type: "祿" | "權" | "科" | "忌";
  fromPalace: number;
  toPalace: number;
  starName: string;
  isOppositeInfluence: true;
}

const useTransformations = (chartData: ChartData, selectedPalace: number | null): UseTransformationsReturn => {
  const chartRef = useRef(chartData);
  
  // Update the ref when chartData changes
  if (chartRef.current !== chartData) {
    chartRef.current = chartData;
  }

  /**
   * Find a star by name in all palaces
   */
  const findStarByName = (name: string) => {
    // Normalize star name for comparison using our helper function
    const normalizedName = normalizeChineseCharacters(name);
    
    // First try a direct match
    for (let i = 0; i < chartData.palaces.length; i++) {
      const palace = chartData.palaces[i];
      
      // Check main stars
      if (palace.mainStar && palace.mainStar.length > 0) {
        for (const star of palace.mainStar) {
          if (star.name === name) {
            return { star, palaceNumber: i + 1 };
          }
        }
      }
      
      // Check minor stars
      if (palace.minorStars && palace.minorStars.length > 0) {
        for (const star of palace.minorStars) {
          if (star.name === name) {
            return { star, palaceNumber: i + 1 };
          }
        }
      }
    }
    
    // If direct match failed, try with normalization
    for (let i = 0; i < chartData.palaces.length; i++) {
      const palace = chartData.palaces[i];
      
      // Check main stars
      if (palace.mainStar && palace.mainStar.length > 0) {
        for (const star of palace.mainStar) {
          const normalizedStarName = normalizeChineseCharacters(star.name);
          
          if (normalizedStarName === normalizedName) {
            return { star, palaceNumber: i + 1 };
          }
        }
      }
      
      // Check minor stars
      if (palace.minorStars && palace.minorStars.length > 0) {
        for (const star of palace.minorStars) {
          const normalizedStarName = normalizeChineseCharacters(star.name);
          
          if (normalizedStarName === normalizedName) {
            return { star, palaceNumber: i + 1 };
          }
        }
      }
    }
    
    // If still not found, try a looser matching approach
    for (let i = 0; i < chartData.palaces.length; i++) {
      const palace = chartData.palaces[i];
      
      // Check main stars
      if (palace.mainStar && palace.mainStar.length > 0) {
        for (const star of palace.mainStar) {
          // Normalize both names for substring comparison
          const normalizedStarName = normalizeChineseCharacters(star.name);
          
          // Check if the star name contains the target name or vice versa
          if (normalizedStarName.includes(normalizedName) || normalizedName.includes(normalizedStarName)) {
            return { star, palaceNumber: i + 1 };
          }
        }
      }
      
      // Check minor stars
      if (palace.minorStars && palace.minorStars.length > 0) {
        for (const star of palace.minorStars) {
          // Normalize both names for substring comparison
          const normalizedStarName = normalizeChineseCharacters(star.name);
          
          // Check if the star name contains the target name or vice versa
          if (normalizedStarName.includes(normalizedName) || normalizedName.includes(normalizedStarName)) {
            return { star, palaceNumber: i + 1 };
          }
        }
      }
    }
    
    return null;
  };

  /**
   * Calculate transformations based on the palace's heavenly stem
   */
  const calculateTransformations = (): TransformationResult[] => {
    if (!selectedPalace) {
      return [];
    }
    
    // Get the selected palace's heavenly stem
    const palace = chartData.palaces[selectedPalace - 1];
    
    if (!palace || !palace.heavenlyStem) {
      return [];
    }
    
    const transformations = FOUR_TRANSFORMATIONS[palace.heavenlyStem];
    
    if (!transformations) {
      return [];
    }
    
    const results: TransformationResult[] = [];
    
    for (const [type, starName] of Object.entries(transformations)) {
      const targetStarInfo = findStarByName(starName);
      
      if (targetStarInfo) {
        let transformationType: "祿" | "權" | "科" | "忌";
        
        switch (type) {
          case "祿": transformationType = "祿"; break;
          case "權": transformationType = "權"; break;
          case "科": transformationType = "科"; break;
          case "忌": transformationType = "忌"; break;
          default: continue;
        }
        
        results.push({
          type: transformationType,
          fromPalace: selectedPalace,
          toPalace: targetStarInfo.palaceNumber,
          starName: targetStarInfo.star.name
        });
      }
    }
    
    return results;
  };

  /**
   * Get palaces that are targets of transformations from the currently selected palace
   */
  const getTargetPalaces = (): Record<number, { type: string, starName: string }> => {
    // If no palace is selected, return an empty object to clear all highlights
    if (!selectedPalace) return {};
    
    const transformations = calculateTransformations();
    const targetPalaces: Record<number, { type: string, starName: string }> = {};
    
    // Only add transformations if we have a valid selected palace
    transformations.forEach(transformation => {
      targetPalaces[transformation.toPalace] = {
        type: transformation.type,
        starName: transformation.starName
      };
    });
    
    return targetPalaces;
  };

  /**
   * Check if a star has a self-transformation when the palace is selected
   */
  const hasSelfTransformation = (palaceNumber: number, starName: string): { has: boolean; type?: "祿" | "權" | "科" | "忌" } => {
    if (selectedPalace !== palaceNumber) return { has: false };
    
    const palace = chartData.palaces[palaceNumber - 1];
    if (!palace || !palace.heavenlyStem) return { has: false };
    
    const transformations = FOUR_TRANSFORMATIONS[palace.heavenlyStem];
    if (!transformations) return { has: false };
    
    // Check if any transformation points to this star in the same palace
    for (const [type, targetStarName] of Object.entries(transformations)) {
      // Use the same normalization function for consistency
      const normalizedTargetStarName = normalizeChineseCharacters(targetStarName);
      const normalizedStarName = normalizeChineseCharacters(starName);
      
      if (normalizedTargetStarName === normalizedStarName || targetStarName === starName) {
        let transformationType: "祿" | "權" | "科" | "忌";
        
        switch (type) {
          case "祿": transformationType = "祿"; break;
          case "權": transformationType = "權"; break;
          case "科": transformationType = "科"; break;
          case "忌": transformationType = "忌"; break;
          default: return { has: false };
        }
        
        return { has: true, type: transformationType };
      }
    }
    
    return { has: false };
  };

  /**
   * Calculate opposite palace influences for a specified palace
   */
  const calculateOppositePalaceInfluences = (palaceNumber: number): OppositeInfluenceResult[] => {
    if (!palaceNumber) return [];
    
    const palace = chartData.palaces[palaceNumber - 1];
    if (!palace || !palace.oppositePalaceInfluence || palace.oppositePalaceInfluence.length === 0) {
      return [];
    }
    
    const results: OppositeInfluenceResult[] = [];
    
    // Map each influence to a transformation result
    palace.oppositePalaceInfluence.forEach(influence => {
      // Get the type of transformation from the influence
      const transformationType = influence.transformation.replace("化", "") as "祿" | "權" | "科" | "忌";
      
      // Find the opposite palace number
      const sourcePalace = influence.sourcePalace;
      
      results.push({
        type: transformationType,
        fromPalace: palaceNumber,
        toPalace: sourcePalace,
        starName: influence.starName,
        isOppositeInfluence: true
      });
    });
    
    return results;
  };

  return {
    findStarByName,
    calculateTransformations,
    getTargetPalaces,
    hasSelfTransformation,
    calculateOppositePalaceInfluences
  };
};

export default useTransformations; 