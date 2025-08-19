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
  财帛: "During this phase, attention is drawn to your relationship with resources, stability, and prosperity. The Wealth Palace represents your ability to create, manage, and sustain material abundance, reflecting both practical skills and your underlying attitudes toward money and value.\n\nYou may encounter opportunities to strengthen your financial position or explore new avenues for income. This is a favorable time to reassess spending habits, investments, and long-term goals, ensuring they align with your desired lifestyle. By cultivating a balanced approach to wealth   one that blends ambition with gratitude   you set the stage for lasting security and the freedom to pursue what matters most.",
  疾厄: "This period brings your well-being, vitality, and resilience into focus. The Health Palace reveals how you care for your body, mind, and spirit, as well as the patterns that influence your overall state of health. It emphasizes the importance of balance, self-awareness, and proactive care.\n\nYou may feel called to make adjustments to your routines, diet, or mindset to better support long-term wellness. Challenges may also arise that encourage you to develop greater discipline and awareness of your limits. By listening to your body and prioritizing self-care, you cultivate the energy and strength needed to embrace all other areas of life with clarity and confidence.",
  迁移: "The focus shifts to change, exploration, and expansion. The Travel Palace reflects your experiences beyond familiar territory   both literal journeys and figurative steps into new environments, communities, or perspectives. It represents adaptability, courage, and your openness to new possibilities.\n\nThis period may present chances to relocate, travel, or immerse yourself in unfamiliar settings that broaden your understanding of the world. You are encouraged to embrace flexibility and see change as a path to growth. Whether these movements are physical or internal, they hold the potential to reshape your life in meaningful and inspiring ways.",
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
  命宫: "You are in a timing window where the spotlight rests on your Life Palace (命宫), inviting you to focus on personal growth, self-definition, and the choices that shape your future. Whether you have just stepped into this cycle or have been walking it for years, the essence remains the same: strengthen the alignment between who you are on the inside and how you show up in the world. This is the season to refine your routines, reinforce habits that empower you, and make decisions that speak to your deepest values. Every intentional step you take now becomes part of the story you carry forward.\n\nAs you approach the transition point around age ${max_age}, your attention will begin to naturally shift toward the emerging themes of ${next_palace}. What you integrate in this current cycle your self-awareness, your clarity of purpose, your ability to act with intention will become the foundation you stand on in the next chapter. Treat this period as an active workshop for your life, a time to practice the mindset and actions you want to master so that you move forward with confidence, focus, and a sense of readiness for what comes next.",
  兄弟: "You are in a timing window where the focus rests on your Siblings and Close Friends Palace (兄弟), highlighting relationships built on trust, loyalty, and mutual growth. Whether you are early in this cycle or deep into it, the central invitation is to strengthen communication, set healthy boundaries, and nurture bonds that feel like family. This is a period to co-create with others, share resources, and show up consistently for those who matter. Every investment in these connections now reinforces the support network that will carry you forward.\n\nAs you approach the transition point around age ${max_age}, your attention will begin to naturally shift toward the themes of ${next_palace}. The relationships you’ve tended in this cycle will influence not just your personal life, but also your confidence in taking on future challenges. Treat this as a chance to build a circle that is not only loyal, but aligned with your vision for the next chapter.",
  夫妻: "You are in a timing window where the spotlight is on your Spouse and Partnership Palace (夫妻), encouraging you to focus on meaningful connections and mutual growth. Whether just beginning this cycle or approaching its end, the themes remain steady: cultivating trust, deepening emotional bonds, and aligning life directions with a partner or potential partner. This is a time to invest in both understanding and being understood, allowing relationships to become a source of strength.\n\nAs you near the transition point around age ${max_age}, your attention will gradually turn toward the emerging themes of ${next_palace}. The quality of connection and mutual respect you build now will set the tone for the next phase. Use this period to strengthen the foundation so that, when the shift arrives, you carry forward relationships that are healthy, supportive, and aligned with your evolving path.",
  子女: "You are in a timing window where the emphasis is on your Children and Legacy Palace (子女), highlighting the joy of nurturing, guiding, and seeing growth in others. This can refer to actual children, mentees, or passion projects that you treat as your own. Whether early in this cycle or approaching its close, your role is to offer structure, encouragement, and consistent presence. The more you pour into guidance now, the stronger the impact you leave behind.\n\nAs you move toward the transition point around age ${max_age}, your attention will begin to shift toward the themes of ${next_palace}. The foundations you lay in this period whether through teaching, protecting, or creatively contributing will carry lasting influence. Treat this as a season for planting seeds that will continue to grow well into your next chapter.",
  财帛: "You are in a timing window where the focus rests on your Wealth and Resources Palace (财帛), placing attention on financial stability, value creation, and the systems that sustain abundance. Whether this is the first year or the final phase of the cycle, the themes are clear: strengthen your income streams, manage resources wisely, and make intentional investments. Each deliberate step now builds both security and flexibility for the future.\n\nAs you approach the transition around age ${max_age}, your focus will begin to shift toward the emerging themes of ${next_palace}. The financial habits and strategic moves you establish in this cycle will shape your capacity to embrace the next phase with confidence. Treat this time as an opportunity to create a strong and adaptable foundation for long-term prosperity.",
  疾厄: "You are in a timing window where the emphasis is on your Health and Wellness Palace (疾厄), encouraging you to prioritize vitality, balance, and sustainable well-being. Whether early in this cycle or approaching its end, the consistent call is to integrate healthy routines into your daily life. Pay attention to rest, movement, nutrition, and emotional resilience, turning care for your body and mind into a lasting habit.\n\nAs you near the transition point around age ${max_age}, your attention will gradually turn toward the themes of ${next_palace}. The health choices you make now both preventative and restorative will directly influence your capacity to handle future opportunities and challenges. Treat this period as a chance to strengthen your foundation so you can step into the next chapter with energy and clarity.",
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
   Placeholder export   I'll append the full object in follow-ups.
