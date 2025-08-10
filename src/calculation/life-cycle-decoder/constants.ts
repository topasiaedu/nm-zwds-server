// constants.ts

/**
 * Zi Wei Dou Shu – constants & types
 * Everything is organized so you can import granular chunks or the whole set.
 */

export type PalaceKey =
  | "命宫"
  | "兄弟"
  | "夫妻"
  | "子女"
  | "财帛"
  | "疾厄"
  | "迁移"
  | "交友"
  | "官禄"
  | "田宅"
  | "福德"
  | "父母";

export type StarKey =
  | "紫微"
  | "破军"
  | "天府"
  | "廉贞"
  | "太阴"
  | "贪狼"
  | "巨门"
  | "天同"
  | "天相"
  | "武曲"
  | "天梁"
  | "太阳"
  | "七杀"
  | "天机"
  | "左辅"
  | "右弼"
  | "文昌"
  | "文曲";

export interface StarMeta {
  name_en: string;
  title: string;
  type: string; // short tag line ala your screenshot
  description: string; // general star meaning
}

export type NextStep = {
  title: string;
  description: string;
};

export type NextStepsMap = Record<PalaceKey, NextStep[]>;

export type PalaceDescriptionsMap = Record<PalaceKey, string>;

export type DayunMap = Record<PalaceKey, string>;

/**
 * The massive 12 × 18 star–palace paragraphs.
 * We'll append the full object in follow-up messages to avoid token cut-off.
 */
export type StarMeaningsByPalace = Record<PalaceKey, Record<StarKey, string>>;

/* ---------------------------
   1) Palace overview (12)
---------------------------- */
export const PALACE_DESCRIPTIONS: PalaceDescriptionsMap = {
  命宫: "At this stage of your journey, the focus shifts to self-awareness and personal direction. The Life Palace represents your core identity, natural temperament, and the way you navigate life’s challenges and opportunities. It reflects your inherent strengths, tendencies, and the potential you carry within, guiding you toward greater clarity about who you are and where you are headed.\n\nYou may feel a stronger pull to define your values and life priorities, seeking a deeper understanding of your purpose. This period encourages self-reflection and the conscious shaping of your path, helping you align your actions with your true nature. By honoring your unique traits and making intentional choices, you pave the way for a more authentic and fulfilling future.",
  兄弟: "This period highlights the importance of connection, loyalty, and shared history. The Siblings Palace encompasses not only your relationships with brothers and sisters but also the bonds you form with peers who feel like family. It reveals how you give and receive support, work through differences, and nurture mutual trust in close-knit circles.\n\nYou may experience moments that allow you to strengthen these bonds, whether through collaboration, reconciliation, or shared experiences. This is an ideal time to appreciate the role these connections play in shaping your worldview and to invest in building bridges where distance has grown. Embracing understanding and unity can create lasting harmony in your most trusted relationships.",
  夫妻: "At this stage of your journey, the area of relationships and partnership comes to the forefront. The Spouse Palace represents how you connect with others on a deep and meaningful level, encompassing not only romantic love but also the way you form bonds, communicate, and cooperate within both personal and professional settings. This period encourages you to reflect on what you truly value in a partnership and to be open to growth, support, and harmony in your interactions.\n\nYou may find that opportunities arise to strengthen existing relationships or to meet new individuals who have a significant impact on your life. For those in a committed partnership, this is a favorable time to nurture mutual understanding and deepen your connection. If you are single, this phase may bring a heightened focus on what you seek in a partner, increasing the potential for meaningful new relationships. Overall, this period invites you to embrace the importance of trust, communication, and shared goals within your most important connections.",
  子女: "The focus now turns to legacy, nurturing, and the bonds between generations. The Children Palace signifies not only your relationships with your children but also your role in guiding, mentoring, and inspiring those who look to you for wisdom. It reflects how you invest in the growth and well-being of others, shaping their paths with care and encouragement.\n\nThis period may bring opportunities to support, teach, or celebrate the milestones of younger generations. Even if you do not have children, you may find yourself taking on roles of mentorship or influence in the lives of others. By fostering patience, empathy, and guidance, you create a ripple effect of positive impact that extends far into the future.",
  财帛: "During this phase, attention is drawn to your relationship with resources, stability, and prosperity. The Wealth Palace represents your ability to create, manage, and sustain material abundance, reflecting both practical skills and your underlying attitudes toward money and value.\n\nYou may encounter opportunities to strengthen your financial position or explore new avenues for income. This is a favorable time to reassess spending habits, investments, and long-term goals, ensuring they align with your desired lifestyle. By cultivating a balanced approach to wealth — one that blends ambition with gratitude — you set the stage for lasting security and the freedom to pursue what matters most.",
  疾厄: "This period brings your well-being, vitality, and resilience into focus. The Health Palace reveals how you care for your body, mind, and spirit, as well as the patterns that influence your overall state of health. It emphasizes the importance of balance, self-awareness, and proactive care.\n\nYou may feel called to make adjustments to your routines, diet, or mindset to better support long-term wellness. Challenges may also arise that encourage you to develop greater discipline and awareness of your limits. By listening to your body and prioritizing self-care, you cultivate the energy and strength needed to embrace all other areas of life with clarity and confidence.",
  迁移: "The focus shifts to change, exploration, and expansion. The Travel Palace reflects your experiences beyond familiar territory — both literal journeys and figurative steps into new environments, communities, or perspectives. It represents adaptability, courage, and your openness to new possibilities.\n\nThis period may present chances to relocate, travel, or immerse yourself in unfamiliar settings that broaden your understanding of the world. You are encouraged to embrace flexibility and see change as a path to growth. Whether these movements are physical or internal, they hold the potential to reshape your life in meaningful and inspiring ways.",
  交友: "This phase shines a light on social networks, alliances, and the communities you choose to be part of. The Friends Palace represents the quality of your friendships, collaborations, and shared pursuits, showing how you both contribute to and benefit from the connections in your life.\n\nYou may find yourself drawn to new circles or deepening bonds with existing companions who share your values and aspirations. This is a time to evaluate which relationships uplift and inspire you, and to invest in those that foster mutual respect and support. By nurturing authentic connections, you create a network that strengthens both your personal and professional growth.",
  官禄: "The spotlight now turns to your ambitions, achievements, and public reputation. The Career Palace represents your professional path, your approach to responsibility, and the recognition you receive for your efforts. It reflects not only your work but also the sense of purpose that drives you forward.\n\nYou may encounter opportunities for advancement, leadership, or redefining your role in meaningful ways. This is a favorable time to set clear goals, hone your skills, and align your career with your deeper values. By approaching your work with dedication and vision, you create a legacy that extends beyond titles and positions.",
  田宅: "This period emphasizes stability, roots, and your relationship to your living environment. The Property Palace represents not only physical assets like homes and land but also the sense of comfort, security, and belonging that comes from your surroundings.\n\nYou may feel inspired to make improvements to your home, invest in property, or seek a space that better reflects your needs. This is also a time to consider how your environment supports your personal and family well-being. By creating a harmonious and secure foundation, you provide yourself with a sanctuary that nurtures every other aspect of your life.",
  福德: "The focus now shifts to inner peace, contentment, and spiritual well-being. The Fortune Palace reflects your capacity for joy, gratitude, and fulfillment beyond material success. It speaks to the beliefs, values, and practices that shape your sense of purpose and happiness.\n\nThis period may encourage you to slow down and appreciate the intangible blessings in your life. You may be drawn to activities that nourish your soul, from meditation to creative pursuits. By cultivating a mindset of abundance and peace, you strengthen your resilience and invite more harmony into every area of your life.",
  父母: "This stage highlights heritage, guidance, and the foundational influences in your life. The Parents Palace represents your relationship with your parents or parental figures, as well as the traditions, values, and wisdom passed down through generations.\n\nYou may feel a stronger connection to your roots or a desire to honor those who shaped your upbringing. This is a time to seek understanding, offer gratitude, and, if needed, find healing in these bonds. By embracing both the lessons and challenges of your heritage, you strengthen your own path and pass forward the best of what you’ve received.",
};

