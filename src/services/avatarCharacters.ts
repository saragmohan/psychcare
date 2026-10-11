export interface AvatarCharacter {
  id: string;
  name: string;
  role: string;
  bgHex: string;
  dataUrl: string;
}

const svgToDataUrl = (svg: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};

export const AVATAR_CHARACTERS: AvatarCharacter[] = [
  {
    id: 'owl_wise',
    name: 'Dr. Owl',
    role: 'Wise Counselor',
    bgHex: '#312E81',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="30" fill="#312E81"/>
        <!-- Ear tufts -->
        <polygon points="26,18 36,36 18,34" fill="#4338CA"/>
        <polygon points="74,18 82,34 64,36" fill="#4338CA"/>
        <!-- Owl Body/Face -->
        <circle cx="50" cy="54" r="32" fill="#4F46E5"/>
        <ellipse cx="50" cy="62" rx="20" ry="16" fill="#C7D2FE" opacity="0.3"/>
        <!-- Eye Rings/Feathers -->
        <circle cx="38" cy="48" r="14" fill="#EEF2FF"/>
        <circle cx="62" cy="48" r="14" fill="#EEF2FF"/>
        <!-- Eyes -->
        <circle cx="38" cy="48" r="7" fill="#1E1B4B"/>
        <circle cx="62" cy="48" r="7" fill="#1E1B4B"/>
        <circle cx="36" cy="45" r="2.5" fill="#FFFFFF"/>
        <circle cx="60" cy="45" r="2.5" fill="#FFFFFF"/>
        <!-- Golden Spectacles -->
        <circle cx="38" cy="48" r="13" fill="none" stroke="#FBBF24" stroke-width="2.5"/>
        <circle cx="62" cy="48" r="13" fill="none" stroke="#FBBF24" stroke-width="2.5"/>
        <line x1="51" y1="48" x2="49" y2="48" stroke="#FBBF24" stroke-width="3"/>
        <!-- Beak -->
        <polygon points="50,54 44,61 56,61" fill="#F59E0B"/>
        <!-- Cheeks -->
        <circle cx="26" cy="58" r="4" fill="#EC4899" opacity="0.4"/>
        <circle cx="74" cy="58" r="4" fill="#EC4899" opacity="0.4"/>
      </svg>
    `),
  },
  {
    id: 'fox_calm',
    name: 'Calm Fox',
    role: 'Mindful Guide',
    bgHex: '#C2410C',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="30" fill="#9A3412"/>
        <!-- Ears -->
        <polygon points="22,16 40,36 16,38" fill="#EA580C"/>
        <polygon points="24,22 36,36 20,36" fill="#FED7AA"/>
        <polygon points="78,16 84,38 60,36" fill="#EA580C"/>
        <polygon points="76,22 80,36 64,36" fill="#FED7AA"/>
        <!-- Face -->
        <ellipse cx="50" cy="55" rx="32" ry="28" fill="#EA580C"/>
        <!-- White Cheeks/Muzzle -->
        <path d="M 22,58 Q 50,78 78,58 Q 65,76 50,76 Q 35,76 22,58 Z" fill="#FFF7ED"/>
        <!-- Eyes (Happy closed arcs) -->
        <path d="M 32,48 Q 38,42 44,48" fill="none" stroke="#431407" stroke-width="3" stroke-linecap="round"/>
        <path d="M 56,48 Q 62,42 68,48" fill="none" stroke="#431407" stroke-width="3" stroke-linecap="round"/>
        <!-- Nose -->
        <polygon points="50,60 46,65 54,65" fill="#431407"/>
        <!-- Smile -->
        <path d="M 50,65 L 50,69" stroke="#431407" stroke-width="2" stroke-linecap="round"/>
        <path d="M 47,69 Q 50,72 53,69" fill="none" stroke="#431407" stroke-width="2" stroke-linecap="round"/>
        <!-- Rosy blush -->
        <ellipse cx="28" cy="56" rx="4" ry="2.5" fill="#F43F5E" opacity="0.4"/>
        <ellipse cx="72" cy="56" rx="4" ry="2.5" fill="#F43F5E" opacity="0.4"/>
      </svg>
    `),
  },
  {
    id: 'panda_zen',
    name: 'Zen Panda',
    role: 'Peaceful Healer',
    bgHex: '#065F46',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="30" fill="#065F46"/>
        <!-- Ears -->
        <circle cx="25" cy="28" r="12" fill="#1F2937"/>
        <circle cx="75" cy="28" r="12" fill="#1F2937"/>
        <circle cx="25" cy="28" r="7" fill="#374151"/>
        <circle cx="75" cy="28" r="7" fill="#374151"/>
        <!-- Face -->
        <circle cx="50" cy="55" r="32" fill="#F9FAFB"/>
        <!-- Eye Patches -->
        <ellipse cx="36" cy="50" rx="10" ry="13" fill="#1F2937" transform="rotate(-15 36 50)"/>
        <ellipse cx="64" cy="50" rx="10" ry="13" fill="#1F2937" transform="rotate(15 64 50)"/>
        <!-- Eyes -->
        <circle cx="36" cy="50" r="4" fill="#FFFFFF"/>
        <circle cx="37" cy="50" r="2.5" fill="#111827"/>
        <circle cx="64" cy="50" r="4" fill="#FFFFFF"/>
        <circle cx="63" cy="50" r="2.5" fill="#111827"/>
        <!-- Nose -->
        <ellipse cx="50" cy="62" rx="5" ry="3.5" fill="#1F2937"/>
        <!-- Smile -->
        <path d="M 45,67 Q 50,71 55,67" fill="none" stroke="#1F2937" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Blush -->
        <circle cx="27" cy="61" r="4.5" fill="#F472B6" opacity="0.4"/>
        <circle cx="73" cy="61" r="4.5" fill="#F472B6" opacity="0.4"/>
      </svg>
    `),
  },
  {
    id: 'koala_kind',
    name: 'Kind Koala',
    role: 'Supportive Ear',
    bgHex: '#0E7490',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="30" fill="#0E7490"/>
        <!-- Big Fluffy Ears -->
        <circle cx="20" cy="38" r="18" fill="#94A3B8"/>
        <circle cx="20" cy="38" r="12" fill="#E2E8F0"/>
        <circle cx="80" cy="38" r="18" fill="#94A3B8"/>
        <circle cx="80" cy="38" r="12" fill="#E2E8F0"/>
        <!-- Head -->
        <circle cx="50" cy="55" r="30" fill="#94A3B8"/>
        <!-- Eyes -->
        <circle cx="36" cy="48" r="4.5" fill="#0F172A"/>
        <circle cx="64" cy="48" r="4.5" fill="#0F172A"/>
        <circle cx="34.5" cy="46.5" r="1.5" fill="#FFFFFF"/>
        <circle cx="62.5" cy="46.5" r="1.5" fill="#FFFFFF"/>
        <!-- Big Koala Oval Nose -->
        <ellipse cx="50" cy="58" rx="8" ry="12" fill="#1E293B"/>
        <!-- Mouth -->
        <path d="M 46,73 Q 50,76 54,73" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>
        <!-- Blush -->
        <circle cx="28" cy="56" r="4" fill="#FB7185" opacity="0.4"/>
        <circle cx="72" cy="56" r="4" fill="#FB7185" opacity="0.4"/>
      </svg>
    `),
  },
  {
    id: 'bunny_bright',
    name: 'Bright Bunny',
    role: 'Positive Energy',
    bgHex: '#BE185D',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="30" fill="#BE185D"/>
        <!-- Tall Ears -->
        <ellipse cx="35" cy="24" rx="8" ry="20" fill="#FDF2F8"/>
        <ellipse cx="35" cy="24" rx="4.5" ry="14" fill="#F472B6"/>
        <ellipse cx="65" cy="24" rx="8" ry="20" fill="#FDF2F8"/>
        <ellipse cx="65" cy="24" rx="4.5" ry="14" fill="#F472B6"/>
        <!-- Face -->
        <circle cx="50" cy="58" r="28" fill="#FDF2F8"/>
        <!-- Eyes -->
        <ellipse cx="38" cy="53" rx="4.5" ry="5.5" fill="#831843"/>
        <ellipse cx="62" cy="53" rx="4.5" ry="5.5" fill="#831843"/>
        <circle cx="36.5" cy="51.5" r="1.5" fill="#FFFFFF"/>
        <circle cx="60.5" cy="51.5" r="1.5" fill="#FFFFFF"/>
        <!-- Nose -->
        <polygon points="50,62 47,65 53,65" fill="#F43F5E"/>
        <!-- Smile & Whiskers -->
        <path d="M 46,68 Q 50,71 54,68" fill="none" stroke="#831843" stroke-width="2" stroke-linecap="round"/>
        <!-- Blush -->
        <circle cx="28" cy="62" r="5" fill="#FB7185" opacity="0.45"/>
        <circle cx="72" cy="62" r="5" fill="#FB7185" opacity="0.45"/>
      </svg>
    `),
  },
  {
    id: 'cat_serene',
    name: 'Serene Cat',
    role: 'Quiet Reflection',
    bgHex: '#6D28D9',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="30" fill="#6D28D9"/>
        <!-- Ears -->
        <polygon points="24,20 42,36 18,40" fill="#EDE9FE"/>
        <polygon points="26,25 38,36 21,38" fill="#DDD6FE"/>
        <polygon points="76,20 82,40 58,36" fill="#EDE9FE"/>
        <polygon points="74,25 79,38 62,36" fill="#DDD6FE"/>
        <!-- Face -->
        <circle cx="50" cy="55" r="30" fill="#EDE9FE"/>
        <!-- Serene Closed Eyes -->
        <path d="M 32,50 Q 38,44 44,50" fill="none" stroke="#4C1D95" stroke-width="3" stroke-linecap="round"/>
        <path d="M 56,50 Q 62,44 68,50" fill="none" stroke="#4C1D95" stroke-width="3" stroke-linecap="round"/>
        <!-- Cute Nose -->
        <polygon points="50,56 47,60 53,60" fill="#A855F7"/>
        <!-- Mouth -->
        <path d="M 46,63 Q 50,66 54,63" fill="none" stroke="#4C1D95" stroke-width="2" stroke-linecap="round"/>
        <!-- Whiskers -->
        <line x1="22" y1="56" x2="14" y2="54" stroke="#8B5CF6" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="22" y1="60" x2="14" y2="62" stroke="#8B5CF6" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="78" y1="56" x2="86" y2="54" stroke="#8B5CF6" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="78" y1="60" x2="86" y2="62" stroke="#8B5CF6" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Blush -->
        <circle cx="28" cy="56" r="4.5" fill="#EC4899" opacity="0.35"/>
        <circle cx="72" cy="56" r="4.5" fill="#EC4899" opacity="0.35"/>
      </svg>
    `),
  },
  {
    id: 'bear_gentle',
    name: 'Gentle Bear',
    role: 'Warm Presence',
    bgHex: '#92400E',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="30" fill="#78350F"/>
        <!-- Ears -->
        <circle cx="26" cy="28" r="11" fill="#B45309"/>
        <circle cx="26" cy="28" r="6" fill="#FDE68A"/>
        <circle cx="74" cy="28" r="11" fill="#B45309"/>
        <circle cx="74" cy="28" r="6" fill="#FDE68A"/>
        <!-- Face -->
        <circle cx="50" cy="55" r="31" fill="#B45309"/>
        <!-- Muzzle -->
        <ellipse cx="50" cy="63" rx="16" ry="12" fill="#FDE68A"/>
        <!-- Eyes -->
        <circle cx="36" cy="48" r="4.5" fill="#451A03"/>
        <circle cx="64" cy="48" r="4.5" fill="#451A03"/>
        <circle cx="34.5" cy="46.5" r="1.5" fill="#FFFFFF"/>
        <circle cx="62.5" cy="46.5" r="1.5" fill="#FFFFFF"/>
        <!-- Nose & Mouth -->
        <ellipse cx="50" cy="59" rx="6" ry="4" fill="#451A03"/>
        <path d="M 46,67 Q 50,71 54,67" fill="none" stroke="#451A03" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Blush -->
        <circle cx="27" cy="58" r="4.5" fill="#F87171" opacity="0.4"/>
        <circle cx="73" cy="58" r="4.5" fill="#F87171" opacity="0.4"/>
      </svg>
    `),
  },
  {
    id: 'penguin_care',
    name: 'Care Penguin',
    role: 'Attentive Clinical',
    bgHex: '#0369A1',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="30" fill="#0369A1"/>
        <!-- Head -->
        <ellipse cx="50" cy="54" rx="30" ry="32" fill="#0F172A"/>
        <!-- White Heart Face -->
        <path d="M 28,48 C 28,34 46,36 50,44 C 54,36 72,34 72,48 C 72,65 50,75 50,75 C 50,75 28,65 28,48 Z" fill="#F8FAFC"/>
        <!-- Eyes -->
        <ellipse cx="38" cy="48" rx="4" ry="5.5" fill="#0F172A"/>
        <ellipse cx="62" cy="48" rx="4" ry="5.5" fill="#0F172A"/>
        <circle cx="37" cy="46" r="1.5" fill="#FFFFFF"/>
        <circle cx="61" cy="46" r="1.5" fill="#FFFFFF"/>
        <!-- Golden Beak -->
        <polygon points="50,53 43,60 57,60" fill="#F59E0B"/>
        <!-- Rosy Cheeks -->
        <circle cx="32" cy="55" r="4" fill="#FB7185" opacity="0.45"/>
        <circle cx="68" cy="55" r="4" fill="#FB7185" opacity="0.45"/>
        <!-- Little Stethoscope Badge -->
        <circle cx="50" cy="74" r="5" fill="#0284C7"/>
        <circle cx="50" cy="74" r="3" fill="#E0F2FE"/>
      </svg>
    `),
  },
  {
    id: 'bot_mindful',
    name: 'Mindful Bot',
    role: 'Cognitive Balance',
    bgHex: '#0F766E',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="30" fill="#0F766E"/>
        <!-- Antenna -->
        <line x1="50" y1="18" x2="50" y2="30" stroke="#2DD4BF" stroke-width="3"/>
        <circle cx="50" cy="16" r="5" fill="#FDE047"/>
        <!-- Ears/Bolts -->
        <rect x="18" y="46" width="6" height="14" rx="3" fill="#14B8A6"/>
        <rect x="76" y="46" width="6" height="14" rx="3" fill="#14B8A6"/>
        <!-- Head -->
        <rect x="24" y="30" width="52" height="46" rx="16" fill="#115E59"/>
        <!-- Visor Screen -->
        <rect x="30" y="38" width="40" height="20" rx="8" fill="#134E4A"/>
        <!-- Glowing Eyes -->
        <circle cx="40" cy="48" r="4.5" fill="#2DD4BF"/>
        <circle cx="60" cy="48" r="4.5" fill="#2DD4BF"/>
        <circle cx="39" cy="47" r="1.5" fill="#CCFBF1"/>
        <circle cx="59" cy="47" r="1.5" fill="#CCFBF1"/>
        <!-- Smile -->
        <path d="M 43,65 Q 50,70 57,65" fill="none" stroke="#2DD4BF" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Little Heart indicator -->
        <path d="M 48,34 Q 50,32 52,34 Q 50,37 50,37 Z" fill="#F43F5E"/>
      </svg>
    `),
  },
  {
    id: 'lion_brave',
    name: 'Brave Lion',
    role: 'Courage Coach',
    bgHex: '#B45309',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="30" fill="#92400E"/>
        <!-- Mane -->
        <circle cx="50" cy="54" r="35" fill="#D97706"/>
        <!-- Ears -->
        <circle cx="26" cy="30" r="8" fill="#F59E0B"/>
        <circle cx="26" cy="30" r="4" fill="#FEF3C7"/>
        <circle cx="74" cy="30" r="8" fill="#F59E0B"/>
        <circle cx="74" cy="30" r="4" fill="#FEF3C7"/>
        <!-- Face -->
        <circle cx="50" cy="55" r="26" fill="#FBBF24"/>
        <!-- Muzzle -->
        <ellipse cx="50" cy="62" rx="13" ry="10" fill="#FEF3C7"/>
        <!-- Eyes -->
        <circle cx="38" cy="48" r="4" fill="#78350F"/>
        <circle cx="62" cy="48" r="4" fill="#78350F"/>
        <circle cx="37" cy="47" r="1.5" fill="#FFFFFF"/>
        <circle cx="61" cy="47" r="1.5" fill="#FFFFFF"/>
        <!-- Nose -->
        <polygon points="50,57 46,62 54,62" fill="#78350F"/>
        <!-- Smile -->
        <path d="M 46,67 Q 50,71 54,67" fill="none" stroke="#78350F" stroke-width="2" stroke-linecap="round"/>
        <!-- Whiskers -->
        <circle cx="44" cy="63" r="1" fill="#92400E"/>
        <circle cx="56" cy="63" r="1" fill="#92400E"/>
      </svg>
    `),
  },
  {
    id: 'otter_joy',
    name: 'Joy Otter',
    role: 'Playful Spirit',
    bgHex: '#1D4ED8',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="30" fill="#1E3A8A"/>
        <!-- Tiny Ears -->
        <circle cx="24" cy="38" r="7" fill="#78350F"/>
        <circle cx="76" cy="38" r="7" fill="#78350F"/>
        <!-- Head -->
        <circle cx="50" cy="54" r="30" fill="#92400E"/>
        <!-- Light Face -->
        <ellipse cx="50" cy="60" rx="20" ry="16" fill="#FEF3C7"/>
        <!-- Eyes (sparkly) -->
        <circle cx="38" cy="48" r="4.5" fill="#1E1B4B"/>
        <circle cx="62" cy="48" r="4.5" fill="#1E1B4B"/>
        <circle cx="36.5" cy="46.5" r="1.5" fill="#FFFFFF"/>
        <circle cx="60.5" cy="46.5" r="1.5" fill="#FFFFFF"/>
        <!-- Nose -->
        <polygon points="50,54 45,59 55,59" fill="#1E1B4B"/>
        <!-- Mouth -->
        <path d="M 45,63 Q 50,67 55,63" fill="none" stroke="#1E1B4B" stroke-width="2" stroke-linecap="round"/>
        <!-- Whiskers -->
        <line x1="26" y1="58" x2="36" y2="59" stroke="#92400E" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="74" y1="58" x2="64" y2="59" stroke="#92400E" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Blush -->
        <circle cx="30" cy="58" r="4" fill="#F43F5E" opacity="0.35"/>
        <circle cx="70" cy="58" r="4" fill="#F43F5E" opacity="0.35"/>
      </svg>
    `),
  },
  {
    id: 'deer_peace',
    name: 'Peaceful Deer',
    role: 'Empathy Anchor',
    bgHex: '#166534',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="30" fill="#14532D"/>
        <!-- Antlers -->
        <path d="M 34,26 Q 30,16 24,14 M 30,20 Q 24,18 22,22" fill="none" stroke="#FDE68A" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 66,26 Q 70,16 76,14 M 70,20 Q 76,18 78,22" fill="none" stroke="#FDE68A" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Ears -->
        <ellipse cx="22" cy="38" rx="10" ry="6" fill="#B45309" transform="rotate(-30 22 38)"/>
        <ellipse cx="78" cy="38" rx="10" ry="6" fill="#B45309" transform="rotate(30 78 38)"/>
        <!-- Head -->
        <ellipse cx="50" cy="56" rx="28" ry="26" fill="#B45309"/>
        <!-- White forehead spots -->
        <circle cx="50" cy="40" r="2" fill="#FEF3C7"/>
        <circle cx="45" cy="44" r="1.5" fill="#FEF3C7"/>
        <circle cx="55" cy="44" r="1.5" fill="#FEF3C7"/>
        <!-- Muzzle -->
        <ellipse cx="50" cy="65" rx="14" ry="10" fill="#FEF3C7"/>
        <!-- Doe Eyes -->
        <ellipse cx="38" cy="50" rx="4.5" ry="5.5" fill="#1C1917"/>
        <ellipse cx="62" cy="50" rx="4.5" ry="5.5" fill="#1C1917"/>
        <circle cx="36.5" cy="48" r="1.5" fill="#FFFFFF"/>
        <circle cx="60.5" cy="48" r="1.5" fill="#FFFFFF"/>
        <!-- Nose -->
        <ellipse cx="50" cy="62" rx="4.5" ry="3" fill="#1C1917"/>
        <!-- Smile -->
        <path d="M 47,69 Q 50,71 53,69" fill="none" stroke="#1C1917" stroke-width="2" stroke-linecap="round"/>
        <!-- Blush -->
        <circle cx="28" cy="58" r="4" fill="#F43F5E" opacity="0.35"/>
        <circle cx="72" cy="58" r="4" fill="#F43F5E" opacity="0.35"/>
      </svg>
    `),
  },
];

export const getDefaultAvatar = (seed?: string): string => {
  if (!seed) return AVATAR_CHARACTERS[0].dataUrl;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_CHARACTERS.length;
  return AVATAR_CHARACTERS[index].dataUrl;
};