---------------------------- */
export const STAR_MEANINGS_BY_PALACE: StarMeaningsByPalace = {
  // To keep this message within size limits, I’ll paste each palace block
  // (e.g., "命宫": { ...18 stars }, "兄弟": { ... }, etc.)
  // in the next messages so you can drop them right here.

  
  命宫: {
    紫微: `With Zi Wei in the Life Palace, you carry calm authority and a steady center. People naturally look to you when the room needs direction, because you hold your ground without shouting. Lead with vision and warmth, not weight on your shoulders. The gentle watch-out: you don’t have to do it all yourself. Try this week: write a 3-line vision, delegate one clear step to a trusted partner, and set a 15-minute Friday check-in to review progress.`,
    天府: `With Tian Fu here, your base setting is stability and patient growth. You build wealth like laying bricks, quiet, steady, reliable, so others feel safe around you. You’re great at keeping systems running even when life gets noisy. Just watch that “too safe” doesn’t become “stuck.” Try: set an automatic transfer after each payday, and once a month run a small RM100 experiment on something with upside so you don’t miss easy wins.`,
    武曲: `Wu Qu in the Life Palace gives you grit, precision, and a pioneer’s courage. You like clean numbers, real skills, and results you can measure. When others hesitate, you’re willing to take the shot, disciplined, brave, focused. The watch-out is rigidity; perfection can slow momentum. Try: block 45 minutes of deep work daily, end with one small ship, and hold a 10-minute weekly numbers review to adjust quickly.`,
    天相: `With Tian Xiang here, you’re the diplomat, fair, calm, and balanced under pressure. You see both sides and bring people back to the middle when things get heated. That earns trust and often a quiet kind of power. The watch-out is people-pleasing and delayed decisions. Try: write a simple boundary sentence you can reuse (one line), say one clean “no” this week, and set a decision deadline so conversations don’t loop forever.`,
    太阳: `Sun energy in the Life Palace makes you generous, passionate, and visible. You brighten rooms and lift morale, and people follow your enthusiasm. You lead best by example, showing up, taking initiative, adding warmth. The watch-out is over-giving and burnout. Try: book one full rest block on your calendar, take a 10-minute sunlight walk daily, and hand off one task you’ve been carrying alone.`,
    天机: `With Tian Ji here, your mind moves fast, you map patterns, spot levers, and design smart paths. Strategy is your playground, and you’re great at improving things in motion. When energy scatters, it’s usually from overthinking or chasing too many ideas. Keep it simple. Try: pick one idea, write a one-page plan by Friday, and run a 25-minute test session to get real data before you tweak again.`,
    太阴: `Tai Yin gives you a soft, steady power, caring, intuitive, and quietly consistent. You notice what others miss, especially around feelings, timing, and what makes a space feel safe. That makes people want to build with you long term. The watch-out is mood-based decisions and hidden resentment. Try: do a 10-minute nightly check-in (money, mood, next step) and set one small property/asset goal to review monthly.`,
    廉贞: `With Lian Zhen here, you’re principled, structured, and reliable with systems. You love a good SOP and you’re the one who turns chaos into a clean flow. That discipline builds trust and long-term wins. The watch-out is perfection that blocks progress. Try: write a simple 3-step SOP for your next task, ship a “good enough” version today, and schedule a tidy-up pass for next week instead of stalling now.`,
    七杀: `Qi Sha brings boldness, speed, and a taste for meaningful risk. You act when others freeze, and that creates breakthroughs. You’re sharp, direct, and strong under pressure. The watch-out is impulsive moves that cost more than they give. Try: cap any new test at RM200, write a 5-line pre-mortem (“what could go wrong?”), and only scale after one clean win.`,
    破军: `With Po Jun here, you’re the breaker and rebuilder. You don’t mind clearing what’s stale so something better can grow. That courage refreshes teams and resets stuck systems. The watch-out is burning bridges or changing so often you lose momentum. Try: sunset one dead project today, make a clean 3-item restart list, and commit to 14 days of focus before you pivot again.`,
    贪狼: `Tan Lang in the Life Palace makes you magnetic, expressive, and quick to connect. You sense trends early and you know how to make things feel desirable. That charm opens doors and opportunities. The watch-out is shiny-object spending or scattered focus. Try: use a 24-hour wish-list rule before buying or saying yes, and set a monthly “treat” cap so rewards stay joyful, not stressful.`,
    巨门: `With Ju Men here, your voice is your edge, clear, persuasive, and ready to ask the sharp question. You surface truth others avoid and steer conversations back to what matters. That saves time and money. The watch-out is words that cut when you’re rushed. Try: in your next tough chat, mirror what you heard in one sentence, then make one specific ask, and follow up in writing.`,
    天同: `Tian Tong gives you a friendly, peace-keeping core. You read rooms well and help people relax, which makes work smoother and life lighter. Your optimism helps teams try again. The watch-out is avoiding small problems until they grow. Try: pick one tiny nagging task and do 10 minutes today, then schedule a simple talk to clear the next smallest friction.`,
    天梁: `With Tian Liang here, you carry wise-protector energy. People trust your counsel because you think long term and hold a bigger view. You steady storms and keep the ship on course. The watch-out is carrying everyone’s load until you’re tired. Try: delegate one task this week, set “help hours” for advice, and keep one evening fully for yourself.`,
    文昌: `Wenchang in the Life Palace gives you a clear, organized mind. You plan well, write well, and make complex ideas easy to follow. That clarity turns effort into results. The watch-out is analysis paralysis. Try: draft a 5-bullet outline, start the first bullet right away, and time-box revisions to keep momentum.`,
    文曲: `With Wenqu here, you have taste, creativity, and emotional depth. You make things that feel good and look right, which draws people in. Your gift is expressing heart in a clean way. The watch-out is inspiration without structure. Try: refresh your portfolio this week and set a simple price/offer sheet so interest can turn into income.`,
    左辅: `Zuo Fu gives you trusted right-hand energy, you make leaders better and teams stronger. You spot gaps and quietly fix them. People rely on you because you deliver. The watch-out is staying invisible and limiting your growth. Try: ask to co-lead one small item this month and keep a one-page log of your wins to share at review time.`,
    右弼: `With You Bi here, you’re the encourager who lifts rooms and connects people. You bring warmth, follow-through, and a steady “we’ve got this” vibe. That glue is rare and valuable. The watch-out is over-promising or stretching your boundaries thin. Try: write your role and limits for the next collab, share it early, and confirm next steps in writing after meetings.`,
  },

  兄弟: {
    紫微: `With Zi Wei in the Siblings Palace, you become the quiet center of your circle, the one people check with before big moves. Your steadiness, manners, and calm authority set the tone without needing to push. This is a time to guide with clarity while keeping the door open for other voices. Lead by naming the direction and inviting collaboration, not by deciding for everyone. Gentle watch-out: carrying the whole plan alone breeds silent resentment. Try this week: start a one-page shared goal doc, ask each person for one input, then confirm who-does-what with simple dates; end the week with a 15-minute recap call.`,
    天府: `With Tian Fu here, you’re the dependable anchor of the group, the person who remembers birthdays, keeps promises, and brings calm when things wobble. People feel safe around your routines and practical support. This season favors patient, steady bonding over hype. The caution: comfort can drift into “same old,” and the group’s growth stalls. Try this month: host a low-key check-in dinner, propose one new activity outside your usual spots, and set a standing reminder to rotate roles so everyone contributes.`,
    武曲: `Wu Qu in the Siblings Palace makes you the doer and fixer, tools out, sleeves up, results on the board. When chats go in circles, you cut through with a plan, budget, and timeline. That reliability builds deep trust. Watch-out: being overly critical or doing it all yourself can shut people down. Try this week: offer one practical help and ask for one in return, write a simple checklist with owners and dates, and schedule a 10-minute review to adjust without blame.`,
    天相: `With Tian Xiang here, you’re the mediator who keeps things fair and clean. You hear everyone, frame decisions without drama, and protect the relationships when tensions rise. People relax because you hold balance well. The soft caution: avoiding hard calls drags issues out. Try: suggest three clear ground rules for decisions (vote method, tiebreak, deadline), use them on the next plan, and write the outcome in a shared note so nothing is fuzzy.`,
    太阳: `Sun energy makes you the spark plug, lifting mood, starting plans, and rallying the chat when it goes quiet. Your generosity and enthusiasm are contagious and can restart the group’s momentum fast. This period wants visible, simple leadership. The watch-out is staying in the spotlight too long and accidentally crowding others out. Try this week: give one public shout-out to a friend, rotate hosting/leading duties, and block one full rest evening so your energy stays bright.`,
    天机: `With Tian Ji here, you’re the idea engine, connecting dots, suggesting smarter routes, and keeping the group curious. You’re great at improving plans in motion. The caution: scattering focus with too many tweaks makes people tired. Try: run a 30-minute timed brainstorm, capture everything, then pick one owner and one next step before moving on; schedule a single follow-up to debrief what worked.`,
    太阴: `Tai Yin gives you soft power in the circle, the trusted listener who remembers small details and makes everyone feel seen. You hold the emotional weather steady, which keeps friendships warm. This is a time for gentle hosting and slow, meaningful catch-ups. Watch-out: absorbing everyone’s moods until you feel heavy. Try: suggest a 15-minute walk-and-talk for heavier chats, add one light activity afterward to reset, and keep one evening just for your own refill.`,
    廉贞: `With Lian Zhen here, you become the principle-keeper, structured, consistent, and thoughtful about what’s right for everyone. You protect fairness and bring order to messy plans. People trust your systems. The caution: rigidity can stall movement when a quick trial would teach more. Try: agree on a simple decision SOP (vote, tiebreak, deadline), allow one “try it and learn” exception each month, and review the lesson learned in two bullets.`,
    七杀: `Qi Sha turns you into the courage booster of the group. You propose the bold thing, move when others hesitate, and create stories people remember. That bravery is valuable, just aim it wisely. Watch-out: risky moves without checks can cost time and money. Try: apply a two-check rule (one person sanity-checks, one day cool-off), cap any first trial at RM200, and only scale after a clear win is logged.`,
    破军: `With Po Jun in the Siblings Palace, you’re the reset button when the crew is stuck. You say, “This isn’t working, let’s rebuild,” and people secretly feel relieved. Clearing stale plans makes room for something better. The caution: burning bridges or changing so often that momentum never forms. Try: pause 24 hours before sending tough messages, propose a clean restart plan with three steps, and commit to 14 days of steady focus before you pivot again.`,
    贪狼: `Tan Lang makes you the connector, curating people, places, and fun ideas that keep the group lively. You sense trends early and know how to make an outing or project feel exciting. Doors open because you’re magnetic. Watch-out: FOMO that overbooks your week or overspends your budget. Try: set a monthly outings budget, cap events per week, and keep a running “later” list so good ideas don’t pressure your present self.`,
    巨门: `With Ju Men here, your voice is the group’s truth-finder. You ask the sharp questions that keep plans honest and useful, and that saves time. People rely on your clarity when things get fuzzy. The caution: words can sting when you’re rushed or tired. Try: ask first, “Do you want ideas or empathy?” mirror what you heard in one sentence, then make one specific ask; follow up in writing so everyone’s aligned.`,
    天同: `Tian Tong makes you the mood-lighter, bringing play, snacks, and easygoing energy that smooths bumps and keeps people close. Harmony matters to you, and that’s a gift. The watch-out is dodging conflict until it grows roots. Try: park tensions in a shared note, propose a time to revisit, and plan one tiny repair action together (a check-in, an apology, or a clear next step).`,
    天梁: `With Tian Liang here, you feel like the big brother/sister even if you aren’t. You protect, advise, and think long term for the whole group, and people feel safe leaning on you. Your counsel is calm and steady. The gentle caution: over-parenting keeps others small and exhausts you. Try: offer support, then ask, “What do you need from me?” delegate one task this week, and ring-fence one evening purely for yourself.`,
    文昌: `Wenchang turns you into the organizer, clean schedules, clear messages, simple checklists that move things forward. You make complex plans easy to follow. The caution: nitpicking can slow momentum and annoy the crew. Try: share a short checklist, let teammates own their parts without hovering, and do a 10-minute post-event review with just three bullets: keep, change, try.`,
    文曲: `With Wenqu here, you add taste and heart to everything, music, design, and small touches that make memories. People remember the moments you craft because they feel considered. The caution: vague feedback can create drama when taste differs. Try: use the “keep / change / try” method in reviews, bring one reference example, and end with a clear decision so feelings stay kind and direction stays clear.`,
    左辅: `Zuo Fu makes you the loyal wingman who helps others shine. You step in quietly, spot gaps, and make the plan work. Leaders rely on you because you deliver. The caution: staying invisible limits your growth and pay-off. Try: ask to co-lead one small item this month, keep a one-page log of your contributions, and share a monthly recap so credit lands where it should.`,
    右弼: `With You Bi here, you’re the encourager and glue, connecting people, tracking next steps, and keeping momentum warm. Your follow-through lifts the whole group. The caution: over-promising or stretching your boundaries thin. Try: write your role and limits for the next collab, share it early, and confirm next steps in writing right after meet-ups so expectations stay clean.`,
  },

  夫妻: {
    紫微: `With Zi Wei in the Spouse/Partners Palace, you bring calm authority and a steady compass to the relationship. People feel safer when you set direction with kindness, not control. Lead by vision and example and make space for your partner’s voice; deciding alone can feel efficient but it slowly erodes trust. Create a shared rhythm, meet for a weekly 20-minute “us” check-in (wins, worries, one next step), alternate who leads the month’s plans, and put a simple three-line vision you both agree on where you can see it.`,
    天府: `Tian Fu here gives you loyalty, patience, and a home-builder heart. You keep the relationship stable through routines, care, and practical support, and security grows under your watch. Comfort is wonderful, yet autopilot can dim romance, so sprinkle in small novelty: set a monthly “budget + dates” night (30 minutes numbers, 60 minutes fun), choose one new café or route each week, and trade a three-item appreciation note every Sunday before bed.`,
    武曲: `Wu Qu brings precision and reliability; you show love through actions, fixing, planning, and caring about the details that matter. Results speak for you, though blunt words or a transactional tone can land colder than you intend. Let the care be visible: pair each hard truth with one line of warmth, keep a quick 10-minute weekly money sync, and take five slow breaths before debates so your steadiness leads the moment.`,
    天相: `With Tian Xiang, you’re the diplomat partner, fair, composed, and good at finding middle ground. You protect the bond by keeping talks calm, but delaying decisions to keep the peace can store quiet stress. Make decisions light and timely: set a house rule of three options max, a clear deadline (e.g., Friday), and a values-based tie-break; practice one clean boundary sentence and note the final choice in a shared doc so both feel heard.`,
    太阳: `Tai Yang makes you warm, generous, and visible in love. You lift moods and rally plans, and your partner feels seen around you. Hero mode is tempting, over-giving, over-doing, then burning out, so share the load: divide recurring chores fairly, block one full rest day just for you, and ask for one specific support each week instead of carrying everything quietly.`,
    天机: `Tian Ji adds a smart, curious mind to the relationship. You map paths, spot levers, and love improving systems for two. It’s easy to overthink or keep tweaking until joy stalls; narrow the field, decide, and play: pick one shared goal and draft a one-page plan, cap research to three choices, decide within 24 hours, and run a 25-minute experiment this week to gather real data.`,
    太阴: `Tai Yin brings tenderness, intuition, and deep care. You create a safe, cozy world for two and think long term, especially around home and assets. When feelings stay unspoken, resentment grows in the quiet, so make it easy to be honest: end the day with a 10-minute check-in (I feel / I need / one next step), choose a small asset or property target together, and sit down monthly to review mood and money side by side.`,
    廉贞: `Lian Zhen gives principle and structure. You like clear agreements and habits that make life smoother, and that reliability earns trust. Rules that are too tight stop real life from breathing; co-create a gentle house SOP (chores, money, screens), add a playful “spontaneous fun” clause, and review it quarterly so the system stays kind instead of rigid.`,
    七杀: `Qi Sha brings courage and momentum. You take bold steps together and you don’t fear real conversations, which makes growth fast. Heat of the moment choices can sting, so build safety into the speed: pause 24 hours before big buys or heavy talks, cap first-round experiments at RM200, and agree on a time-out word that lets both of you reset before finishing the discussion.`,
    破军: `Po Jun resets what’s stale so the relationship can breathe. You’re good at clearing clutter, habits, plans, even rooms, so something better can begin. Constant rebuilds, though, exhaust the bond; choose one tired routine to retire this week, commit to 14 days of steadiness on the new plan, and seal agreements with a small re-commitment ritual like a walk, a shared note, or a simple meal.`,
    贪狼: `Tan Lang adds magnetism, play, and desire. You make life feel lush and exciting and you’re great at social plans as a duo. The same appetite can trigger FOMO, jealousy spirals, or lifestyle overspend; keep it joyful by setting a monthly date budget, using a “wish now, decide tomorrow” list, and agreeing on social-media boundaries that protect both of you.`,
    巨门: `Ju Men sharpens the voice in your relationship. You ask good questions and bring hidden topics to the surface so trust grows. Tired moments can turn sharp, so slow the pace: begin hard talks by mirroring in one sentence (“Here’s what I heard…”), make one specific ask, and follow with a short written summary so no one leaves guessing.`,
    天同: `Tian Tong brings playfulness, peace-keeping, and simple joy. You lighten heavy days and keep the bond friendly. Avoiding hard topics keeps the vibe smooth today but costs you later; book one gentle hard talk every two weeks (15 minutes with a timer), end with a small “we” action, and plan a tiny play date after to reset the mood.`,
    天梁: `Tian Liang gives protector energy. You think long term, hold the bigger picture, and your advice calms storms. When help turns into over-parenting, both of you shrink; ask what support is actually wanted, delegate a task back with trust, and keep one evening each week purely for your own refill so guidance stays clean.`,
    文昌: `Wenchang brings clear thinking and tidy documentation. You make plans readable and fair, which reduces friction. Perfectionistic edits can turn romance into a project; keep one simple shared doc for goals, chores, and money, limit revisions to a single pass, and trade one daily appreciation for every critique so warmth stays louder than fixes.`,
    文曲: `Wenqu adds taste, creativity, and emotional expression. You craft moments that feel beautiful and honest. Ideas float unless anchored; build a shared moodboard for trips or home, convert it into a checklist with prices, and use a simple “keep / change / try” frame during feedback so feelings stay clear while momentum stays kind.`,
    左辅: `Zuo Fu brings trusted right-hand energy. You make your partner’s life easier by noticing gaps and stepping in. Staying too invisible breeds quiet frustration; rotate leadership on shared goals, keep a “quick wins” log for the month, and ask for recognition or a tiny reward ritual when major items land.`,
    右弼: `You Bi encourages, connects, and keeps momentum warm. You’re the glue and the follow-through. Saying yes beyond your limits stretches trust; confirm next steps in writing after talks, state your boundary in one sentence, and keep a weekly 30-minute admin date to clear pending items together.`,
  },

  子女: {
    紫微: `With Zi Wei in the Children/Creativity Palace, you guide with calm authority. Kids, mentees, or creative projects respond to your steady leadership, and you set a clear tone that builds confidence. Over-directing, though, can dim curiosity; co-write simple house or class rules, offer one real choice within your structure, and host a weekly “show and tell” so effort gets seen.`,
    天府: `Tian Fu offers patience and dependable care. You create stable routines and a safe base where children or ideas can grow. Routines that never change make curiosity shrink; keep the base steady but add one new learning outing each month, set a tiny weekly savings for books or classes, and run a three-item gratitude round at dinner.`,
    武曲: `Wu Qu brings discipline and skill-building. You teach by doing and you value craft, so progress is visible. Strict standards can make play feel like work; set a 20-minute daily practice with a fun timer, praise effort before result, and end sessions with a small game or freestyle to keep joy in the room.`,
    天相: `Tian Xiang makes you fair and composed as a mentor or parent. You hear different views and keep the room balanced. Too much analysis delays action; agree on three clear rules with simple consequences, decide within a set time, and review what worked each week in two short lines.`,
    太阳: `Tai Yang brings warmth, pride, and visibility to kids or creations. You cheer loud and lead by example. Center-stage energy can overshadow the child or project’s own voice; add a weekly spotlight where they teach you something, schedule your own rest so praise stays fresh, and let them choose one activity entirely.`,
    天机: `Tian Ji adds curiosity and strategy. You love explaining the “why” and designing smarter paths for learning. Changing methods too often or over-optimizing scatters focus; pick one method for 14 days, cap resources to three, and keep a one-page progress board with stickers or simple metrics.`,
    太阴: `Tai Yin brings tenderness and emotional safety. You sense moods and respond gently, which builds trust. Absorbing every feeling leaves you drained; create a nightly 10-minute feelings check (happy / hard / help), set up a calm-down corner with soft things, and add one small asset-building habit for the child or project like a jar savings or a printed mini-portfolio.`,
    廉贞: `Lian Zhen gives structure and values. You set clear boundaries and model consistency. Rules without room for individuality backfire; co-create a simple SOP for study, play, and screens, include a flex-day token, and review the SOP monthly with one improvement.`,
    七杀: `Qi Sha brings boldness and fast learning by trying. You encourage courage and real-world practice. Risky stunts and frustration from slow results are normal; start with safety rules, cap experiment budget and time, and finish with a quick “what did we learn?” debrief so failures become fuel.`,
    破军: `Po Jun helps break stuck patterns so growth returns. You’re good at clearing cluttered schedules or habits to make space for better ones. Changing too much, too fast scrambles stability; retire one low-value class or toy, introduce one high-value routine, and hold it for 14 days before touching anything else.`,
    贪狼: `Tan Lang adds charm, expression, and appetite for life. You nurture social skills and style in kids or projects. Over-treating, over-booking, or comparison steals joy; set a treats or events budget, use a 24-hour wish-list, and plan one “create, don’t consume” session weekly, draw, build, record.`,
    巨门: `Ju Men sharpens language and critical thinking. You ask good questions that make ideas stronger. Sarcasm or rapid-fire critiques can discourage; use a “two stars and a wish” frame, mirror what you heard first, then give one specific suggestion, and keep debates to a 10-minute timer.`,
    天同: `Tian Tong brings play and harmony. You make learning light and relationships kind. Skipping boundaries to keep the vibe nice doesn’t hold; set playful limits with timers or tokens, schedule one “serious talk, gentle tone” slot each week, and close with a small fun activity to reconnect.`,
    天梁: `Tian Liang gives wise, protective guidance. You think about the long run and model integrity. Over-protecting blocks healthy challenge; name the principle, let them try, debrief calmly, and set a stretch goal with support so confidence grows.`,
    文昌: `Wenchang organizes learning well. You create clear plans, notes, and practice loops that build skill. Perfectionism kills joy; keep a simple tracker, limit revisions to one pass, and celebrate completion with a tiny reward ritual that marks progress, not perfection.`,
    文曲: `Wenqu nourishes creativity and taste. You help them find a voice and make work that feels like them. Drifting without finishing leaves talent unseen; pick one small project per month, set three milestones, and host a mini home “exhibition” when it’s done.`,
    左辅: `Zuo Fu supports quietly and reliably. You’re the helper who makes growth possible behind the scenes. Over-helping blocks independence; step back one notch, let them pack, present, or publish, keep a contributions log, and give credit publicly for their efforts.`,
    右弼: `You Bi encourages and connects. You open doors to mentors and communities and keep spirits high. Too many yeses crowd the week; choose one community to go deep with for a season, confirm commitments in writing, and leave one free day for rest and unstructured play.`,
  },
  财帛: {
    紫微: `With Zi Wei in the Wealth Palace, you lead your money with calm authority and a clear north star. People trust your sense of direction; but do be careful with ego purchases that look like leadership yet drain cash. Set the tone simply, write a three-line money vision, automate payday transfers, and delegate what you can’t track well so energy stays on high-value moves.`,
    天府: `Tian Fu builds steady, lasting wealth, you’re patient, practical, and good at keeping what you earn. Safety is your edge, though playing too safe leaves returns on the table. Keep the base secure with automation, then open a small “learn and earn” bucket, run RM100–RM200 trials monthly and review them alongside your savings so growth stays gentle and real.`,
    武曲: `Wu Qu favors precision and skill income; you like numbers that add up and work that pays for mastery. Discipline is powerful, yet rigidity can make money feel heavy. Keep the edge without the grind, block a daily 45-minute skill session, do a 10-minute weekly numbers check, and split inflows 70/20/10 (needs/invest/fun) so progress and joy move together.`,
    天相: `With Tian Xiang here, you’re fair with partners and balanced in deals; people come to you to price things right. Harmony matters, but circling choices to avoid friction delays wins. Decide lightly, compare only three options, write your top three criteria, and lock the choice by Friday so cash can start moving instead of waiting.`,
    太阳: `Tai Yang makes you generous and visible, you draw opportunities by showing up. Giving is a gift, though picking up every bill or project can quietly drain reserves. Keep your light bright, set a monthly giving cap, separate a small “play” wallet, and protect one full rest day so you don’t spend to fix burnout.`,
    天机: `Tian Ji sees money like a system; you spot levers and design smarter flows. Research helps, but over-optimizing stalls income. Pick one lever and move, draft a one-page plan, cap research to three choices, decide within 24 hours, and run a 7-day experiment so results teach faster than tabs do.`,
    太阴: `Tai Yin brings steady saving and a feel for assets like home or property; you’re patient and thoughtful. Mood spending is the leak, especially late at night. Keep warmth and control, do a short nightly check-in, set sinking funds for big items, and tie one clear property target to a monthly review so feelings and numbers stay on the same page.`,
    廉贞: `Lian Zhen loves order, clear bills, clean ledgers, predictable flows, and that structure grows wealth. Perfection, though, delays simple wins. Make the system kind, write a one-page money SOP (payday sweep, bills calendar, 5% flex fund), automate the basics, and allow small “good enough” steps so momentum beats micromanagement.`,
    七杀: `Qi Sha brings bold moves and fast learning; you’re willing to take real shots for real upside. Speed helps, but impulsive bets tax the future. Keep risk noble, cap first positions at 1–2% or RM200, run a pre-commit checklist, and only scale after one clean win so courage compounds instead of costs.`,
    破军: `Po Jun resets money patterns when they’ve gone stale; you’re great at cutting losses and starting fresh. Constant resets, however, erase compounding. Clean once, then commit, cancel one low-value subscription today, choose three core accounts to focus on, and hold the plan for 14 days before changing anything else.`,
    贪狼: `Tan Lang attracts opportunities and enjoys the good life; you make money feel exciting. That same appetite invites lifestyle creep. Keep the sparkle, use a 24-hour wish list, set a treat budget that’s fun but finite, and pair every lifestyle upgrade with an investment top-up so taste grows with net worth, not against it.`,
    巨门: `Ju Men wins through voice, negotiation, pitching, content that converts, and you spot the question everyone else avoids. Sharp words can cost deals, so pace your truth. Lead with mirroring, then make one clean ask, and save a one-page offer you can send right after the call so momentum turns into money.`,
    天同: `Tian Tong keeps money light, you reduce drama and keep going, which saves fees and stress. Avoidance is the trap; small bills grow teeth when ignored. Keep it friendly and firm, do a weekly 10-minute money tidy, pay two tiny items on sight, and celebrate small completions so the system stays cheerful and moving.`,
    天梁: `Tian Liang protects the household; you think long term and guard against storms. Over-protecting, though, strands cash in low yield. Secure the base, then let some work, fill 3–6 months emergency first, route the next slice to low-risk instruments, and calendar a quarterly allocation chat so safety and growth travel together.`,
    文昌: `Wenchang organizes clearly; your budgets read well and your notes reduce mistakes. Over-building sheets can become a full-time hobby. Keep it elegant, use one tracker, one rule per category, and one review pass; then act, so clarity turns into cash flow.`,
    文曲: `Wenqu monetizes taste, brand, design, creative offers people actually want. Inspiration wanders without rails. Package it, refresh your portfolio, write one page of offers with prices, and book a monthly showcase slot so attention has a place to land and buy.`,
    左辅: `Zuo Fu prospers by supporting key players; you make others win and value returns in loyalty and referrals. Staying invisible caps your rate. Track and ask, keep a contributions log, request a testimonial or referral each month, and raise your floor price for new work so your support shows up on the invoice.`,
    右弼: `You Bi grows wealth through people, warm intros, follow-through, and being the person others trust. Too many promises split focus. Go deep, not wide, choose one high-ROI community, schedule weekly follow-ups, and log referrals so your network turns into a repeatable engine.`,
  },

  疾厄: {
    紫微: `With Zi Wei in the Health Palace, you lead by example, steady, composed, and clear about what matters. Control helps at the start, but perfection chokes progress. Pick three anchors (sleep window, daily steps, protein at meals), plan the week on Sunday, and let the rest be “good enough” so consistency beats intensity.`,
    天府: `Tian Fu favors stable routines and slow, dependable recovery; your body likes rhythm. Comfort can drift into stagnation. Keep the ritual and add sparks, stack habits to existing cues, try one new activity each month, and book basic labs annually so calm meets data.`,
    武曲: `Wu Qu brings discipline and strength, you thrive with structure and measurable gains. Pushing too hard invites nagging injuries. Train smart, do three strength sessions with a real warm-up, add one mobility block, and pencil a deload week every eight so progress doesn’t cost joints.`,
    天相: `Tian Xiang balances well, you weigh options, listen to your body, and avoid drama. Over-considering leads to no routine. Choose simple rules, two vegetables a day, two liters of water, and a set bedtime; plan the week in ten minutes and follow it even if it isn’t perfect.`,
    太阳: `Tai Yang runs hot, you bring energy and get others moving. Burnout is the tax. Catch light without the crash, get 10–15 minutes of morning sun, hold one no-training rest day, and set a caffeine cut-off so power arrives without the dip.`,
    天机: `Tian Ji has a fast mind; you love optimizing health like a system. Over-thinking steals sleep. Empty the head, do a nightly brain-dump, keep workouts to a single 25-minute focus block on busy days, and make the last two hours before bed tech-light so the brain can downshift.`,
    太阴: `Tai Yin is gentle and restorative; you self-soothe well and notice small signals early. Comfort eating or late scrolling can slide in. Keep the softness and add rails, build an evening wind-down, eat protein first at meals, and take a short walk after dinner to let emotions settle through the body.`,
    廉贞: `Lian Zhen loves protocol, checklists, sleep hygiene, consistent meals, and it works. Rigidity backfires when life bends. Aim for 80/20, keep your core SOP, allow one flex meal and one flex bedtime weekly, and return to baseline the next day without the guilt spiral.`,
    七杀: `Qi Sha likes intensity and learns fast under pressure; your grit is real. That edge risks overuse injuries. Put guardrails on the thrill, follow a warm-up checklist, cap sessions at an eight-out-of-ten effort unless testing, and budget time, not just hype, so recovery stays part of the plan.`,
    破军: `Po Jun is great at clearing what doesn’t work, diets, routines, beliefs, and starting cleaner. Constant resets erase gains. Keep one anchor through change, steps, water, or bedtime, and run 14-day trials before you judge, so improvements stack instead of restart.`,
    贪狼: `Tan Lang loves flavor and social life; food, drink, and nights out keep spirits high. Indulgence is fun until it steals tomorrow. Use tokens, choose your treats ahead, apply a 24-hour craving rule, and swap in fancier yet lighter options so pleasure stays and fog doesn’t.`,
    巨门: `Ju Men brings sharp self-talk and real honesty; you call things as they are. That voice can turn harsh. Change the script, mirror what you’re feeling in one line, ask what the body needs now, and keep a 10-minute journal so your mind argues for you, not against you.`,
    天同: `Tian Tong keeps health playful, you stick with what’s fun. Avoidance of hard things stalls growth. Make hard things friendlier, start with ten-minute blocks, add a buddy, and celebrate streaks so momentum survives busy weeks.`,
    天梁: `Tian Liang protects well; you think long term and avoid dumb risks. Being over-cautious limits healthy challenges. Book screenings on schedule, then train up slowly, add a little weight, a little pace, a little exposure, and let confidence build with proof.`,
    文昌: `Wenchang studies health well; you know what works in theory. Reading without doing changes nothing. Translate notes to action, write a three-bullet plan for the week, track the habit not the theory, and review once on Sunday before you adjust.`,
    文曲: `Wenqu enjoys the aesthetic of health, nice gear, pretty meals, well-designed apps. Chasing tools delays sweat. Keep it simple, one bottle, one pair of shoes, one plan; follow it for three sessions in a row before you tweak.`,
    左辅: `Zuo Fu cares for others so well that your own routine can slip. Being the helper shouldn’t cost your health. Block a non-negotiable hour with your name on it, ask for cover when needed, and keep a small grab-and-go kit so care for you is as easy as care for them.`,
    右弼: `You Bi thrives in groups, classes, teams, community runs, and social fuel keeps you going. Social drinking or late nights can creep in. Set gentle edges, choose non-alcohol options when training next day, state your “home by” time, and cap big nights at two a week so recovery still happens.`,
  },

  迁移: {
    紫微: `With Zi Wei in the Travel/Relocation Palace, you lead change with a steady hand and others feel safer moving when you’re at the front. You set direction well, but be careful of steering alone and calling every shot; it thins buy-in. Share the map, co-create the move plan, hand one key task to a partner, and keep a simple weekly sync so momentum stays shared.`,
    天府: `Tian Fu gives you a strong home base, so transitions feel grounded rather than chaotic. Stability is your edge, yet clinging to comfort can make good opportunities pass by. Keep the base solid while testing the new, store your essentials, run a two-week trial in the new place/workflow, and review calmly before you lock it in.`,
    武曲: `Wu Qu handles logistics like a pro, checklists, budgets, routes. Precision gets you there; rigidity, though, can make travel feel heavy. Keep the order but leave room to breathe, finalize the three must-dos, cap spend per leg, and block a flex window each day so detours can become wins.`,
    天相: `With Tian Xiang here, you’re diplomatic on the move, you handle landlords, visas, and vendors with fairness that earns favors. Harmony is gold, but circling decisions to avoid friction wastes time. Decide lightly, list three criteria, compare only a short list, and close by a set date so the journey actually starts.`,
    太阳: `Tai Yang brings energising presence, you rally people to say yes to new horizons. The catch is overextending yourself to keep everyone upbeat. Pace your brightness, rotate duties, book real rest on the itinerary, and let someone else lead one segment so your spark lasts.`,
    天机: `Tian Ji loves planning smart routes and optimising the move. That brain is a gift, just watch the rabbit hole of tabs and reviews. Narrow the field, hold to three options, decide within 24 hours, and run a 7-day recon (coworking pass, neighbourhood walks) so real data beats speculation.`,
    太阴: `Tai Yin gives you intuitive timing and a talent for finding places that feel safe and kind. Mood swings can colour choices more than facts, so pair feeling with a simple check. Keep a comfort anchor (sleep, meals, one familiar habit), visit new spots twice at different times, and choose when head and gut both nod.`,
    廉贞: `Lian Zhen loves order and standards, you set tidy processes for packing, paperwork, and settling in. Perfection, however, slows departure. Make the SOP friendly, three steps per task, a “good enough” rule for small items, and a clean review after arrival so lessons upgrade the next move.`,
    七杀: `Qi Sha moves boldly, you act fast and unlock doors others hesitate at. Speed helps, but jumping without rails costs extra. Keep the edge, add guardrails, cap first commitments (deposit, gear) at a small amount, run a quick pre-mortem, and only scale after one clean win on the ground.`,
    破军: `Po Jun breaks what’s stale so you can start fresh somewhere better. That courage is rare; burning bridges, though, steals options. Close chapters cleanly, settle dues, send a courteous farewell, and hold a 30-day buffer before big public statements so relationships stay useful.`,
    贪狼: `Tan Lang makes change feel exciting, you find the best scenes, people, and tastes in a new place. The appetite can drift into distraction and overspend. Keep the sparkle with soft limits, set a nights-out cap, use a 24-hour wishlist for extras, and pair every “treat” with one practical setup task.`,
    巨门: `Ju Men negotiates travel well, you ask the questions others miss and catch fine print. In a rush, that sharpness can sound like conflict. Slow the first line, mirror what you heard, ask one precise question, and confirm deals in writing so clarity lands without friction.`,
    天同: `Tian Tong keeps the vibe light on the road, you make friends quickly and soften hard days. Avoiding tough calls keeps today smooth but delays fixes. Keep it friendly and firm, name the small problem, pick a simple next step, and celebrate with something easy so morale stays high.`,
    天梁: `Tian Liang protects the journey, you think long term, plan backups, and choose safer paths. Over-protecting shrinks adventure. Keep your safety net but add stretch, book screenings or travel insurance first, then schedule one small challenge per week (new route, new group) so confidence grows.`,
    文昌: `Wenchang shines in documents and logistics, visas, leases, checklists. Building systems is great; building forever delays departure. Keep it elegant, one tracker, one owner, one deadline per item, then ship and adjust after arrival.`,
    文曲: `Wenqu finds beauty and culture fast, you curate cafés, studios, and scenes that feel like you. Style without structure drifts. Anchor the taste, shortlist three neighbourhoods, map costs beside vibe, and set a monthly showcase or share so the new city starts paying back.`,
    左辅: `Zuo Fu supports the move like a trusted deputy, you make leaders’ lives easier and turn plans into reality. Staying in the shadows caps growth. Ask for a visible role, own one move stream end-to-end and log your wins so credit travels with you.`,
    右弼: `You Bi grows the journey through people, intros, groups, and calm follow-through. Too many yeses thin focus. Go deep, not wide, choose one community to commit to for a season, keep weekly follow-ups, and track referrals so the network becomes an engine.`,
  },

  交友: {
    紫微: `With Zi Wei in the Friends/Network Palace, you naturally set the tone, people look to you to choose the direction. Lead with warmth; otherwise the room may feel managed, not inspired. Share the stage, co-create simple group rituals, rotate hosting, and hand real roles to others so belonging stays strong.`,
    天府: `Tian Fu builds steady, loyal friendships, you remember details and show up. The comfort is lovely, but sameness can stall growth. Keep your core circle while adding fresh air, set a monthly catch-up and one new experience together, then invite a new face quarterly so the mix evolves.`,
    武曲: `Wu Qu is the reliable doer, the friend who fixes, drives, books, and gets things done. That’s gold; being too blunt or doing it all breeds quiet distance. Offer help and ask for some, share a checklist with owners, keep boundaries clear, and let someone else lead the next plan.`,
    天相: `With Tian Xiang, you’re the mediator who keeps the group fair and steady. Avoiding decisions to keep harmony makes plans fuzzy. Make choosing easy, agree on three ground rules (vote method, tiebreak, deadline), use them openly, and write outcomes so everyone can move.`,
    太阳: `Tai Yang brings sunlight, you lift moods and kick-start plans. The risk is overshadowing quieter voices. Spread the light, give shout-outs, rotate the mic, and take one full rest night so energy doesn’t turn into pressure.`,
    天机: `Tian Ji sparks ideas and connects dots, you keep chats lively and plans smarter. Too many tweaks scatter the group. Contain the genius, time-box brainstorms, pick one owner and next step, and park extra ideas in a shared note for later.`,
    太阴: `Tai Yin holds space, you’re the listener friends trust with the real stuff. Carrying every feeling gets heavy. Care without carrying, set a gentle check-in, recommend pros when needed, and protect one quiet slot a week just for your refill.`,
    廉贞: `Lian Zhen keeps principles clear, fair shares, clear invites, clean money splits. When rules get rigid, fun thins out. Keep structure kind, write simple group norms, add a playful “we can break this once” clause, and review after big events so the system stays human.`,
    七杀: `Qi Sha pushes the crew to be brave, new trips, new skills, new business. Bold is great; risky stunts without rails bite back. Add safety to courage, run a two-check idea rule, set a small budget for trials, and log one lesson per attempt so stories turn into strategy.`,
    破军: `Po Jun resets stale dynamics, you name what’s not working and help rebuild. Cutting ties too fast burns bridges you might need. Repair first, then decide, have a clean conversation, propose clear terms for the new chapter, and, if it’s time to part, leave well.`,
    贪狼: `Tan Lang is the social magnet, you open doors and turn nights into memories. FOMO and overspend are the usual traps. Enjoy without the hangover, cap events per week, set a treats budget, and use a 24-hour RSVP rule so fun stays fun.`,
    巨门: `Ju Men tells the truth, you ask the sharp question that keeps the group honest. In a hurry, that edge can sting. Keep clarity kind, mirror first, offer one clean suggestion, and write decisions down so arguments don’t loop.`,
    天同: `Tian Tong keeps the vibe easy and welcoming, you reduce drama and help people feel at home. Avoiding hard talks lets small issues grow roots. Keep harmony and address things early, log friction in a shared note, revisit after a day, and agree on one tiny repair action.`,
    天梁: `Tian Liang brings mentor energy, people ask you for perspective and you steady the room. Over-advising makes friendships feel like projects. Ask consent before advice, share one principle not a lecture, and switch back to play so the bond stays light.`,
    文昌: `Wenchang organises the social engine, clear plans, timely messages, smooth rides. Micromanaging drains goodwill. Make it simple, share a concise checklist, assign owners, and let people run their part without hovering.`,
    文曲: `Wenqu curates taste, music, venues, the small touches that make gatherings memorable. Vague feedback sparks drama when tastes clash. Keep it crisp, use “keep / change / try,” bring one reference, and land on a clear choice so feelings stay intact.`,
    左辅: `Zuo Fu is the dependable second, your support makes others shine. Staying invisible keeps your rate and role small. Track your lifts, ask to co-lead one plan this month, and share a short recap so credit lands where it should.`,
    右弼: `You Bi is the connector and follow-through, you make intros and keep threads warm. Over-promising stretches trust. Qualify your intros, confirm next steps in writing, and keep light notes so your network compounds instead of frays.`,
  },

  官禄: {
    紫微: `With Zi Wei in the Career Palace, you set direction with calm authority and others lean on your steadiness. That presence is magnetic, but be careful of top-down habits that quietly mute your team; co-create KPIs, delegate one real lever to a trusted lead, and keep a short weekly check-in so ownership spreads while vision stays clear.`,
    天府: `Tian Fu brings patient, dependable progress, you build reputation like compounding interest. Safety is your edge, yet staying too safe stalls promotions; keep your base steady, then take one visible stretch each quarter (new client, new scope), and schedule a monthly review to bank the lesson and the win.`,
    武曲: `Wu Qu thrives on precision, skill, and results you can measure; you’re the person who makes hard things work. Discipline is power, though rigidity can turn speed into drag; define “good enough” for each milestone, ship iteratively, and run a 10-minute numbers review each week so the system stays light.`,
    天相: `With Tian Xiang here, you shine in diplomacy and fair process, people trust you to judge cleanly. Harmony matters, but circling decisions to please everyone delays momentum; agree on three criteria, keep choices to a short list, and pick by a clear date so fairness delivers outcomes.`,
    太阳: `Tai Yang makes you visible and energising, you rally teams and open doors just by showing up. The catch is hero mode, taking on everything until you fade; spread the light by rotating leads, ring-fencing one true rest day, and asking directly for the support you need so your fire lasts all quarter.`,
    天机: `Tian Ji is the strategist, seeing patterns, designing smarter paths, and improving in motion. Research is useful, but analysis can eat the launch; write a one-page plan, cap options to three, decide within 24 hours, and run a 72-hour prototype so data replaces guesswork.`,
    太阴: `Tai Yin gives quiet influence, empathy, timing, and a steady hand that keeps teams safe. Emotional labour can drain you if unbound; set office hours for deep support, name one boundary sentence you can use, and protect a weekly block for focused solo work so care and outcomes both thrive.`,
    廉贞: `Lian Zhen loves order, clear SOPs, clean hand-offs, consistent quality, and that structure earns trust. Perfection, however, freezes velocity; keep a three-step SOP, allow one exception for learning each sprint, and schedule a tidy-up pass after delivery so momentum and standards move together.`,
    七杀: `Qi Sha brings bold moves under pressure, you take real shots and can carry hard goals. Speed helps, but impulsive bets tax reputation; cap first stakes (time/budget) small, run a quick pre-mortem, and only scale after one clean result so courage compounds.`,
    破军: `Po Jun resets what’s stale, you say the hard truth, cut dead weight, and rebuild something better. Constant resets, though, erase compounding; make one decisive change, hold the new plan steady for 30 days, and publish a three-bullet post-mortem so the next cycle starts smarter.`,
    贪狼: `Tan Lang adds charisma, partnerships, and a nose for buzz, you turn rooms into pipelines. Vanity metrics are the trap; convert attention into deals by keeping a live follow-up list, booking next steps before you leave the room, and pairing every event with one revenue action the next morning.`,
    巨门: `Ju Men wins with voice, presentations, negotiation, sharp questioning that saves time. In a rush, that edge can cut; mirror what you heard in one line, ask one precise question, and make a single clear ask so clarity lands without friction.`,
    天同: `Tian Tong keeps culture easy and team morale high, you lower temperature and people do better work around you. Avoiding hard topics keeps today smooth but costs tomorrow; name small issues early, propose one next step, and close with appreciation so harmony grows up, not just sideways.`,
    天梁: `Tian Liang carries mentor energy, big-picture sense and steady ethics. Over-advising turns colleagues into dependents; ask permission before advising, share one principle and one resource, and let them own the decision so growth sticks.`,
    文昌: `Wenchang organises brilliantly, clean docs, clear plans, tighter loops, which reduces waste. Over-documenting becomes the work; keep one tracker, one owner, and one review pass, then ship so clarity turns into velocity.`,
    文曲: `Wenqu brings creative taste and narrative, you make work feel meaningful and on-brand. Style can outrun substance; open with the business goal, translate concept into a checklist with prices and dates, and test with a tiny audience before the big splash.`,
    左辅: `Zuo Fu is the trusted second, you spot gaps and make leaders better. Staying invisible caps your ceiling; claim one end-to-end stream this quarter, keep a wins log, and present a short recap so credit and scope rise together.`,
    右弼: `You Bi connects teams and keeps threads moving; your follow-through is glue. Too many promises thin results; qualify requests, confirm next steps in writing, and hold a weekly 30-minute admin sweep so commitments land.`,
  },

  田宅: {
    紫微: `With Zi Wei in the Property/Home Palace, you lead household decisions with a steady compass and long view. Prestige buys are tempting, but be careful of paying for status instead of fit; set clear criteria and budget first, involve one other decision-maker, and let the shortlist fight it out against what you truly need.`,
    天府: `Tian Fu loves stable, tangible assets and a calm, well-kept home. Playing only defense misses reasonable upside; keep your emergency and home funds solid, then test one modest growth move (REITs, rent-out room) and review quarterly so safety and yield travel together.`,
    武曲: `Wu Qu is brilliant at maintenance, precision budgets, and getting value from contractors. Micro-management burns time; set a quarterly preventive calendar, get three quotes then decide fast, and reserve a small contingency so jobs finish cleanly.`,
    天相: `With Tian Xiang here, you negotiate fairly and keep paperwork clean, which wins respect. Postponing choices to avoid awkward calls lets deals slip; use a three-quote rule with a decision date, list the top three criteria, and confirm in writing so progress doesn’t drift.`,
    太阳: `Tai Yang loves hosting and making space feel alive; community forms around you. Entertaining can inflate spend; set an event budget ahead, try potluck or shared costs when needed, and block true rest days at home so hospitality doesn’t hurt savings.`,
    天机: `Tian Ji researches locations and layouts like a pro, you see flow and future value. Over-analysis stalls keys; shortlist three neighbourhoods, visit each twice (day/night), and decide within 30 days so momentum meets insight.`,
    太阴: `Tai Yin has a feel for comfort, beauty, and long-term nest-building. Emotional buying is the leak; cool off 24 hours on big décor or upgrades, match each treat with one investment top-up, and keep a simple sinking fund for maintenance so the home stays lovely and solvent.`,
    廉贞: `Lian Zhen runs the house with order, labels, routines, systems that make life smoother. Perfection steals weekends; apply a 30/30 rule (30 minutes declutter, 30 minutes done), finish rooms one at a time, and allow a lived-in corner so the house serves people, not the other way round.`,
    七杀: `Qi Sha is bold with flips, moves, or big projects, you act where others hesitate. High stakes bite without rails; insist on inspections, cap first-phase spend, and stage work so each success funds the next.`,
    破军: `Po Jun is great at demolish-and-renew, deep clean, major reno, fresh start. Constant overhaul kills budgets; break the plan into phases, lock scope for each phase, and hold a 14-day stability period before changing direction.`,
    贪狼: `Tan Lang enjoys style, comfort, and lifestyle upgrades; your eye lifts spaces quickly. Lifestyle creep is sneaky; keep a wishlist with a 24-hour rule, set a monthly décor cap, and pair every upgrade with a small principal or investment payment so taste grows net worth.`,
    巨门: `Ju Men negotiates hard on price and terms, you spot the clause others miss. Push too fast and sellers push back; open by mirroring what you heard, ask one precise question, and put offers in clear writing so firmness lands as professionalism.`,
    天同: `Tian Tong keeps home gentle and welcoming, which heals stress and makes memories. Avoiding small fixes grows big bills; choose one tiny repair each week, set a weekend tidy ritual, and celebrate completions so momentum becomes habit.`,
    天梁: `Tian Liang protects well, you think insurance, safety, and longevity. Over-caution strands cash; review coverage annually, fund the safety basics first, then budget one improvement per quarter (lighting, ventilation, insulation) so security and comfort both climb.`,
    文昌: `Wenchang wins with paperwork and checklists, deeds, taxes, service logs. Paper can swallow time; keep a single home binder (physical or digital), calendar key dates, and batch tasks monthly so admin stays light.`,
    文曲: `Wenqu brings design sense and soulful touches, spaces feel like you. Form without function costs twice; start with a one-page brief (purpose, budget, must-haves), convert it into a checklist, and test with a small corner before scaling the look.`,
    左辅: `Zuo Fu supports the household quietly, errands, fixes, emotional labour that keeps things smooth. Over-helping breeds hidden resentment; delegate one chore per person, track contributions openly, and ask for a small shared ritual when big tasks land.`,
    右弼: `You Bi builds community, neighbours, committees, WhatsApp groups, and that network pays off. Too many commitments steal evenings; pick one association to go deep with, set clear roles, and keep one free night sacred so connection stays joyful.`,
  },
  福德: {
    紫微: `With Zi Wei in the Fortune/Wellbeing Palace, your inner compass is strong, you lead yourself with dignity and steady values. Pride can harden into “my way only,” so keep the crown light: write a three-line personal code, schedule a quiet weekly review, and channel influence into one act of service that isn’t about applause.`,
    天府: `Tian Fu brings contentment and patient gratitude; you’re good at feeling rich before numbers catch up. Staying only in comfort stalls growth, keep the cozy, add a spark: keep a nightly gratitude list, automate a small monthly give, and try one new experience each month so joy keeps widening.`,
    武曲: `Wu Qu turns discipline into peace; you like habits that sharpen mind and body. Being hard on yourself steals the ease you earned. Keep standards kind, track just three anchor habits, allow one rest day without guilt, and review progress in a ten-minute check so momentum feels supportive, not punishing.`,
    天相: `With Tian Xiang here, fairness and balance are your spiritual tools; you restore harmony in groups. Sitting on the fence to avoid ripples drains you. Choose clearly, define your top three values, weigh options against them, and decide by a date so integrity feels active, not theoretical.`,
    太阳: `Tai Yang brings generous spirit and bright optimism; people borrow your light. Overextending to keep everyone lifted empties your tank. Keep the light warm and sustainable, set a giving/time cap, ask for help once a week, and block one full off-day so your glow is real, not forced.`,
    天机: `Tian Ji loves reflection, reading, and smart frameworks for a good life. Over-studying peace delays living it. Pick one lens and live it, summarize a book on one page, test it for seven days, and take a 30-minute unplugged walk so thinking lands in the body.`,
    太阴: `Tai Yin gives deep empathy and soft strength; you sense what others need. Absorbing every feeling can blur your own. Protect the softness, set a simple boundary sentence, keep a nightly journal line (what’s mine / what’s theirs), and anchor one quiet ritual (tea, stretch, prayer) that returns you to yourself.`,
    廉贞: `Lian Zhen likes order in the inner world, routines, tidy promises to self, clear ethics. Rigidity can turn virtue into pressure. Keep structure friendly, use a three-step morning SOP, include a weekly “unplanned joy” slot, and audit rules quarterly so they serve you, not the other way round.`,
    七杀: `Qi Sha brings brave spirit and meaning through challenge. Chasing extremes for the thrill leaves you empty. Aim bold, land safe, choose one worthy challenge with rails (budget, buddy, time box), and log the lesson after each attempt so courage builds depth, not just stories.`,
    破军: `Po Jun helps you shed heavy skins, beliefs, habits, identities, and breathe again. Constant demolition erases roots. Clear once, then cultivate, declutter ten items today, choose one simple daily anchor (sleep, steps, sunlight), and hold it for fourteen days before the next change so calm can take root.`,
    贪狼: `Tan Lang delights in beauty, taste, and sensual joy; you remind people that life should feel good. Indulgence without edges steals tomorrow’s ease. Keep desire sweet, savor slowly, use a 24-hour pause on big treats, and pair upgrades with a small investment step so pleasure and peace grow together.`,
    巨门: `Ju Men searches for honest truth and clear language; saying what’s real frees you. When tired, the voice turns cynical. Keep the edge clean, start by mirroring what you notice, name one kinder interpretation, and choose one frank conversation you’ll have this week so truth heals instead of bruises.`,
    天同: `Tian Tong radiates simple happiness and ease; you lighten rooms just by being yourself. Avoiding discomfort keeps life small. Keep the softness and add tiny bravery, do one ten-minute brave thing daily, then reward it with something small and kind so confidence grows without losing your lightness.`,
    天梁: `Tian Liang carries elder wisdom and a protective heart; people exhale around you. Martyring yourself for everyone dims that wisdom. Hold the line, offer help inside clear limits, set “help hours,” and protect one evening a week purely for your own refill so guidance stays clean.`,
    文昌: `Wenchang brings clarity through writing and simple systems; order calms your mind. Over-organising becomes avoidance. Keep it crisp, five-minute morning journal, one habit tracker, one weekly review; then act so structure serves soul.`,
    文曲: `Wenqu feeds the soul through art, story, and beauty; making or curating is your prayer. Romanticising struggle keeps projects unfinished. Focus the muse, choose one small piece to make each week, set three milestones, and share it with one person so creation completes.`,
    左辅: `Zuo Fu finds meaning in being the steady support; your loyalty is medicine. Giving without refill leads to quiet resentment. Share the load, schedule your own recharge first, ask for specific help, and publicly note your contributions so care feels mutual.`,
    右弼: `You Bi turns community into wellbeing; you weave people together and everyone rises. Saying yes to everything thins presence. Go deep, choose one community for the season, keep gentle weekly follow-ups, and open space for one deeper conversation each week so belonging feels real.`,
  },

  父母: {
    紫微: `With Zi Wei in the Parents/Authority Palace, you naturally take the lead in family decisions. Direction is useful, but deciding for elders can feel like control. Lead with respect, co-write a simple plan, listen first, and share decisions in writing so authority feels like care, not command.`,
    天府: `Tian Fu offers steady, practical support, you’re good at making sure needs are met. Over-protecting keeps parents from their own strength. Keep the safety while growing independence, hold a monthly budget and care check, invite them to choose one task to own, and celebrate small wins.`,
    武曲: `Wu Qu gets things fixed, appointments, repairs, paperwork done right. Critique can sneak into your tone. Ask consent before fixing, bring a short checklist, and end with appreciation so help lands as kindness, not control.`,
    天相: `With Tian Xiang here, you mediate well between siblings, elders, and providers. Staying neutral forever leaves choices hanging. Make fair choices, write three criteria with the family, shortlist options, and decide by a date so peace includes progress.`,
    太阳: `Tai Yang brings warmth and pride, you show up, host, and keep spirits up. Taking every role burns you out. Share the stage, rotate hosting, ask directly for support, and keep one full rest day so family time stays joyful.`,
    天机: `Tian Ji is great at plans, care calendars, document checklists, smart workflows. Over-engineering makes simple things heavy. Keep it light, one-page care plan, three options max per decision, and a 20-minute weekly sync so plans breathe.`,
    太阴: `Tai Yin nurtures deeply; you feel their feelings and respond with care. Carrying everything blurs boundaries. Name what you can and can’t do, schedule respite time, and keep a calm evening ritual so love stays gentle and sustainable.`,
    廉贞: `Lian Zhen likes clear rules, med schedules, who-does-what, tidy files. Rigidity sparks conflict. Keep rules human, write a simple SOP with a “flex clause,” revisit monthly, and allow exceptions when they help dignity.`,
    七杀: `Qi Sha takes decisive action when families hesitate. Fast moves without alignment trigger pushback. Add rails to speed, sleep on big choices, cap first commitments small, and share a two-line rationale so everyone understands the why.`,
    破军: `Po Jun resets what doesn’t work, care homes, doctors, even living setups, so elders get better outcomes. Burning bridges steals options later. Change in phases, give notice well, settle dues, and keep a 30-day buffer before hard announcements so respect stays intact.`,
    贪狼: `Tan Lang brings social ease, you find the right people, services, and small joys for elders. Gossip or favouritism complicates care. Share only with consent, keep a simple treat budget, and match each outing with one practical task so fun and function balance.`,
    巨门: `Ju Men says the uncomfortable truth when others won’t, which protects the family. Sharp delivery wounds. Mirror what you heard, ask one clean question, and make one specific request so clarity lands without harm.`,
    天同: `Tian Tong keeps peace and warmth; you cushion rough moments. Avoiding hard talks lets small issues grow. Put kindness into action, schedule the necessary conversation, agree on one next step, and close with appreciation so bonds stay soft.`,
    天梁: `Tian Liang carries elder-mentor energy; you respect lineage and wisdom. Putting elders on a pedestal stops healthy boundaries. Ask for advice on purpose, set limits on time and money, and keep your own goals visible so respect is mutual.`,
    文昌: `Wenchang shines in documents, ICs, wills, medical notes, so crises go smoother. Paper can become a maze. Build a simple family binder, calendar key dates, and review once a quarter so admin supports, not overwhelms.`,
    文曲: `Wenqu preserves stories and meaning, you record memories, photos, and recipes that keep roots alive. Nostalgia can freeze growth. Capture and continue, interview an elder this month, scan and share highlights, and turn one story into a small family ritual.`,
    左辅: `Zuo Fu is the dependable caregiver, rides, errands, quiet labour that keeps things working. Carrying it all breeds burnout. Share the load, create a roster, ask for specific help, and set a small ritual of thanks so support is seen and shared.`,
    右弼: `You Bi connects generations, siblings, cousins, providers, and keeps follow-through warm. Over-promising frays trust. Qualify commitments upfront, confirm next steps in writing, and keep light notes so the family system runs like a team.`,
  }
};