/* ---------------------------
   2) Star catalog (18)
---------------------------- */
export const STAR_META: Record<StarKey, StarMeta> = {
  紫微: {
    name_en: "Zi Wei",
    title: "The Emperor Star",
    type: "Authority, leadership, central command",
    description:
      "Zi Wei is regarded as the Emperor Star, symbolizing authority, leadership, and a commanding presence. It represents dignity, vision, and the capacity to guide others toward shared goals. Those influenced by Zi Wei often possess a strong sense of responsibility and the ability to inspire trust. Its energy encourages strategic thinking and long-term planning, helping you navigate challenges with composure. On the other hand, its lofty expectations can lead to pressure or self-imposed burdens. To harness Zi Wei’s influence, balance ambition with humility, and lead with both wisdom and compassion.",
  },
  天府: {
    name_en: "Tian Fu",
    title: "The Treasury Star",
    type: "Abundance, management, wealth stewardship",
    description:
      "Tian Fu is known as the Treasury Star, representing stability, abundance, and the ability to preserve resources. Its presence reflects reliability, generosity, and a knack for organization. Those guided by Tian Fu often have the patience to build lasting security and the wisdom to manage assets well. However, its love of comfort can sometimes lead to complacency or resistance to change. Harnessing Tian Fu’s steady influence involves cultivating gratitude while staying open to growth and adaptation.",
  },
  武曲: {
    name_en: "Wu Qu",
    title: "The Finance Star",
    type: "Financial prowess, decisiveness, resourcefulness",
    description:
      "Wu Qu, the Finance Star, symbolizes determination, resilience, and a disciplined approach to goals. It is linked to practicality, hard work, and a strong sense of duty. Those guided by Wu Qu are often resourceful and steadfast, able to overcome challenges through persistence. However, its serious nature can sometimes result in rigidity or overemphasis on material success. The key to Wu Qu’s power lies in combining focus with adaptability.",
  },
  天相: {
    name_en: "Tian Xiang",
    title: "The Chancellor Star",
    type: "Integrity, support, assistance",
    description:
      "Tian Xiang, the Minister Star, represents diplomacy, cooperation, and refined judgment. It is tied to fairness, loyalty, and the ability to mediate and bring people together. Those influenced by Tian Xiang excel in roles requiring tact and balanced decision-making. However, its desire to please can sometimes lead to indecision or dependence on others’ approval. To make the most of Tian Xiang’s strengths, pair diplomacy with inner conviction.",
  },
  太阳: {
    name_en: "Tai Yang",
    title: "The Sun Star",
    type: "Action, generosity, visibility",
    description:
      "Tai Yang, the Sun Star, radiates vitality, confidence, and outward expression. It is tied to leadership, generosity, and the drive to take initiative. Those influenced by Tai Yang often inspire others through enthusiasm and optimism. However, its bright nature can sometimes result in overextension or burnout. To fully embrace Tai Yang’s light, pair bold action with mindful self-care.",
  },
  天机: {
    name_en: "Tian Ji",
    title: "The Strategist Star",
    type: "Intelligence, strategy, adaptability",
    description:
      "Tian Ji, the Machine Star, represents adaptability, intelligence, and quick thinking. It is linked to curiosity, innovation, and the ability to spot opportunities in changing circumstances. However, its restless nature can sometimes lead to inconsistency or over-analysis. To make the most of Tian Ji’s influence, combine agility with focus, ensuring ideas are carried through to completion.",
  },
  太阴: {
    name_en: "Tai Yin",
    title: "The Moon Star",
    type: "Sensitivity, nurturing, subtle influence",
    description:
      "Tai Yin, the Moon Star, symbolizes gentleness, intuition, and inner reflection. It is linked to nurturing energy, emotional depth, and the ability to provide quiet support to others. This star enhances sensitivity, artistic talents, and the power to influence through subtlety. However, its introspective nature can sometimes lead to hesitation or emotional withdrawal. To embrace Tai Yin’s gifts, trust your intuition while finding the courage to step forward when action is needed.",
  },
  廉贞: {
    name_en: "Lian Zhen",
    title: "The Upright Star",
    type: "Independence, transformation, discipline",
    description:
      "Lian Zhen, the Star of Virtue and Integrity, is associated with discipline, principles, and a strong sense of right and wrong. It encourages living by personal values, making decisions with conviction, and maintaining moral strength even under pressure. While this star grants resilience and self-respect, its uncompromising nature can sometimes lead to stubbornness or conflict. The key to Lian Zhen’s energy lies in balancing steadfast ideals with flexibility and understanding.",
  },
  七杀: {
    name_en: "Qi Sha",
    title: "The Warrior Star",
    type: "Bravery, action, breakthrough",
    description:
      "Qi Sha, the General Star, embodies courage, decisiveness, and the willingness to face challenges head-on. It is associated with swift action, ambition, and the drive to achieve goals against the odds. While it grants bravery and the ability to take calculated risks, it can also bring impulsiveness or confrontation. Harnessing Qi Sha’s energy involves directing its force toward strategic, purposeful endeavors.",
  },
  破军: {
    name_en: "Po Jun",
    title: "The General Star",
    type: "Risk-taking, reform, destruction and renewal",
    description:
      "Po Jun, the Star of Destruction and Transformation, embodies change, boldness, and the willingness to break free from limitations. Its influence encourages taking risks, challenging outdated norms, and forging a new path through courage and decisiveness. While this energy brings innovation and breakthroughs, it can also manifest as restlessness or impulsive choices. Successfully working with Po Jun means channeling its force toward meaningful reinvention, while tempering haste with foresight.",
  },
  贪狼: {
    name_en: "Tan Lang",
    title: "The Desire Star",
    type: "Charm, creativity, desire, adaptability",
    description:
      "Tan Lang, the Star of Desire, is associated with charm, pleasure, and personal magnetism. It represents passion, adaptability, and the pursuit of life’s enjoyments, whether in relationships, creativity, or adventure. While it can open doors to exciting opportunities, its indulgent nature may also bring distractions or excess. Working with Tan Lang’s energy means channeling enthusiasm into purposeful pursuits while keeping impulses in check.",
  },
  巨门: {
    name_en: "Ju Men",
    title: "The Gate Star",
    type: "Speech, debate, mystery",
    description:
      "Ju Men, the Great Gate Star, signifies communication, persuasion, and the power of words. It is linked to debate, negotiation, and the ability to uncover hidden truths. This star grants an inquisitive mind and a natural talent for discussion, but it can also bring misunderstandings or disputes if not handled carefully. To use Ju Men’s influence wisely, combine clear expression with empathy, ensuring your words build bridges rather than barriers.",
  },
  天同: {
    name_en: "Tian Tong",
    title: "The Harmony Star",
    type: "Comfort, happiness, sociability",
    description:
      "Tian Tong, the Gentle Star, embodies kindness, optimism, and a peaceful disposition. It is associated with harmony, enjoyment of life, and the ability to adapt gracefully to different situations. While this energy brings warmth and good fortune, it can also foster complacency or a tendency to avoid challenges. Harnessing Tian Tong’s gifts means cherishing tranquility while also stepping up when action is required.",
  },
  天梁: {
    name_en: "Tian Liang",
    title: "The Support Star",
    type: "Protection, longevity, compassion",
    description:
      "Tian Liang, the Guardian Star, is associated with protection, guidance, and moral leadership. It represents a sense of responsibility for the well-being of others, often inspiring people to act as mentors or protectors. While its energy fosters stability and trust, it can also incline one toward caution or excessive concern. Embracing Tian Liang’s influence means offering support without overstepping, and guiding others while allowing them to grow.",
  },
  左辅: {
    name_en: "Zuo Fu",
    title: "The Left Assistant Star",
    type: "Helpful, supportive, provides guidance",
    description:
      "Zuo Fu, the Assistant Star, symbolizes support, cooperation, and reliability. It represents helpful influences, loyal allies, and the willingness to work alongside others toward shared goals. This star brings stability and trust, but may sometimes foster dependence on external guidance. To fully benefit from Zuo Fu’s energy, value teamwork while maintaining self-reliance.",
  },
  右弼: {
    name_en: "You Bi",
    title: "The Right Assistant Star",
    type: "Helpful, supportive, diplomatic aid",
    description:
      "You Bi, the Companion Star, is associated with harmony, encouragement, and the strengthening of relationships. It reflects the importance of mutual support and the ability to bring out the best in others. While it fosters warmth and unity, it can also create an overemphasis on pleasing others. Harnessing You Bi’s gifts means building strong connections while staying true to yourself.",
  },
  文昌: {
    name_en: "Wen Chang",
    title: "The Scholar Star",
    type: "Learning, intellect, clarity in communication",
    description:
      "Wen Chang is known as the star of intellect, learning, and eloquence. Its presence in a chart highlights qualities such as wisdom, clarity of thought, and a natural talent for communication and writing. Wen Chang’s greatest strengths lie in its ability to help you articulate ideas, succeed in academic or intellectual pursuits, and approach challenges with logic and grace. However, its influence can sometimes manifest as overthinking, indecision, or a tendency to focus on theory rather than taking practical action. Harnessing Wen Chang’s energy means embracing both thoughtful analysis and the confidence to express yourself clearly.",
  },
  文曲: {
    name_en: "Wen Qu",
    title: "The Artistic Star",
    type: "Artistry, music, creativity, emotional expression",
    description:
      "Wen Qu, the Literary Star, is linked to artistry, refinement, and a love for beauty in both thought and expression. It enhances creativity, poetic sensibility, and the ability to convey deep emotion through words or art. However, its romantic and idealistic nature can sometimes lead to impracticality or escapism. To work with Wen Qu’s influence, balance artistic inspiration with grounded action.",
  },
};

/* ---------------------------
   3) Da Yun (12 palaces)
   Timing-neutral, NLP-friendly text with ${next_palace} and ${max_age}
---------------------------- */
export const DAYUN_BY_PALACE: DayunMap = {
  命宫: "You are in a timing window where the spotlight rests on your Life Palace (命宫), inviting you to focus on personal growth, self-definition, and the choices that shape your future. Whether you have just stepped into this cycle or have been walking it for years, the essence remains the same: strengthen the alignment between who you are on the inside and how you show up in the world. This is the season to refine your routines, reinforce habits that empower you, and make decisions that speak to your deepest values. Every intentional step you take now becomes part of the story you carry forward.\n\nAs you approach the transition point around age ${max_age}, your attention will begin to naturally shift toward the emerging themes of ${next_palace}. What you integrate in this current cycle—your self-awareness, your clarity of purpose, your ability to act with intention—will become the foundation you stand on in the next chapter. Treat this period as an active workshop for your life, a time to practice the mindset and actions you want to master so that you move forward with confidence, focus, and a sense of readiness for what comes next.",
  兄弟: "You are in a timing window where the focus rests on your Siblings and Close Friends Palace (兄弟), highlighting relationships built on trust, loyalty, and mutual growth. Whether you are early in this cycle or deep into it, the central invitation is to strengthen communication, set healthy boundaries, and nurture bonds that feel like family. This is a period to co-create with others, share resources, and show up consistently for those who matter. Every investment in these connections now reinforces the support network that will carry you forward.\n\nAs you approach the transition point around age ${max_age}, your attention will begin to naturally shift toward the themes of ${next_palace}. The relationships you’ve tended in this cycle will influence not just your personal life, but also your confidence in taking on future challenges. Treat this as a chance to build a circle that is not only loyal, but aligned with your vision for the next chapter.",
  夫妻: "You are in a timing window where the spotlight is on your Spouse and Partnership Palace (夫妻), encouraging you to focus on meaningful connections and mutual growth. Whether just beginning this cycle or approaching its end, the themes remain steady: cultivating trust, deepening emotional bonds, and aligning life directions with a partner or potential partner. This is a time to invest in both understanding and being understood, allowing relationships to become a source of strength.\n\nAs you near the transition point around age ${max_age}, your attention will gradually turn toward the emerging themes of ${next_palace}. The quality of connection and mutual respect you build now will set the tone for the next phase. Use this period to strengthen the foundation so that, when the shift arrives, you carry forward relationships that are healthy, supportive, and aligned with your evolving path.",
  子女: "You are in a timing window where the emphasis is on your Children and Legacy Palace (子女), highlighting the joy of nurturing, guiding, and seeing growth in others. This can refer to actual children, mentees, or passion projects that you treat as your own. Whether early in this cycle or approaching its close, your role is to offer structure, encouragement, and consistent presence. The more you pour into guidance now, the stronger the impact you leave behind.\n\nAs you move toward the transition point around age ${max_age}, your attention will begin to shift toward the themes of ${next_palace}. The foundations you lay in this period—whether through teaching, protecting, or creatively contributing—will carry lasting influence. Treat this as a season for planting seeds that will continue to grow well into your next chapter.",
  财帛: "You are in a timing window where the focus rests on your Wealth and Resources Palace (财帛), placing attention on financial stability, value creation, and the systems that sustain abundance. Whether this is the first year or the final phase of the cycle, the themes are clear: strengthen your income streams, manage resources wisely, and make intentional investments. Each deliberate step now builds both security and flexibility for the future.\n\nAs you approach the transition around age ${max_age}, your focus will begin to shift toward the emerging themes of ${next_palace}. The financial habits and strategic moves you establish in this cycle will shape your capacity to embrace the next phase with confidence. Treat this time as an opportunity to create a strong and adaptable foundation for long-term prosperity.",
  疾厄: "You are in a timing window where the emphasis is on your Health and Wellness Palace (疾厄), encouraging you to prioritize vitality, balance, and sustainable well-being. Whether early in this cycle or approaching its end, the consistent call is to integrate healthy routines into your daily life. Pay attention to rest, movement, nutrition, and emotional resilience, turning care for your body and mind into a lasting habit.\n\nAs you near the transition point around age ${max_age}, your attention will gradually turn toward the themes of ${next_palace}. The health choices you make now—both preventative and restorative—will directly influence your capacity to handle future opportunities and challenges. Treat this period as a chance to strengthen your foundation so you can step into the next chapter with energy and clarity.",
  迁移: "You are in a timing window where the focus is on your Travel and Movement Palace (迁移), bringing themes of exploration, adaptability, and expansion into play. This may involve physical relocation, changes in environment, or new experiences that broaden your perspective. Whether you are at the beginning or the tail end of this cycle, the opportunity is to embrace change as a catalyst for growth and fresh insights.\n\nAs the transition point around age ${max_age} approaches, your focus will begin to shift toward the themes of ${next_palace}. The experiences, adaptability, and networks you build now will enrich the opportunities that come next. Treat this period as an open invitation to explore and prepare for the chapter ahead with a widened horizon.",
  交友: "You are in a timing window where the emphasis rests on your Friends and Social Network Palace (交友), encouraging you to cultivate relationships that inspire and support you. Whether just starting this cycle or nearing its close, the work is to be intentional about who you keep close, who you collaborate with, and how you show up in your communities. Every bond you nurture now shapes the energy and resources you carry forward.\n\nAs you approach the transition around age ${max_age}, your attention will shift toward the themes of ${next_palace}. The alliances and friendships you have invested in during this period will influence your momentum in the next phase. Treat this as a chance to curate a network that is both authentic and aligned with your long-term vision.",
  官禄: "You are in a timing window where the spotlight is on your Career and Vocation Palace (官禄), making it a key season for building expertise, credibility, and professional influence. Whether this is your first year or your last in the cycle, the aim remains the same: refine your skills, elevate your performance, and position yourself strategically in your field. The results you generate now will shape how you’re recognized moving forward.\n\nAs the transition point around age ${max_age} nears, your attention will gradually shift toward the themes of ${next_palace}. The reputation, networks, and track record you build in this cycle will be assets in whatever comes next. Treat this time as an active stage for showcasing your strengths and setting the tone for the opportunities ahead.",
  田宅: "You are in a timing window where the focus rests on your Property and Home Palace (田宅), emphasizing stability, comfort, and the environment you live in. Whether early in this cycle or close to its conclusion, the invitation is to create a living space that reflects your values and supports your well-being. This may involve buying, selling, renovating, or simply making your current home more harmonious.\n\nAs you approach the transition around age ${max_age}, your focus will shift toward the themes of ${next_palace}. The security and comfort you establish now will serve as a launchpad for the changes ahead. Treat this as an opportunity to create both a physical and emotional base that supports your growth.",
  福德: "You are in a timing window where the emphasis is on your Fortune and Inner Joy Palace (福德), highlighting the practices, beliefs, and mindsets that nourish your spirit. Whether in the early or later stages of this cycle, the central work is to cultivate gratitude, peace, and a sense of purpose. This is a period for simplifying, reflecting, and aligning your daily life with what matters most.\n\nAs you move toward the transition around age ${max_age}, your attention will gradually shift toward the themes of ${next_palace}. The emotional resilience and clarity you foster now will allow you to navigate the next chapter with ease. Treat this period as a chance to strengthen your inner compass and carry forward a sense of fulfillment.",
  父母: "You are in a timing window where the focus is on your Parents and Ancestry Palace (父母), encouraging deeper understanding, healing, and appreciation for your roots. Whether you are beginning this cycle or closing it out, the call is to strengthen mutual respect, improve communication, and honor the role family plays in your life. This can also be a time to redefine boundaries and create healthier dynamics.\n\nAs you approach the transition around age ${max_age}, your attention will begin to shift toward the themes of ${next_palace}. The stability and clarity you create in your family relationships now will influence your confidence and emotional balance in the future. Treat this period as an opportunity to honor the past while preparing for the growth ahead.",
};

