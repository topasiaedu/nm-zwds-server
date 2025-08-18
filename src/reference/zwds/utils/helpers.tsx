/**
 * Helper functions for ZWDS chart component
 */

/**
 * Normalize Chinese characters between traditional and simplified forms
 * to ensure consistent star name matching
 */
export const normalizeChineseCharacters = (text: string): string => {
  if (!text) return "";
  
  // Create mapping of traditional to simplified Chinese characters
  const charMap: Record<string, string> = {
    // Mapping for stars and related terms
    "貞": "贞", // zhēn
    "機": "机", // jī
    "梁": "梁", // liáng (same in both)
    "陰": "阴", // yīn
    "陽": "阳", // yáng
    "輔": "辅", // fǔ
    "弼": "弼", // bì (same in both)
    "軍": "军", // jūn
    "將": "将", // jiāng
    "門": "门", // mén
    "廉": "廉", // lián (same in both)
    "破": "破", // pò (same in both)
    "武": "武", // wǔ (same in both)
    "天": "天", // tiān (same in both)
    "紫": "紫", // zǐ (same in both)
    "文": "文", // wén (same in both)
    "太": "太", // tài (same in both)
    "左": "左", // zuǒ (same in both)
    "右": "右", // yòu (same in both)
    "祿": "禄", // lù
    "權": "权", // quán
    "科": "科", // kē (same in both)
    "忌": "忌", // jì (same in both)
    "擎": "擎", // qíng (same in both)
    "貪": "贪", // tān
    "巨": "巨", // jù (same in both)
    "福": "福", // fú (same in both)
    "祿存": "禄存", // lù cún
    "化祿": "化禄", // huà lù
    "化權": "化权", // huà quán
    "火星": "火星", // huǒ xīng (same in both)
    "鈴星": "铃星", // líng xīng
    "地空": "地空", // dì kōng (same in both)
    "地劫": "地劫", // dì jié (same in both)
    // Add specific star names that include the problematic characters
    "巨門": "巨门", // jù mén
    "天門": "天门", // tiān mén
    "七殺": "七杀", // qī shā
    "貪狼": "贪狼", // tān láng
    "天梁": "天梁", // tiān liáng
    "天相": "天相", // tiān xiāng
    "天機": "天机", // tiān jī
    "太陰": "太阴", // tài yīn
    "太陽": "太阳", // tài yáng
    "廉貞": "廉贞", // lián zhēn
    "天府": "天府", // tiān fǔ
    "武曲": "武曲", // wǔ qū
    "天同": "天同", // tiān tóng
    "破軍": "破军", // pò jūn
    "文曲": "文曲", // wén qū
    "文昌": "文昌", // wén chāng
    "左輔": "左辅", // zuǒ fǔ
    "右弼": "右弼", // yòu bì
  };
  
  let normalized = text.replace(/\s+/g, "");
  
  // Apply all character replacements
  for (const [traditional, simplified] of Object.entries(charMap)) {
    normalized = normalized.replace(new RegExp(traditional, "g"), simplified);
  }
  
  return normalized;
};

/**
 * Translate star name to the appropriate language
 */
export const translateStarName = (
  starName: string, 
  category: "mainStars" | "minorStars",
  language: string,
  t: (key: string) => string
): string => {
  if (!starName) return "";
  
  // If not in English, just return the original name
  if (language !== "en") return starName;
  
  // Attempt to get the translation
  const translation = t(`zwds.${category}.${starName}`);
  
  // If the translation is the same as the key (which means it wasn't found), 
  // return a fallback or the original name
  if (translation === `zwds.${category}.${starName}`) {
    // Fallbacks for common stars
    if (starName === "天相") return "Sky Minister";
    if (starName === "太阴") return "Moon";
    if (starName === "貪狼") return "Greedy Wolf";
    if (starName === "文昌") return "Literary Talent";
    if (starName === "右弼") return "Right Assistant";
    if (starName === "天機") return "Sky Mechanism";
    if (starName === "火星") return "Mars";
    // Default to returning the original
    return starName;
  }
  
  return translation;
};

/**
 * Translate transformation name
 */
export const translateTransformation = (
  type: string,
  language: string,
  t: (key: string) => string
): string => {
  const key = type === "祿" ? "化祿" : 
             type === "權" ? "化权" : 
             type === "科" ? "化科" : 
             type === "忌" ? "化忌" : type;
  
  return language === "en" && t(`zwds.transformations.${key}`) 
    ? t(`zwds.transformations.${key}`).split(" ")[0] // Just use the first word (Academic, Power, etc.)
    : type;
};

/**
 * Get color for transformation type
 */
export const getTransformationColor = (type?: "祿" | "權" | "科" | "忌"): string => {
  if (!type) return "";
  switch (type) {
    case "祿": return "text-green-500";
    case "權": return "text-cyan-500"; // Changed from blue to cyan
    case "科": return "text-yellow-500";
    case "忌": return "text-red-500";
    default: return "text-gray-500";
  }
};

/**
 * Get transformation badge color styling for selected elements
 */
export const getTransformationBadgeColor = (type?: "祿" | "權" | "科" | "忌"): string => {
  if (!type) return "";
  switch (type) {
    case "祿": return "text-green-300 font-bold px-1 py-0.5 bg-green-900/30 rounded";
    case "權": return "text-cyan-300 font-bold px-1 py-0.5 bg-cyan-900/30 rounded";
    case "科": return "text-yellow-300 font-bold px-1 py-0.5 bg-yellow-900/30 rounded";
    case "忌": return "text-red-300 font-bold px-1 py-0.5 bg-red-900/30 rounded";
    default: return "text-gray-300 font-bold";
  }
}; 