/* ---------------------------
   4) Next Steps (3 per palace)
---------------------------- */
export const NEXT_STEPS_BY_PALACE: NextStepsMap = {
  命宫: [
    {
      title: "Refine Your Self-Identity and Vision",
      description:
        "Dedicate time to clarifying who you are becoming and what you stand for. Journal about your goals, values, and the traits you want to embody. This self-awareness will guide your actions and decisions in ways that align with your authentic self.",
    },
    {
      title: "Strengthen Daily Routines",
      description:
        "Create or adjust your habits to support your mental, emotional, and physical well-being. Consistent, intentional routines help you stay grounded and focused as you move through this phase of personal growth.",
    },
    {
      title: "Seek Constructive Feedback",
      description:
        "Invite trusted mentors, friends, or colleagues to share honest perspectives on your progress. Use their insights to fine-tune your path, making sure you are evolving in ways that feel right for you.",
    },
  ],
  兄弟: [
    {
      title: "Deepen Key Relationships",
      description:
        "Reach out to siblings or close friends to strengthen bonds through regular check-ins or shared activities. Show appreciation for their presence in your life and make time to nurture these important ties.",
    },
    {
      title: "Collaborate on Shared Goals",
      description:
        "Work together with those in your inner circle on projects or plans that benefit everyone involved. Shared achievements help reinforce trust and create a sense of unity.",
    },
    {
      title: "Address and Heal Old Conflicts",
      description:
        "If there are unresolved tensions, take steps to address them with empathy and honesty. Healing old wounds can lead to a more supportive and harmonious connection.",
    },
  ],
  夫妻: [
    {
      title: "Nurture Communication and Understanding",
      description:
        "Take the initiative to strengthen open and honest dialogue within your closest relationships. Make time for thoughtful conversations, actively listen, and share your feelings or ideas with clarity to resolve misunderstandings and deepen mutual understanding.",
    },
    {
      title: "Embrace Shared Creativity and New Experiences",
      description:
        "Explore artistic or cultural activities together, such as attending concerts, taking a class, or collaborating on a creative project. Shared experiences foster deeper connection and joy.",
    },
    {
      title: "Express Appreciation and Support Regularly",
      description:
        "Show gratitude for your partner’s qualities, talents, or support through words, gestures, or acts of kindness. Focusing on the positive helps maintain a harmonious and uplifting relationship.",
    },
  ],
  子女: [
    {
      title: "Invest Time in Guidance and Mentorship",
      description:
        "Whether with children, mentees, or creative projects, provide steady guidance and encouragement. Your consistent presence helps nurture growth and confidence.",
    },
    {
      title: "Celebrate Milestones",
      description:
        "Acknowledge and honor key achievements or progress, no matter how small. Recognition builds motivation and reinforces positive development.",
    },
    {
      title: "Encourage Independence",
      description:
        "Support the development of autonomy by allowing room for exploration and self-expression. This balance of support and freedom fosters resilience and creativity.",
    },
  ],
  财帛: [
    {
      title: "Review and Optimize Finances",
      description:
        "Take stock of your current financial situation, identifying areas to cut waste and increase efficiency. Align spending and saving habits with your long-term goals.",
    },
    {
      title: "Expand Income Opportunities",
      description:
        "Explore side projects, investments, or skill development that can open new revenue streams. Diversification increases financial security.",
    },
    {
      title: "Automate Savings and Investments",
      description:
        "Set up systems to consistently grow your wealth without relying on willpower alone. This ensures steady progress toward your targets.",
    },
  ],
  疾厄: [
    {
      title: "Prioritize Preventive Health",
      description:
        "Schedule regular check-ups, screenings, and health assessments. Early detection and prevention are key to long-term vitality.",
    },
    {
      title: "Build a Supportive Wellness Routine",
      description:
        "Incorporate balanced nutrition, regular exercise, and restorative practices like meditation or yoga. Consistency is the foundation of sustainable health.",
    },
    {
      title: "Manage Stress Mindfully",
      description:
        "Develop coping strategies such as breathwork, journaling, or nature walks. Managing stress effectively supports both mental and physical well-being.",
    },
  ],
  迁移: [
    {
      title: "Explore New Environments",
      description:
        "Visit new places, even locally, to broaden your perspective and refresh your mindset. Exposure to different settings can spark creativity and insight.",
    },
    {
      title: "Adapt to Change with Flexibility",
      description:
        "View transitions as opportunities for growth. Stay open-minded and willing to adjust plans as needed.",
    },
    {
      title: "Expand Your Network",
      description:
        "Engage with people from diverse backgrounds and cultures. These connections can open doors to unexpected opportunities.",
    },
  ],
  交友: [
    {
      title: "Curate Your Inner Circle",
      description:
        "Evaluate your friendships and focus on nurturing those that are supportive, inspiring, and aligned with your values.",
    },
    {
      title: "Initiate Collaborative Projects",
      description:
        "Work with friends or peers on shared goals, whether professional, creative, or community-based. Collaboration strengthens bonds.",
    },
    {
      title: "Practice Reciprocity",
      description:
        "Balance giving and receiving in relationships. Mutual support builds trust and resilience in your network.",
    },
  ],
  官禄: [
    {
      title: "Clarify Career Goals",
      description:
        "Define your professional objectives and create a roadmap to achieve them. Specificity makes your actions more effective.",
    },
    {
      title: "Enhance Your Skill Set",
      description:
        "Pursue training or education that increases your value in your field. Continuous learning keeps you competitive.",
    },
    {
      title: "Strengthen Professional Relationships",
      description:
        "Invest in building trust with colleagues, mentors, and industry peers. Strong relationships can accelerate career growth.",
    },
  ],
  田宅: [
    {
      title: "Optimize Your Living Space",
      description:
        "Arrange your home environment to support comfort, productivity, and peace. Small changes can have a big impact on daily life.",
    },
    {
      title: "Plan for Long-Term Stability",
      description:
        "Consider property investments, renovations, or relocations that align with your future goals.",
    },
    {
      title: "Foster a Sense of Home",
      description:
        "Create traditions or routines that make your living space feel warm and inviting for yourself and loved ones.",
    },
  ],
  福德: [
    {
      title: "Develop a Gratitude Practice",
      description:
        "Begin or deepen a habit of regularly noting things you are grateful for. Gratitude enhances well-being and shifts perspective.",
    },
    {
      title: "Engage in Meaningful Activities",
      description:
        "Prioritize pursuits that align with your values and bring you joy, whether creative, social, or spiritual.",
    },
    {
      title: "Simplify Your Commitments",
      description:
        "Release obligations that drain your energy and focus on what truly matters to you.",
    },
  ],
  父母: [
    {
      title: "Strengthen Family Bonds",
      description:
        "Spend quality time with parents or elders, engaging in conversations that deepen understanding and connection.",
    },
    {
      title: "Preserve Family Stories and Traditions",
      description:
        "Document family history or create shared rituals that honor your heritage.",
    },
    {
      title: "Offer Support with Compassion",
      description:
        "Be attentive to the needs of parents or older family members, offering help in ways that preserve dignity and mutual respect.",
    },
  ],
};

/* ---------------------------
   5) Star meanings by palace (12 × 18)
   Placeholder export — I'll append the full object in follow-ups.
---------------------------- */
export const STAR_MEANINGS_BY_PALACE: StarMeaningsByPalace = {
  // To keep this message within size limits, I’ll paste each palace block
  // (e.g., "命宫": { ...18 stars }, "兄弟": { ... }, etc.)
  // in the next messages so you can drop them right here.

  命宫: {
    紫微: "With Zi Wei in the Life Palace, your core energy radiates authority, self-assurance, and a natural ability to inspire others. This is a time when you feel called to lead with vision, setting the tone for how you approach challenges and opportunities. People are drawn to your steadiness and your ability to hold a clear direction even in uncertain times. Harness this influence by combining your ambition with compassion, creating a path that empowers both yourself and those around you.",
    天府: "Tian Fu’s presence in the Life Palace brings stability, patience, and a grounded sense of self. You are more inclined to build your life on secure foundations, valuing both emotional and material safety. This is a favorable time to focus on long-term planning and to nurture what already works well in your world. By pairing gratitude with openness to change, you create a steady rhythm that supports growth without sacrificing stability.",
    武曲: "With Wu Qu here, your identity is shaped by resilience, discipline, and the determination to see things through. You may find yourself tackling goals with consistent effort, relying on practicality and focus to make steady progress. This is a period to embrace hard work while also allowing flexibility in your approach. When persistence is balanced with adaptability, you’ll find success both sustainable and deeply rewarding.",
    天相: "Tian Xiang in the Life Palace enhances your diplomatic nature and your ability to see multiple perspectives. You may naturally act as a mediator in situations, seeking fairness and harmony in all areas of life. This placement encourages you to lead with empathy and to create agreements that benefit everyone involved. By pairing your tact with firm boundaries, you maintain both respect and balance in your personal journey.",
    太阳: "The Sun’s light here fills your life with confidence, enthusiasm, and a desire to be fully engaged with the world. You may step into more visible roles, inspiring others with your optimism and readiness to take initiative. This is a time to pursue goals that require courage, but to also practice mindful pacing so you don’t burn out. Your warmth can be a beacon that energizes both you and those around you.",
    天机: "With Tian Ji in the Life Palace, you approach life with curiosity, adaptability, and quick thinking. This is a phase when your ideas and problem-solving skills can open important doors for you. You may be drawn to new experiences that broaden your understanding and refine your strategy for the future. By focusing on follow-through and clarity, you transform your creative thinking into tangible results.",
    太阴: "Tai Yin’s influence here gives you a reflective, intuitive, and nurturing core. You may find that your emotional intelligence guides your decisions, allowing you to connect deeply with others. This is a favorable time for inner work, quiet growth, and creating environments of peace around you. Trust your instincts, but also take action when needed to bring your visions to life.",
    廉贞: "Lian Zhen in the Life Palace centers your identity around integrity, principles, and a strong personal code. You are more willing to stand firm in your beliefs and to lead by example. This period encourages you to refine your values so that your choices clearly reflect your inner truth. Balancing conviction with openness allows you to inspire trust while remaining adaptable.",
    七杀: "Qi Sha here empowers you with courage, decisiveness, and a readiness to face challenges directly. You may feel more driven to take bold steps that push you out of your comfort zone. This is a time to channel your energy into goals that truly matter, using strategy to guide your actions. When tempered with patience, your daring can open doors to lasting breakthroughs.",
    破军: "With Po Jun in this palace, transformation becomes a defining theme of your life path. You may be drawn to break away from outdated structures or limitations in order to rebuild on stronger foundations. This is a period to embrace change with both courage and foresight. By letting go of what no longer serves you, you create space for a life more aligned with your true self.",
    贪狼: "Tan Lang here gives you a dynamic, versatile, and socially magnetic personality. You may be drawn to new experiences, creative pursuits, and diverse relationships that enrich your understanding of the world. This is a favorable time for exploration and self-expression, but balance is key to avoid spreading yourself too thin. Focus your adaptability toward goals that align with your deeper purpose.",
    巨门: "Ju Men in the Life Palace sharpens your ability to communicate, persuade, and uncover hidden truths. You may find yourself drawn to conversations that challenge your thinking or open new perspectives. This is a time to use your voice with intention, ensuring that your words foster connection rather than conflict. By listening as much as you speak, you deepen your influence and understanding.",
    天同: "With Tian Tong here, your life is guided by harmony, optimism, and a love of simplicity. You may be more focused on building peaceful relationships and environments where everyone feels at ease. This is a favorable time to enjoy life’s small pleasures while also taking gentle but consistent steps toward your long-term goals. Balance your desire for comfort with a willingness to embrace challenges when they arise.",
    天梁: "Tian Liang in the Life Palace highlights your role as a guide, protector, or source of wisdom. You may feel a deep sense of responsibility toward helping others while also building your own stability. This is a time to offer guidance generously, but also to set healthy boundaries so your energy remains balanced. Acting with compassion and clarity strengthens both your influence and your own path.",
    文昌: "Wen Chang here elevates your intellect, eloquence, and capacity for thoughtful analysis. You may be inspired to pursue new studies, refine your communication skills, and express your ideas more clearly. This is a favorable period for making well-considered decisions that reflect both logic and creativity. Your ability to convey complex thoughts simply can be a powerful tool for progress.",
    文曲: "With Wen Qu in the Life Palace, your personality is infused with artistry, emotional depth, and a love for beauty. You may feel drawn to creative pursuits that allow you to share your inner world with others. This is a time for embracing inspiration and translating it into tangible expressions. By pairing artistic vision with practical steps, you create work that leaves a lasting impression.",
    左辅: "Zuo Fu here provides steady, supportive energy that draws helpful people into your life. You may find that collaboration and teamwork play a significant role in achieving your goals. This is a favorable period to strengthen alliances and to both give and receive assistance. Trust that shared effort will lead to greater success than going it alone.",
    右弼: "You Bi’s presence in the Life Palace fosters harmony, encouragement, and emotional closeness with those around you. You may find that mutual support becomes a defining theme in your relationships. This is a time to nurture trust, offer kindness, and create an environment where everyone feels valued. Such connections will sustain you as you move forward.",
  },

  兄弟: {
    紫微: "With Zi Wei in the Siblings Palace, you are likely to take on a guiding or leadership role within your family or close peer group. Your presence naturally inspires trust, and others may look to you for direction during both challenges and successes. This is a time to use your influence to create unity rather than division. By leading with dignity and understanding, you strengthen the bonds that form your inner circle.",
    天府: "Tian Fu’s presence here fosters loyalty, stability, and mutual care among siblings or lifelong friends. You may feel a stronger sense of responsibility for creating harmony and maintaining secure ties within these relationships. This is an ideal period for resolving old misunderstandings and building dependable support systems. A consistent, nurturing approach will ensure these bonds remain a source of strength.",
    武曲: "With Wu Qu in the Siblings Palace, responsibility and reliability become defining traits in your connections. You may be the one siblings or close peers turn to when practical help or solid advice is needed. This is a period to offer steady guidance while also recognizing the importance of shared joy. Balancing seriousness with warmth will keep relationships strong and healthy.",
    天相: "Tian Xiang here brings diplomacy, fairness, and a talent for mediation to your sibling relationships. You may find yourself acting as the bridge that smooths differences and helps others find common ground. This is a favorable time for creating agreements that work for everyone and for setting examples of balanced communication. By practicing both empathy and clear boundaries, you maintain harmony and mutual respect.",
    太阳: "The Sun’s light in the Siblings Palace illuminates your connections with warmth, generosity, and optimism. You may take an active role in creating shared experiences and encouraging positivity within your family or peer group. This is a period to inspire through action, lifting others with your enthusiasm. Ensure that your energy is used to uplift rather than to overwhelm.",
    天机: "With Tian Ji here, your sibling bonds are marked by adaptability, curiosity, and stimulating exchanges of ideas. Conversations may be lively and inspire growth for everyone involved. This is a good time to work on shared plans or projects that require creative thinking. By staying open to different perspectives, you deepen trust and understanding.",
    太阴: "Tai Yin’s influence in this palace brings sensitivity, emotional closeness, and a quiet nurturing presence to your sibling relationships. You may find yourself offering comfort and understanding during times of need, becoming a safe space for others. This is a period to strengthen emotional bonds through patience and active listening. Gentle support can go a long way in building lasting trust.",
    廉贞: "Lian Zhen here adds integrity, strong principles, and mutual respect to your sibling or peer connections. You may set clear boundaries while still maintaining warmth and cooperation. This is a time to lead by example, showing that respect and honesty can coexist with flexibility. Balanced values will keep your relationships both strong and adaptable.",
    七杀: "With Qi Sha in the Siblings Palace, shared challenges and bold actions may define your relationships. You might encourage one another to push limits, take risks, or grow through adversity. This is a favorable period for tackling goals together and supporting each other in decisive action. Mutual trust will be your strongest asset in times of change.",
    破军: "Po Jun’s energy here can bring transformation and reinvention to your sibling relationships. Significant changes, whether in lifestyle, location, or priorities, may shift the dynamics between you. This is a time to embrace these shifts as opportunities for renewed closeness. Openness and flexibility will ensure these changes deepen rather than weaken your bonds.",
    贪狼: "Tan Lang in this palace adds charm, playfulness, and a spirit of adventure to sibling ties. You may enjoy exploring new experiences together and keeping your connections fresh and lively. This is a period to bond through shared creativity and mutual adaptability. Staying mindful of responsibilities will keep the fun balanced with stability.",
    巨门: "Ju Men here highlights the role of communication in your sibling relationships. Honest dialogue can resolve lingering issues and create stronger connections, but clarity is key to avoid misunderstandings. This is a good time for deep conversations that build trust. Speak with both truth and compassion to strengthen your ties.",
    天同: "With Tian Tong influencing this palace, harmony, optimism, and shared joy become central to your sibling connections. You may naturally create an atmosphere of ease where everyone feels accepted. This is a favorable time to enjoy life’s simple pleasures together, reinforcing bonds through positive experiences. Gentle encouragement can help everyone feel supported.",
    天梁: "Tian Liang here emphasizes protection, guidance, and moral support within your sibling relationships. You may feel called to be a mentor or caretaker, offering stability during uncertain times. This is a time to balance guidance with allowing others the space to grow independently. Your reliability will be deeply appreciated and remembered.",
    文昌: "Wen Chang in the Siblings Palace enhances intellectual cooperation and mutual learning. You may find joy in exchanging ideas, studying together, or working on projects that require thought and creativity. This is a period where shared knowledge can strengthen emotional connection. Encouraging open discussion will bring out the best in everyone.",
    文曲: "With Wen Qu here, artistry, creativity, and an appreciation for beauty may be shared within your sibling group. You might collaborate on creative projects or simply inspire each other through shared cultural experiences. This is a time to connect on an emotional and aesthetic level. Let your mutual inspiration bring you closer.",
    左辅: "Zuo Fu’s presence in this palace provides consistent support, loyalty, and reliability in sibling relationships. You may feel assured that help is always available when needed, and you may also be the one offering it. This is a time to invest in building dependable bonds. Mutual care will ensure these connections remain strong.",
    右弼: "You Bi here fosters emotional warmth, encouragement, and mutual respect among siblings or close peers. You may find that shared kindness and support strengthen your relationships over time. This is a favorable period for resolving differences through compassion. Acts of encouragement will deepen trust and unity.",
  },

  夫妻: {
    紫微: "With Zi Wei in the Spouse Palace, your relationships are infused with dignity, mutual respect, and a shared sense of purpose. You are likely to seek a partner who matches your vision and ambition, someone who can stand beside you as an equal in life’s pursuits. This period encourages leading your relationship with clarity and integrity, setting a tone of mutual trust. By blending strength with empathy, you create a partnership that is both inspiring and enduring.",
    天府: "Tian Fu’s presence in the Spouse Palace emphasizes loyalty, security, and emotional steadiness within relationships. You and your partner may find comfort in routines and in building a stable home life together. This is a favorable time for reinforcing shared values and strengthening the foundation you stand on. By pairing reliability with moments of spontaneous affection, your relationship can enjoy both safety and warmth.",
    武曲: "With Wu Qu here, commitment and discipline become defining themes in your love life. You may focus on practical support and shared responsibility, ensuring that your partnership is built on trust and mutual effort. This is a time to prove your dedication through consistent action. Remember, weaving in joy and emotional openness will keep the connection vibrant.",
    天相: "Tian Xiang in the Spouse Palace brings a balanced and diplomatic energy to your relationships. You may prioritize fairness, compromise, and mutual understanding, working to ensure that both voices are equally valued. This is an ideal period for resolving old misunderstandings and establishing stronger emotional harmony. By listening deeply and responding thoughtfully, you nurture trust and unity.",
    太阳: "The Sun’s energy here lights up your relationships with vitality, optimism, and an adventurous spirit. You may feel inspired to initiate new experiences together, creating shared memories that strengthen your bond. This is a time to embrace openness and generous acts of love. Balancing enthusiasm with attentiveness will help the relationship thrive without becoming overwhelming.",
    天机: "With Tian Ji in this palace, communication, adaptability, and curiosity are key to relationship growth. You may find joy in exploring new ideas, perspectives, and even hobbies with your partner. This is a period to keep the connection fresh by encouraging dialogue and flexibility. The more you evolve together, the deeper your trust will become.",
    太阴: "Tai Yin’s influence here creates a nurturing, empathetic, and emotionally connected partnership. You may feel a heightened sense of care and attentiveness toward your partner’s needs, fostering intimacy through quiet understanding. This is a time to build safety through emotional honesty and gentle affection. Trust grows naturally when empathy guides your actions.",
    廉贞: "Lian Zhen in the Spouse Palace highlights loyalty, moral strength, and a commitment to shared values. You may feel called to stand firmly by your partner through both ease and challenge. This is a period to define your relationship principles clearly while allowing flexibility for growth. Mutual respect becomes the anchor that keeps your love steady.",
    七杀: "With Qi Sha here, passion, decisiveness, and an appetite for shared challenges may shape your relationship. You might be drawn to take bold steps together, tackling obstacles as a team. This is a time for courage and joint action, but it’s important to balance intensity with patience. Respect for each other’s independence will keep the connection healthy.",
    破军: "Po Jun’s placement here can bring significant transformation to your love life. Relationships may go through changes that redefine the way you connect and commit. This is a favorable time for reinventing patterns that no longer serve you and your partner. Embracing change together can deepen trust and open new chapters in your bond.",
    贪狼: "Tan Lang in the Spouse Palace adds charm, romance, and a playful spirit to your connections. You may find that attraction and mutual enjoyment are heightened, making this a period for shared adventures. Balancing pleasure with shared goals will ensure your relationship grows both emotionally and practically. Joy and responsibility can complement each other beautifully.",
    巨门: "Ju Men’s influence here emphasizes the importance of clear and honest communication in relationships. Conversations may become more meaningful, but they can also reveal misunderstandings if not approached with care. This is a time to practice deep listening and thoughtful expression. Mutual understanding will be the key to maintaining harmony.",
    天同: "With Tian Tong here, harmony, companionship, and a gentle rhythm define your love life. You may find joy in simple moments and shared relaxation with your partner. This is a period to nurture a sense of peace in your connection, while also encouraging shared growth. Balance comfort with occasional challenges to keep the bond strong.",
    天梁: "Tian Liang in the Spouse Palace brings a protective and supportive influence to your relationships. You may take on a guiding role, offering wisdom and stability when needed. This is a time for building trust through consistent care and understanding. Allowing space for your partner’s independence will create a healthy balance.",
    文昌: "Wen Chang here enhances communication, shared learning, and mutual intellectual respect in relationships. You may enjoy exchanging ideas and deepening your emotional bond through meaningful dialogue. This is a favorable time for resolving differences with logic and grace. Thoughtful words and open-mindedness will keep the connection flourishing.",
    文曲: "With Wen Qu in the Spouse Palace, artistry, romance, and creative expression enrich your partnership. You may be inspired to share cultural or artistic experiences, deepening emotional intimacy through beauty and inspiration. This is a time to celebrate love in both small and grand gestures. Mutual creativity will keep the relationship vibrant.",
    左辅: "Zuo Fu’s presence here strengthens loyalty, mutual support, and reliability within your relationship. You and your partner may find that working together toward common goals deepens your commitment. This is a time to lean into cooperation and shared responsibility. Acts of steadfast care will form the foundation for lasting love.",
    右弼: "You Bi here encourages emotional closeness, encouragement, and mutual reassurance in relationships. You may find that kindness and affirmation flow more easily between you and your partner. This is a period to cultivate trust by supporting each other’s dreams. Consistent encouragement will make your bond stronger and more secure.",
  },

  子女: {
    紫微: "With Zi Wei in the Children Palace, your relationship with children is guided by a blend of authority, vision, and encouragement. You may naturally take on the role of mentor or role model, shaping their development through strong values and steady guidance. This is a time to inspire them to dream boldly while also providing the structure they need to grow. By combining leadership with warmth, you help them build confidence and resilience for life ahead.",
    天府: "Tian Fu’s presence in this palace emphasizes stability, patience, and creating a secure environment for children to thrive. You may feel a deep responsibility for their emotional and material well-being, ensuring they have the resources they need. This is a favorable period for fostering trust through consistent care and support. Balancing discipline with gentleness will allow their individuality to flourish.",
    武曲: "With Wu Qu here, discipline, responsibility, and a focus on practical life skills become key themes in your connection with children. You may guide them to develop resilience and self-reliance through structured routines and clear expectations. This is a time to encourage determination while also making space for their creativity. Blending firmness with encouragement will keep your guidance both effective and loving.",
    天相: "Tian Xiang in the Children Palace brings fairness, diplomacy, and a cooperative spirit to your parenting or mentorship style. You may work to ensure each child feels equally valued, encouraging open communication and mutual respect. This is a period for resolving misunderstandings calmly and setting balanced boundaries. By leading with empathy, you nurture trust and harmony in the relationship.",
    太阳: "The Sun’s energy here fills your interactions with children with warmth, positivity, and an adventurous spirit. You may encourage them to explore, take initiative, and approach life with optimism. This is a time to create memorable experiences that build both joy and confidence. Leading by example will inspire them to shine in their own unique way.",
    天机: "With Tian Ji in this palace, adaptability, curiosity, and mental stimulation shape your role with children. You may enjoy teaching them problem-solving skills and encouraging creative thinking. This is a favorable time for introducing them to new experiences and perspectives. By keeping communication open and engaging, you help them grow into adaptable, resourceful individuals.",
    太阴: "Tai Yin here fosters a deeply nurturing and emotionally supportive connection with children. You may provide a safe and comforting space where they feel understood and valued. This is a time to strengthen bonds through empathy, attentive listening, and acts of care. While protecting them, also encourage independence so they develop confidence in their own abilities.",
    廉贞: "Lian Zhen’s influence emphasizes instilling strong values, integrity, and discipline in children. You may set clear moral standards and encourage them to take pride in doing the right thing. This is a period for modeling resilience and ethical behavior in everyday life. Balancing firmness with affection ensures they respect your guidance and feel secure in it.",
    七杀: "With Qi Sha here, you may inspire children to be courageous, independent, and willing to face challenges head-on. This is a time when they can benefit from learning how to take calculated risks and act with determination. Your role is to guide their boldness into productive channels. Encouraging strategic thinking will help them make wise choices.",
    破军: "Po Jun in the Children Palace can bring change, transformation, or unexpected turning points in your relationship with children. These shifts may open new opportunities for understanding each other and growing together. This is a time to approach change with flexibility and optimism. Supporting them through transitions will strengthen trust and resilience on both sides.",
    贪狼: "Tan Lang here adds playfulness, creativity, and adaptability to your bond with children. You may encourage them to explore different activities, artistic pursuits, or social opportunities. This is a favorable period for letting them express themselves freely while still guiding them with gentle structure. A balance between fun and focus will help them develop holistically.",
    巨门: "Ju Men’s presence emphasizes the role of communication and honest dialogue in your relationship with children. This is a time to encourage open conversations where their thoughts and feelings are welcomed. While misunderstandings may arise, patient listening and clear explanations will strengthen the bond. Your willingness to engage deeply builds lasting trust.",
    天同: "With Tian Tong here, harmony, joy, and emotional closeness define your connection with children. You may create an environment where they feel relaxed, accepted, and encouraged to be themselves. This is a favorable time for bonding through shared activities and lighthearted moments. Balancing comfort with gentle challenges will help them grow in confidence.",
    天梁: "Tian Liang’s influence brings protection, guidance, and a mentor-like role into your relationship with children. You may feel deeply invested in their long-term well-being, offering advice and stability. This is a period to help them develop their own moral compass. Providing both safety and freedom will allow them to grow into strong, independent individuals.",
    文昌: "Wen Chang here supports intellectual growth, learning, and articulate self-expression in children. You may enjoy teaching them, encouraging curiosity, and guiding them toward clear thinking. This is a favorable time for developing both their academic skills and emotional intelligence. Nurturing their love for learning will have lasting benefits.",
    文曲: "With Wen Qu in the Children Palace, creativity, artistry, and emotional expression take center stage. You may encourage their involvement in music, art, or storytelling as a way to explore their inner world. This is a time for celebrating their unique talents while helping them channel inspiration into tangible achievements.",
    左辅: "Zuo Fu’s presence here emphasizes dependable support, encouragement, and teamwork in your role with children. You may be the steady hand they rely on when navigating challenges. This is a favorable time to teach them the value of cooperation. Consistent support will build both trust and respect.",
    右弼: "You Bi here fosters kindness, empathy, and mutual encouragement between you and your children. You may find that emotional reassurance flows naturally in both directions. This is a time to strengthen bonds through shared goals and heartfelt conversations. Building emotional safety will ensure the relationship remains strong and enduring.",
  },
  财帛: {
    紫微: "With Zi Wei in the Wealth Palace, you bring a sense of authority, vision, and leadership to financial matters. You may feel inclined to take control of budgeting, investments, or business ventures, guiding them with long-term thinking. This is a favorable time to establish solid strategies for building wealth and influence. Balancing ambition with prudent risk management ensures that your resources grow steadily without unnecessary strain.",
    天府: "Tian Fu here blesses you with stability, patience, and a knack for preserving and managing resources wisely. You may prefer slow but secure financial growth, valuing sustainability over quick gains. This is an ideal time to focus on savings, investments, or property that will provide long-term security. Your steady approach helps create a foundation that supports both comfort and opportunity.",
    武曲: "With Wu Qu in the Wealth Palace, determination, hard work, and disciplined money management are key to your prosperity. You may prefer to earn through consistent effort and strategic planning rather than speculation. This is a time to strengthen your financial base through persistence and careful decision-making. Staying adaptable will ensure you’re ready for both challenges and opportunities.",
    天相: "Tian Xiang here brings balance, fairness, and cooperation to your financial dealings. You may thrive through partnerships, negotiations, or roles that require tact in managing shared resources. This is a period to ensure agreements are mutually beneficial and transparent. By combining diplomacy with clear goals, you can create wealth that benefits everyone involved.",
    太阳: "The Sun’s influence in the Wealth Palace fills your financial life with confidence, activity, and a willingness to take initiative. You may be drawn to ventures that are bold, creative, or highly visible. This is a time to act on promising opportunities, but ensure that enthusiasm is tempered by sound judgment. Wise choices now can lead to lasting gains.",
    天机: "With Tian Ji here, your financial approach is adaptive, innovative, and strategy-driven. You may benefit from diversifying income sources, exploring new industries, or applying creative solutions to money matters. This is a time for flexibility, but also for careful follow-through. The right combination of vision and execution can open unexpected paths to prosperity.",
    太阴: "Tai Yin’s presence in the Wealth Palace brings a gentle yet strategic approach to finances. You may lean toward investments that grow quietly over time, such as savings, property, or artistic ventures. This is a favorable time for making thoughtful, long-term plans rather than rushing decisions. Intuition can guide you well if paired with practical analysis.",
    廉贞: "Lian Zhen here encourages a principled and disciplined approach to money. You may prioritize integrity in financial dealings and prefer building wealth through honest, structured efforts. This is a time to review your spending and earning habits, ensuring they align with your core values. Strong ethics combined with strategic planning can yield lasting rewards.",
    七杀: "With Qi Sha in the Wealth Palace, boldness and decisive action may define your financial path. You may take calculated risks or pursue ventures that require courage and resilience. This is a time to seize high-potential opportunities, but ensure they are backed by research and strategy. When channeled wisely, your daring can create substantial growth.",
    破军: "Po Jun here signals transformation and potential reinvention in your financial life. Major changes in income, career, or investments may occur, offering chances to rebuild on stronger foundations. This is a period to remain flexible and open to unconventional approaches. Embracing change can lead to breakthroughs that redefine your relationship with money.",
    贪狼: "Tan Lang in this palace adds charm, adaptability, and a flair for spotting new opportunities. You may enjoy earning through creative, social, or trend-driven ventures. This is a time for networking and exploring innovative income streams. Keeping your enthusiasm grounded will help ensure lasting success rather than fleeting gains.",
    巨门: "Ju Men here places emphasis on communication and negotiation in financial matters. You may excel at making deals, selling ideas, or identifying hidden opportunities. This is a favorable time for clear and strategic discussions about money. Careful wording and transparent terms will help you secure beneficial outcomes.",
    天同: "With Tian Tong influencing the Wealth Palace, comfort, enjoyment, and steady growth may define your financial approach. You may prioritize stability and a lifestyle that balances work with pleasure. This is a time to ensure your spending supports long-term happiness as well as security. Gentle discipline will keep prosperity flowing without unnecessary stress.",
    天梁: "Tian Liang here suggests a protective and guiding role in financial matters, either for yourself or others. You may manage resources with caution, preferring to safeguard what you have before taking risks. This is a period to strengthen your safety net and plan for the future. Thoughtful stewardship can lead to dependable prosperity.",
    文昌: "Wen Chang’s presence enhances financial planning, organization, and the ability to make well-informed decisions. You may excel at budgeting, tracking details, and spotting patterns that lead to growth. This is a favorable time to refine your financial strategies through research and education. Precision now will yield stronger results later.",
    文曲: "With Wen Qu in the Wealth Palace, creativity and artistry may influence how you earn or manage money. You may find opportunities in design, entertainment, or cultural ventures. This is a time to merge passion with practicality, turning inspiration into a sustainable income stream. Balancing vision with execution is key.",
    左辅: "Zuo Fu here brings supportive networks and cooperative partnerships that benefit your finances. You may find that allies or mentors help you secure better opportunities or make wiser investments. This is a time to nurture mutually beneficial relationships. Collaboration will enhance your stability and growth.",
    右弼: "You Bi’s influence fosters trust, goodwill, and helpful connections in financial matters. You may receive support or advice from people who genuinely want to see you succeed. This is a favorable time to build lasting professional relationships. Openness to guidance will expand your wealth-building potential.",
  },

  疾厄: {
    紫微: "With Zi Wei in the Health Palace, you are encouraged to approach well-being with a sense of discipline, structure, and long-term vision. You may take an active role in managing your health, seeking ways to maintain both physical vitality and mental clarity. This is a favorable time for setting sustainable routines that reflect self-respect and balance. By blending authority over your habits with patience, you can build a foundation for lasting wellness.",
    天府: "Tian Fu’s presence here supports stability, steady energy, and the importance of consistent care for your body and mind. You may prefer tried-and-true methods for maintaining health, valuing reliability over sudden changes. This is a period to focus on nutrition, rest, and moderation. Long-term well-being will flourish when you honor your need for stability and comfort.",
    武曲: "With Wu Qu in the Health Palace, resilience, discipline, and a structured lifestyle are key to maintaining vitality. You may find that commitment to regular exercise and healthy routines pays off significantly. This is a time to strengthen both your body and your determination. Flexibility in your methods will ensure your persistence remains effective and enjoyable.",
    天相: "Tian Xiang here brings balance and moderation to your approach to health. You may naturally seek harmony between work, rest, and recreation, understanding that all play a role in overall wellness. This is a favorable time to make mindful adjustments that create equilibrium. By listening to your body and respecting its limits, you can maintain energy and vitality.",
    太阳: "The Sun’s influence in the Health Palace brings vitality, warmth, and an active spirit. You may feel motivated to engage in physical activities that energize and inspire you. This is a time to channel your high energy into constructive, health-boosting pursuits. Balance exertion with recovery to keep your strength at its peak.",
    天机: "With Tian Ji here, adaptability, strategy, and curiosity shape your health choices. You may be drawn to exploring new wellness methods, from alternative therapies to innovative fitness routines. This is a favorable time to experiment while keeping a grounded perspective. Tracking results will help you integrate the most effective habits into your lifestyle.",
    太阴: "Tai Yin’s presence in this palace encourages a gentle, restorative approach to health. You may focus on self-care practices that soothe the mind and replenish emotional reserves. This is a time for prioritizing rest, reflection, and activities that calm the nervous system. Nurturing your inner balance will have a powerful effect on your physical health.",
    廉贞: "Lian Zhen here fosters a disciplined and principled approach to well-being. You may commit to clear health goals and take pride in following through with them. This is a favorable time to review your routines and ensure they align with your deeper values. Consistency, paired with flexibility, will keep you moving toward sustainable vitality.",
    七杀: "With Qi Sha in the Health Palace, determination and courage may drive you to tackle health challenges directly. You might feel motivated to take bold actions that create noticeable improvements. This is a time to pair your strength with smart planning to avoid burnout. Channeling intensity into focused, realistic goals will yield lasting results.",
    破军: "Po Jun here can bring transformation and significant change in your health habits or priorities. You may decide to overhaul routines that no longer serve you, replacing them with more effective approaches. This is a favorable time for embracing change with an open mind. New habits established now could redefine your well-being for the better.",
    贪狼: "Tan Lang in the Health Palace adds adaptability, variety, and a preference for enjoyable wellness activities. You may be more inclined to pursue health goals through creative or social outlets, such as group classes or active hobbies. This is a time to make well-being fun, but balance indulgence with structure for long-term benefits.",
    巨门: "Ju Men’s influence here emphasizes the importance of honest self-reflection and clear information in health matters. You may benefit from learning more about your body’s needs and making adjustments based on accurate knowledge. This is a favorable time for open discussions with health professionals. Clarity and understanding will lead to smarter wellness decisions.",
    天同: "With Tian Tong here, harmony, comfort, and steady routines play a big role in maintaining health. You may prefer gentle forms of exercise and nourishing meals over extreme regimens. This is a time to create a balanced lifestyle that feels sustainable. Emotional peace will contribute greatly to your physical vitality.",
    天梁: "Tian Liang’s presence in this palace emphasizes protection, prevention, and wise health management. You may focus on avoiding risks and maintaining long-term resilience through thoughtful choices. This is a favorable time for check-ups, preventive care, and strengthening your immune system. A cautious yet confident approach will serve you well.",
    文昌: "Wen Chang here supports a thoughtful and organized approach to well-being. You may enjoy tracking your progress, researching wellness strategies, and applying logic to your health decisions. This is a time to refine routines based on what’s proven effective. Careful planning now will lead to consistent and lasting improvements.",
    文曲: "With Wen Qu in the Health Palace, creativity and emotional wellness are deeply connected to your overall vitality. You may find that artistic activities or hobbies help reduce stress and boost your energy. This is a favorable time to explore expressive outlets as part of your self-care. Balancing the mind and heart will naturally support the body.",
    左辅: "Zuo Fu here brings helpful support systems that aid your health journey. Friends, family, or mentors may provide guidance, resources, or encouragement to keep you on track. This is a time to accept assistance and surround yourself with positive influences. Collective effort will make your wellness goals more achievable.",
    右弼: "You Bi’s influence in the Health Palace fosters emotional encouragement and cooperative support in your wellness efforts. You may benefit from working alongside others toward shared health goals. This is a favorable time to nurture connections that motivate you to stay consistent. Mutual accountability will help you achieve lasting results.",
  },

  迁移: {
    紫微: "With Zi Wei in the Travel Palace, you approach movement, relocation, and change with authority and strategic foresight. You may feel drawn to take the lead when entering new environments, ensuring that your presence is recognized and respected. This is a favorable time to plan long-distance travel, career moves, or lifestyle shifts with clarity and vision. By pairing confidence with cultural sensitivity, you create opportunities that expand both your network and your influence.",
    天府: "Tian Fu here brings stability, resourcefulness, and a preference for well-planned journeys or relocations. You may find that moving or traveling is most successful when it is approached with patience and careful preparation. This is a period to focus on creating a sense of security wherever you go. Establishing a stable base will make transitions smooth and beneficial.",
    武曲: "With Wu Qu in the Travel Palace, resilience, determination, and practicality shape your experiences in new places. You may thrive when challenges arise on the road, seeing them as opportunities to prove your capability. This is a favorable time for goal-oriented travel or relocation tied to career advancement. Balancing hard work with openness to local culture will deepen your success.",
    天相: "Tian Xiang’s presence here brings diplomacy, balance, and cooperative energy to your ventures away from home. You may navigate new environments with ease, fostering harmonious relationships wherever you go. This is a time to seek collaborative opportunities and to present yourself with tact and respect. Such connections can turn temporary moves into lasting gains.",
    太阳: "The Sun’s energy in the Travel Palace fills your journeys with enthusiasm, visibility, and a spirit of adventure. You may find yourself naturally taking on leadership roles in unfamiliar settings, inspiring others with your confidence. This is a favorable time for public-facing work or travel that involves inspiring groups. Balancing assertiveness with adaptability will keep your influence positive.",
    天机: "With Tian Ji here, curiosity, strategy, and adaptability define your travels or relocations. You may be drawn to explore new cultures, industries, or ideas in different environments. This is a time to embrace learning opportunities and to stay flexible as plans evolve. Your ability to think on your feet will ensure success in dynamic settings.",
    太阴: "Tai Yin in this palace brings a reflective, intuitive, and emotionally attuned approach to change and travel. You may prefer environments that feel safe, comfortable, and nurturing, even when far from home. This is a favorable time for quiet retreats, study abroad, or moves that enhance your emotional well-being. Trusting your instincts will help you choose the right settings.",
    廉贞: "Lian Zhen here highlights discipline, integrity, and resilience when adjusting to new environments. You may face relocation or travel with a strong sense of purpose, ensuring that your actions align with your personal values. This is a time to establish credibility quickly in unfamiliar places. Balancing firmness with openness will help you earn trust and respect.",
    七杀: "With Qi Sha in the Travel Palace, you may experience bold, transformative, and sometimes intense journeys. This is a period when decisive actions taken away from home can lead to significant breakthroughs. You are likely to embrace challenges in new settings with courage. Directing this energy toward purposeful goals will ensure lasting benefits.",
    破军: "Po Jun here signals dramatic changes through travel or relocation. Moves may feel sudden or unconventional, but they often open doors to completely new paths. This is a time to embrace transformation and let go of rigid expectations. Flexibility will allow these shifts to bring unexpected opportunities for renewal.",
    贪狼: "Tan Lang in the Travel Palace adds charm, sociability, and a taste for variety to your journeys. You may be drawn to vibrant places where networking and exploration come naturally. This is a favorable time for creative projects or social ventures away from home. Balancing pleasure with productivity will keep your travels enriching.",
    巨门: "Ju Men’s influence here emphasizes communication, observation, and the ability to uncover hidden opportunities in new settings. You may find success through negotiation, research, or deep conversations during your travels. This is a time to be curious but cautious, as misunderstandings can occur. Clear expression will ensure positive outcomes.",
    天同: "With Tian Tong here, your travels are marked by ease, enjoyment, and a focus on creating harmonious environments. You may prefer relaxed journeys over intense schedules, finding joy in the small pleasures along the way. This is a favorable time for building friendly connections wherever you go. A calm presence will open doors to supportive relationships.",
    天梁: "Tian Liang in the Travel Palace suggests that you may take on a guiding, protective, or advisory role when away from home. Others may turn to you for wisdom and stability in unfamiliar situations. This is a period to travel with purpose, ensuring that your contributions leave a positive mark. Patience and a helpful spirit will be remembered.",
    文昌: "Wen Chang here enhances your ability to learn, adapt, and communicate in new environments. You may enjoy studying, teaching, or exchanging knowledge while traveling. This is a favorable time for academic or professional development abroad. Articulating your ideas clearly will help you make the most of new opportunities.",
    文曲: "With Wen Qu in the Travel Palace, creativity, artistry, and emotional expression may flourish away from home. You could be inspired by different cultures or surroundings, fueling your artistic work. This is a time to capture beauty and meaning from your journeys. Sharing these experiences can strengthen your connections with others.",
    左辅: "Zuo Fu’s influence here provides helpful allies and supportive networks in unfamiliar places. You may find that assistance arrives just when you need it most. This is a favorable time to build collaborative relationships that enhance your experiences. Mutual support will make your transitions smoother and more rewarding.",
    右弼: "You Bi here brings kindness, encouragement, and cooperative energy to your travels or relocations. You may meet people who genuinely want to help you succeed. This is a time to remain open to connections and to reciprocate goodwill. Building rapport in new environments will leave a lasting positive impression.",
  },

  官禄: {
    紫微: "With Zi Wei in the Career Palace, you approach your professional path with authority, vision, and a strong sense of responsibility. You may feel called to take on leadership roles where your decisions can guide teams or organizations toward long-term success. This is a favorable time to focus on strategic planning and high-level goals. Balancing ambition with diplomacy will ensure your influence is respected and welcomed.",
    天府: "Tian Fu here brings stability, reliability, and a steady rise in your professional life. You may prefer careers that offer long-term security, clear structures, and the chance to build a strong foundation. This is a period to consolidate your position through consistent performance and careful planning. Your dependability will be a key factor in your growth.",
    武曲: "With Wu Qu in the Career Palace, discipline, perseverance, and a strong work ethic define your professional approach. You are willing to put in the time and effort to master your craft. This is a favorable time for taking on demanding projects that showcase your reliability. Staying adaptable will help you handle unexpected challenges effectively.",
    天相: "Tian Xiang here enhances your ability to work in cooperative environments and manage relationships with colleagues and superiors. You may excel in roles that require tact, diplomacy, and fairness. This is a period to build alliances and establish a reputation for integrity. By balancing empathy with clear decision-making, you can advance steadily.",
    太阳: "The Sun’s influence in the Career Palace fills your work life with energy, visibility, and initiative. You may thrive in leadership roles, public-facing positions, or entrepreneurial ventures. This is a time to take bold steps toward your goals while maintaining a balance between confidence and humility. Your enthusiasm can inspire both colleagues and clients.",
    天机: "With Tian Ji here, adaptability, problem-solving skills, and strategic thinking shape your career path. You may be drawn to fields that require innovation, analysis, or constant learning. This is a favorable time for exploring new professional directions or updating your skills. Clear follow-through will ensure your ideas are successfully implemented.",
    太阴: "Tai Yin in this palace brings a thoughtful, supportive, and detail-oriented approach to your work. You may excel in roles that require care, precision, or emotional intelligence. This is a time to focus on building trust with colleagues and delivering consistent results. Balancing your reflective nature with proactive action will help you advance.",
    廉贞: "Lian Zhen here highlights integrity, discipline, and a commitment to professional ethics. You may prefer to work in environments where your values are aligned with the organization’s mission. This is a period to stand firm in your principles while remaining open to collaborative input. Your steadfastness will earn you long-term respect.",
    七杀: "With Qi Sha in the Career Palace, bold moves and decisive actions can define your professional journey. You may feel compelled to take on high-risk, high-reward opportunities or challenging leadership roles. This is a time to channel your courage into strategic, well-prepared efforts. Determination paired with planning will yield impressive achievements.",
    破军: "Po Jun here signals major transformations in your career, possibly involving sudden changes in role, industry, or responsibilities. While the shifts may feel disruptive, they can open the door to more fulfilling paths. This is a time to embrace reinvention with optimism. Adaptability will turn challenges into opportunities for growth.",
    贪狼: "Tan Lang’s influence adds charm, creativity, and adaptability to your professional life. You may excel in roles that involve networking, innovation, or client relations. This is a favorable period for pursuing opportunities that align with your passions. Balancing enjoyment with discipline will help you sustain long-term success.",
    巨门: "Ju Men here emphasizes communication, negotiation, and the ability to uncover valuable insights in your work. You may thrive in roles that require persuasion or investigative skills. This is a time to use your voice to influence outcomes positively. Clear and transparent communication will build your credibility.",
    天同: "With Tian Tong in the Career Palace, harmony, collaboration, and a balanced approach guide your professional choices. You may prefer roles that allow for a steady pace and a pleasant work environment. This is a favorable time to strengthen workplace relationships. Maintaining a calm demeanor will help you handle challenges gracefully.",
    天梁: "Tian Liang’s presence here highlights mentorship, protection, and a focus on ethical leadership. You may find yourself guiding others or safeguarding the integrity of projects. This is a time to align your professional path with meaningful contributions. Wisdom and consistency will ensure you leave a lasting positive mark.",
    文昌: "Wen Chang in the Career Palace enhances your organizational skills, planning ability, and intellectual contributions. You may excel in roles that require precise execution and effective communication. This is a favorable period to refine your methods and showcase your expertise. A detail-oriented approach will strengthen your professional reputation.",
    文曲: "With Wen Qu here, creativity, artistry, and emotional intelligence become assets in your career. You may thrive in fields related to design, media, education, or culture. This is a time to channel your inspiration into projects that also have practical value. Combining vision with structure will ensure long-term success.",
    左辅: "Zuo Fu’s presence here suggests strong support from colleagues, mentors, or collaborators in your career journey. You may find that teamwork leads to significant achievements. This is a favorable time to nurture professional alliances. Trust and cooperation will be the keys to reaching your goals.",
    右弼: "You Bi here fosters goodwill, encouragement, and mutual assistance in your professional life. You may receive help from influential figures or act as a supportive force for others. This is a time to build relationships based on respect and reciprocity. Shared success will enhance your reputation and opportunities.",
  },
  田宅: {
    紫微: "With Zi Wei in the Property Palace, you approach matters of home, land, and property ownership with authority, vision, and careful planning. You may feel drawn to create a living environment that reflects both stability and prestige. This is a favorable time to make strategic decisions about real estate investments or home improvements. By pairing ambition with practicality, you can build a secure foundation that enhances both comfort and value over time.",
    天府: "Tian Fu here blesses your home life and property matters with stability, patience, and resourcefulness. You may prefer investing in property that offers long-term security and a sense of permanence. This is a period for improving your living environment in ways that support both comfort and financial stability. Your grounded approach will help your home become a lasting source of strength.",
    武曲: "With Wu Qu in the Property Palace, discipline, perseverance, and attention to detail define your approach to home and real estate matters. You may focus on property as both a place of stability and a practical investment. This is a favorable time to improve or expand your holdings through steady, calculated action. A commitment to long-term goals will yield tangible rewards.",
    天相: "Tian Xiang’s presence here brings balance, fairness, and cooperative energy to your home and property dealings. You may work well with family members, partners, or associates in making housing decisions. This is a favorable period for creating living arrangements that benefit everyone involved. Diplomacy and clear agreements will keep the process smooth and mutually beneficial.",
    太阳: "The Sun’s influence in the Property Palace fills your living space with warmth, activity, and vitality. You may take pride in hosting gatherings, improving your home’s atmosphere, or making your surroundings more lively and inspiring. This is a time for creating an environment that energizes both you and those around you. Balancing beauty with functionality will maximize the benefits.",
    天机: "With Tian Ji here, adaptability, curiosity, and a willingness to explore options shape your approach to property and living arrangements. You may be open to moving, renovating, or trying unconventional housing solutions. This is a favorable time to research and plan carefully before committing. A flexible mindset will help you find the most rewarding opportunities.",
    太阴: "Tai Yin in this palace brings a nurturing, protective, and comfort-focused approach to your home life. You may create an environment that feels safe, peaceful, and emotionally supportive. This is a time to invest in creating harmony within your living space, both aesthetically and emotionally. Trusting your instincts will help you design a space that truly feels like a sanctuary.",
    廉贞: "Lian Zhen here emphasizes structure, discipline, and adherence to clear principles in property matters. You may prefer making decisions about your living arrangements with careful planning and a focus on long-term integrity. This is a favorable time to ensure your home supports your values and lifestyle. Practicality combined with aesthetics will make your property decisions both sound and satisfying.",
    七杀: "With Qi Sha in the Property Palace, you may experience bold changes or decisive actions in home or real estate matters. This could involve moving, renovating, or taking on a significant property investment. This is a time to act with confidence while keeping a clear plan in place. Bold moves can lead to lasting benefits if executed wisely.",
    破军: "Po Jun here suggests transformation and reinvention in your home or property situation. You may be inspired to completely overhaul your living environment or take on unconventional real estate opportunities. This is a favorable time to embrace change and think outside the box. Flexibility will turn potential disruption into positive renewal.",
    贪狼: "Tan Lang in this palace brings charm, adaptability, and creativity to your approach to home and property. You may enjoy experimenting with interior design, entertaining guests, or choosing vibrant neighborhoods. This is a time to create a living space that reflects your personality and passions. Balancing enjoyment with practicality will ensure your property remains both fun and functional.",
    巨门: "Ju Men here emphasizes communication, negotiation, and careful research in property matters. You may excel in real estate deals or renovations that require coordination with others. This is a favorable period for discussing options openly and ensuring clarity in all agreements. Clear dialogue will help you secure the best results.",
    天同: "With Tian Tong in the Property Palace, comfort, harmony, and a welcoming atmosphere are your priorities at home. You may prefer a peaceful environment where you can relax and recharge. This is a favorable time for improving your living space to enhance emotional well-being. Simple changes can make a significant difference in creating a joyful home.",
    天梁: "Tian Liang’s influence here brings a protective and guiding energy to your living arrangements. You may choose homes or properties with a strong sense of safety and long-term value. This is a time to make decisions that secure your future stability. Thoughtful planning will help ensure your home remains a place of refuge.",
    文昌: "Wen Chang here supports an organized, thoughtful, and well-planned approach to property matters. You may enjoy researching design ideas, renovation strategies, or investment options. This is a favorable time to make clear, informed decisions that enhance both the function and beauty of your home. Careful preparation now will pay off later.",
    文曲: "With Wen Qu in the Property Palace, artistry, aesthetics, and emotional connection influence your home life. You may be drawn to decorating or renovating in ways that express your creativity. This is a time to make your living space a reflection of your inner world. Combining inspiration with practical planning will create a truly fulfilling home environment.",
    左辅: "Zuo Fu’s presence here suggests supportive relationships and helpful connections in property matters. You may receive assistance from family, friends, or advisors in improving or acquiring a home. This is a favorable time to collaborate with others on shared property goals. Mutual effort will lead to satisfying results.",
    右弼: "You Bi here fosters goodwill, encouragement, and harmonious cooperation in home and property dealings. You may find that working with others to enhance your living environment is both enjoyable and productive. This is a time to strengthen bonds through shared space and mutual respect. Kindness and collaboration will make your home life more rewarding.",
  },
  福德: {
    紫微: "With Zi Wei in the Fortune Palace, you approach happiness and spiritual well-being with a sense of dignity, vision, and purpose. You may feel drawn to lead by example, showing others how to cultivate lasting contentment through balance and self-mastery. This is a favorable time to align your daily habits with your long-term values. By combining inner discipline with generosity, you can create a deeply fulfilling and meaningful life.",
    天府: "Tian Fu here blesses your inner life with stability, comfort, and a natural sense of gratitude. You may find joy in simple pleasures and in maintaining harmony between your inner and outer worlds. This is a time to focus on cultivating peace of mind through consistent, steady practices. Your sense of fulfillment grows when you balance material comfort with emotional richness.",
    武曲: "With Wu Qu in the Fortune Palace, discipline, persistence, and focus guide your pursuit of happiness. You may derive deep satisfaction from working toward goals and seeing your efforts bear fruit. This is a favorable time to channel determination into personal growth. Balance your strong drive with moments of rest to maintain long-term emotional well-being.",
    天相: "Tian Xiang’s presence here encourages balance, fairness, and cooperation as key ingredients for inner peace. You may feel most fulfilled when relationships are harmonious and mutual respect is present. This is a time to create an environment—both personal and social—that reflects your values. Your sense of happiness grows when you nurture both your needs and those of others.",
    太阳: "The Sun’s energy in the Fortune Palace fills your inner world with optimism, enthusiasm, and the courage to pursue what brings you joy. You may be drawn to activities that inspire and energize you, as well as to sharing that positivity with others. This is a favorable time to lead by example, showing how happiness can be cultivated through action. Balance your active nature with quiet moments of reflection for sustained contentment.",
    天机: "With Tian Ji here, adaptability, curiosity, and an open mind shape your sense of well-being. You may find joy in learning, exploring new ideas, and evolving your personal philosophy over time. This is a period to seek out enriching experiences that expand both mind and spirit. Consistent reflection will help you integrate these insights into lasting happiness.",
    太阴: "Tai Yin in the Fortune Palace brings emotional depth, sensitivity, and a strong connection to inner peace. You may find fulfillment in moments of quiet reflection, creative expression, or nurturing connections. This is a favorable time to cultivate self-care practices that honor your emotional needs. Listening to your intuition will guide you toward a balanced and serene life.",
    廉贞: "Lian Zhen here emphasizes integrity, discipline, and principled living as the foundation for happiness. You may feel most at peace when your actions align closely with your moral compass. This is a time to reaffirm your values and ensure your lifestyle reflects them. Balance firmness with compassion to maintain both inner harmony and healthy relationships.",
    七杀: "With Qi Sha in the Fortune Palace, boldness, decisiveness, and resilience play a role in shaping your happiness. You may feel most alive when overcoming challenges or pursuing meaningful goals with determination. This is a favorable period to focus on what truly matters to you, even if it requires courage to change direction. Purpose-driven action will bring lasting satisfaction.",
    破军: "Po Jun here suggests transformation and renewal as pathways to fulfillment. You may go through shifts in values, lifestyle, or spiritual outlook that reshape your sense of peace. This is a time to release outdated beliefs and embrace new perspectives. Openness to change will lead to a more authentic and joyful way of living.",
    贪狼: "Tan Lang in the Fortune Palace adds vibrancy, adaptability, and a taste for life’s pleasures to your sense of happiness. You may find joy in diverse experiences, creativity, and social interaction. This is a favorable time to embrace variety while staying mindful of what truly nourishes you. Balancing enjoyment with deeper meaning will keep fulfillment steady.",
    巨门: "Ju Men here highlights the role of communication, exploration, and understanding in your emotional well-being. You may enjoy discussing ideas, reflecting on experiences, and seeking truth as a way of deepening inner peace. This is a time to use dialogue to resolve uncertainties and strengthen your outlook. Clarity in thought and speech will bring emotional stability.",
    天同: "With Tian Tong in the Fortune Palace, harmony, relaxation, and shared joy are central to your happiness. You may find fulfillment in simple pleasures and in maintaining a peaceful atmosphere. This is a favorable period to focus on balance, avoiding overcommitment and stress. Emotional ease will allow your joy to grow naturally.",
    天梁: "Tian Liang’s presence here emphasizes wisdom, guidance, and protection as sources of contentment. You may find happiness in helping others or acting as a mentor. This is a time to cultivate patience and a long-term perspective on life. By combining generosity with thoughtful self-care, you ensure your own well-being is preserved.",
    文昌: "Wen Chang here enriches your inner life through learning, reflection, and articulate self-expression. You may feel fulfilled by intellectual growth and by sharing your insights with others. This is a favorable time to engage in study, journaling, or meaningful dialogue. Integrating knowledge with emotional awareness will bring a deeper sense of peace.",
    文曲: "With Wen Qu in the Fortune Palace, creativity, beauty, and emotional connection shape your sense of joy. You may be drawn to artistic pursuits or relationships that allow for deep emotional sharing. This is a period to celebrate inspiration and to channel it into meaningful forms. Artistic expression can be a powerful source of lasting happiness.",
    左辅: "Zuo Fu’s presence here brings supportive influences and trustworthy allies into your personal happiness. You may find joy in collaborative efforts or in knowing you have dependable people around you. This is a favorable time to nurture these relationships and offer support in return. Mutual care will keep your sense of contentment strong.",
    右弼: "You Bi here fosters kindness, cooperation, and mutual encouragement as cornerstones of your happiness. You may be drawn to friendships and communities that inspire and uplift you. This is a time to invest in relationships that bring joy to all involved. Acts of encouragement will deepen the bonds that contribute to your well-being.",
  },
  父母: {
    紫微: "With Zi Wei in the Parents Palace, your relationship with parental figures is influenced by respect, dignity, and a desire for mutual understanding. You may see your parents as guiding authorities whose example shapes your path. This is a favorable time for building trust and open dialogue with them. Leading with empathy and patience will help bridge any generational differences.",
    天府: "Tian Fu here brings stability, loyalty, and a focus on creating a harmonious connection with your parents. You may appreciate their role as providers of both security and values. This is a period for honoring family traditions while also fostering emotional warmth. Consistent effort to show appreciation will deepen the bond.",
    武曲: "With Wu Qu in the Parents Palace, responsibility, discipline, and mutual respect define your connection with parental figures. You may feel a strong duty to support them or uphold their values. This is a favorable time to demonstrate reliability and care. Balancing duty with moments of affection will keep the relationship healthy.",
    天相: "Tian Xiang’s presence here fosters diplomacy, fairness, and harmony in your relationship with parents. You may be the bridge that keeps communication flowing smoothly between different family members. This is a period for resolving misunderstandings and reinforcing trust. A cooperative spirit will ensure long-term stability in the bond.",
    太阳: "The Sun’s energy in the Parents Palace brings vitality, openness, and a desire for active involvement in family life. You may take initiative in supporting or engaging with your parents. This is a favorable time for creating shared experiences that strengthen your connection. Balancing enthusiasm with listening will deepen mutual understanding.",
    天机: "With Tian Ji here, adaptability, curiosity, and thoughtful communication shape your relationship with parents. You may enjoy learning from their experiences while offering them new perspectives. This is a time to exchange ideas and explore ways to support each other’s growth. Open-mindedness will help the relationship evolve positively.",
    太阴: "Tai Yin in the Parents Palace brings a nurturing, empathetic, and emotionally supportive dynamic. You may feel a strong desire to care for your parents and ensure their comfort. This is a favorable time for creating an atmosphere of trust and emotional safety. Quiet acts of love will strengthen the family bond.",
    廉贞: "Lian Zhen here emphasizes integrity, discipline, and mutual respect in your relationship with parents. You may find that upholding family values is central to your connection. This is a time to reaffirm shared principles while also allowing space for individual perspectives. Balancing firmness with understanding will ensure lasting harmony.",
    七杀: "With Qi Sha in the Parents Palace, your relationship with parents may involve shared challenges or transformative experiences. You may admire their courage and determination, or you may need to work through strong differences together. This is a favorable time to channel intensity into productive conversations. Mutual respect will be the foundation for progress.",
    破军: "Po Jun here can indicate significant changes or reinvention in your relationship with parents. This may involve shifts in family roles, living arrangements, or emotional dynamics. This is a time to embrace flexibility and adapt to new realities. Openness to change will help the bond grow in strength and authenticity.",
    贪狼: "Tan Lang in the Parents Palace adds warmth, charm, and adaptability to your family connection. You may enjoy sharing lighthearted moments, creative pursuits, or social experiences with your parents. This is a favorable time to explore new ways of connecting beyond traditional roles. Balance fun with respect to maintain trust.",
    巨门: "Ju Men here highlights the importance of honest, clear communication with parents. You may find that meaningful conversations can resolve long-standing misunderstandings. This is a time to practice both speaking openly and listening deeply. Building clarity will strengthen the relationship’s foundation.",
    天同: "With Tian Tong here, your relationship with parents is likely to be harmonious, warm, and mutually supportive. You may enjoy spending relaxed time together, fostering emotional closeness. This is a favorable period to maintain a peaceful family atmosphere. Gentle encouragement will help deepen trust and connection.",
    天梁: "Tian Liang’s presence in the Parents Palace emphasizes protection, guidance, and mutual respect. You may see your parents as mentors, or you may take on a guiding role for them in certain areas. This is a time to strengthen trust through consistent support. Compassion will keep the relationship steady during life’s changes.",
    文昌: "Wen Chang here brings thoughtful communication, shared learning, and mutual respect into your relationship with parents. You may find joy in exchanging knowledge and engaging in meaningful discussions. This is a favorable time to resolve differences with logic and diplomacy. Clear expression will help create lasting understanding.",
    文曲: "With Wen Qu in the Parents Palace, creativity, emotional expression, and appreciation for beauty may be part of your family dynamic. You may bond with your parents through artistic or cultural experiences. This is a time to celebrate shared inspiration and emotional connection. Creative collaboration can bring you closer together.",
    左辅: "Zuo Fu’s presence here suggests a supportive and dependable relationship with your parents. You may both offer and receive help freely, strengthening mutual trust. This is a favorable time to build shared goals or projects. Loyalty and reliability will ensure the bond remains solid.",
    右弼: "You Bi here fosters kindness, empathy, and encouragement between you and your parents. You may find that emotional reassurance flows naturally in both directions. This is a time to express appreciation openly and strengthen mutual respect. Acts of support will reinforce the relationship for years to come.",
  },
  交友: {
    紫微: "With Zi Wei in the Friends Palace, your social network is characterized by leadership, influence, and the ability to inspire trust. You may naturally attract people who admire your vision and look to you for guidance. This is a favorable time to form alliances with like-minded individuals who share your long-term goals. By leading with integrity and empathy, you create friendships that are mutually empowering and enduring.",
    天府: "Tian Fu’s presence here fosters loyalty, stability, and mutual care in your friendships. You may prefer a smaller but dependable circle of companions who share your values. This is a time to invest in long-term relationships that offer both emotional support and practical assistance. Patience and consistency will deepen these bonds.",
    武曲: "With Wu Qu in the Friends Palace, reliability, discipline, and mutual respect form the foundation of your social connections. You may attract friends who are hardworking and goal-oriented, much like yourself. This is a period to collaborate on practical projects that strengthen trust. Balancing seriousness with shared enjoyment will make your friendships more rewarding.",
    天相: "Tian Xiang here brings diplomacy, fairness, and harmony to your social interactions. You may excel at creating balance within your friend groups, ensuring that everyone feels valued. This is a favorable time for networking and building bridges between different circles. Your tact and understanding will leave a lasting positive impression.",
    太阳: "The Sun’s energy in the Friends Palace lights up your social life with enthusiasm, generosity, and active engagement. You may take the initiative in organizing gatherings or collaborative ventures. This is a time to expand your network and inspire others with your optimism. Just be mindful to balance your giving nature with time for self-care.",
    天机: "With Tian Ji here, curiosity, adaptability, and meaningful conversations are the heart of your friendships. You may be drawn to people who challenge you intellectually and broaden your perspectives. This is a favorable period for exploring joint projects or learning experiences together. Your openness to new ideas will make your social connections richer and more dynamic.",
    太阴: "Tai Yin’s influence here adds emotional depth, sensitivity, and empathy to your friendships. You may naturally become the confidant or trusted supporter within your circle. This is a time to nurture these bonds through understanding and care. Protecting the trust you’ve built will keep your relationships warm and enduring.",
    廉贞: "Lian Zhen here emphasizes principled connections based on mutual respect and shared values. You may gravitate toward friends who inspire you to maintain high standards in both personal and professional life. This is a favorable time to strengthen trust through honesty and reliability. Balancing conviction with open-mindedness will help these relationships grow.",
    七杀: "With Qi Sha in the Friends Palace, bold, dynamic, and action-oriented people may become part of your circle. You may share adventures, challenges, and ambitious pursuits that strengthen your bonds. This is a period to embrace friends who inspire courage and determination. Supporting each other through change will make these connections more meaningful.",
    破军: "Po Jun here suggests that your social life may undergo significant transformation, possibly bringing new friends into your life while old connections fade. These changes can lead to a more authentic and supportive network. This is a time to welcome fresh energy into your circle while letting go of relationships that no longer serve you.",
    贪狼: "Tan Lang’s presence adds charm, adaptability, and playfulness to your friendships. You may be drawn to social events, creative collaborations, or lively discussions that keep your circle vibrant. This is a favorable time for meeting new people and expanding your network. Staying mindful of balance will ensure these connections remain mutually enriching.",
    巨门: "Ju Men here highlights the importance of communication and understanding within your social life. You may enjoy deep discussions and intellectual debates with friends, but clarity is essential to avoid misunderstandings. This is a time to listen as much as you speak. Open, honest dialogue will strengthen trust in your relationships.",
    天同: "With Tian Tong here, harmony, warmth, and shared enjoyment define your friendships. You may prefer spending time with people who bring peace and positivity into your life. This is a favorable time to build connections through shared leisure activities. Gentle encouragement will help your friendships grow naturally and joyfully.",
    天梁: "Tian Liang in the Friends Palace emphasizes mentorship, guidance, and protective energy within your circle. You may find yourself offering advice or acting as a stabilizing force for friends in need. This is a period to strengthen trust through consistent support. Allowing space for mutual growth will make these bonds more resilient.",
    文昌: "Wen Chang’s influence here brings intellectual stimulation and cooperative learning into your friendships. You may enjoy exchanging ideas, working on educational projects, or simply engaging in thoughtful discussions. This is a favorable time to develop connections that are mentally engaging. Clear communication will make these friendships both enriching and lasting.",
    文曲: "With Wen Qu in the Friends Palace, creativity, artistry, and emotional resonance enhance your social life. You may be drawn to friends who share your appreciation for beauty and self-expression. This is a time for collaborative creative projects or cultural experiences. Shared inspiration will deepen emotional bonds.",
    左辅: "Zuo Fu here adds reliability, trust, and mutual support to your friendships. You may feel secure knowing that your friends are there for you in both good and challenging times. This is a favorable period to build partnerships based on shared responsibility. Acts of loyalty will strengthen these ties.",
    右弼: "You Bi’s presence in the Friends Palace fosters kindness, cooperation, and emotional warmth in your social connections. You may find that encouragement and support flow easily within your circle. This is a time to celebrate these bonds and to express appreciation openly. Gratitude will ensure these friendships remain strong and fulfilling.",
  },
};
