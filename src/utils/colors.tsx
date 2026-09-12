import React from 'react';
import { Check } from 'lucide-react';
import { EventTypeDefinition } from '../types';

export interface EventTypeInfo {
  name: string;
  bgHex: string;
  textHex: string;
  icon: string;
}

export const DEFAULT_EVENT_TYPES: EventTypeDefinition[] = [
  { id: 'school', name: 'School', color: '#EAB308', icon: '🎓' },
  { id: 'sport', name: 'Sport', color: '#3B82F6', icon: '⚽' },
  { id: 'appointment', name: 'Appointment', color: '#22C55E', icon: '🩺' },
  { id: 'work', name: 'Work', color: '#F97316', icon: '💼' },
  { id: 'birthday', name: 'Birthday', color: '#EC4899', icon: '🎁' },
  { id: 'holiday', name: 'Holiday', color: '#8B5CF6', icon: '🏖️' },
  { id: 'social', name: 'Social', color: '#C084FC', icon: '🍸' },
  { id: 'important', name: 'Important', color: '#EF4444', icon: '⚡' },
  { id: 'other', name: 'Other', color: '#64748B', icon: '📌' },
];

export function getEventTypeInfo(
  title?: string,
  explicitType?: string,
  customTypes?: EventTypeDefinition[]
): EventTypeInfo {
  const allTypes = customTypes && customTypes.length > 0 ? customTypes : DEFAULT_EVENT_TYPES;

  // 1. If explicitType is given, find direct match
  if (explicitType && explicitType.trim()) {
    const trimmed = explicitType.trim();
    const matched = allTypes.find(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase() || t.id.toLowerCase() === trimmed.toLowerCase()
    );
    if (matched) {
      return {
        name: matched.name,
        bgHex: matched.color,
        textHex: '#FFFFFF',
        icon: matched.icon || '📌',
      };
    }
    // Return explicit type even if not in default list with grey fallback
    return {
      name: trimmed,
      bgHex: '#64748B',
      textHex: '#FFFFFF',
      icon: '📌',
    };
  }

  // 2. Keyword fallback matching from event title
  const t = (title || '').toLowerCase();
  
  if (t.includes('school') || t.includes('excursion') || t.includes('class') || t.includes('homework') || t.includes('exam')) {
    const matched = allTypes.find((item) => item.name.toLowerCase() === 'school');
    return { name: 'School', bgHex: matched?.color || '#EAB308', textHex: '#FFFFFF', icon: matched?.icon || '🎓' };
  }
  if (t.includes('sport') || t.includes('football') || t.includes('basketball') || t.includes('match') || t.includes('training') || t.includes('soccer') || t.includes('tennis') || t.includes('dance') || t.includes('gym')) {
    const matched = allTypes.find((item) => item.name.toLowerCase() === 'sport');
    return { name: 'Sport', bgHex: matched?.color || '#3B82F6', textHex: '#FFFFFF', icon: matched?.icon || '⚽' };
  }
  if (t.includes('doctor') || t.includes('appointment') || t.includes('dentist') || t.includes('clinic') || t.includes('hospital')) {
    const matched = allTypes.find((item) => item.name.toLowerCase() === 'appointment');
    return { name: 'Appointment', bgHex: matched?.color || '#22C55E', textHex: '#FFFFFF', icon: matched?.icon || '🩺' };
  }
  if (t.includes('work') || t.includes('meeting') || t.includes('client') || t.includes('office')) {
    const matched = allTypes.find((item) => item.name.toLowerCase() === 'work');
    return { name: 'Work', bgHex: matched?.color || '#F97316', textHex: '#FFFFFF', icon: matched?.icon || '💼' };
  }
  if (t.includes('birthday') || t.includes('party')) {
    const matched = allTypes.find((item) => item.name.toLowerCase() === 'birthday');
    return { name: 'Birthday', bgHex: matched?.color || '#EC4899', textHex: '#FFFFFF', icon: matched?.icon || '🎁' };
  }
  if (t.includes('holiday') || t.includes('trip') || t.includes('fishing') || t.includes('vacation') || t.includes('flight')) {
    const matched = allTypes.find((item) => item.name.toLowerCase() === 'holiday');
    return { name: 'Holiday', bgHex: matched?.color || '#8B5CF6', textHex: '#FFFFFF', icon: matched?.icon || '🏖️' };
  }
  if (t.includes('social') || t.includes('lunch') || t.includes('dinner') || t.includes('gaming') || t.includes('friends') || t.includes('family time')) {
    const matched = allTypes.find((item) => item.name.toLowerCase() === 'social');
    return { name: 'Social', bgHex: matched?.color || '#C084FC', textHex: '#FFFFFF', icon: matched?.icon || '🍸' };
  }
  if (t.includes('important') || t.includes('urgent') || t.includes('deadline')) {
    const matched = allTypes.find((item) => item.name.toLowerCase() === 'important');
    return { name: 'Important', bgHex: matched?.color || '#EF4444', textHex: '#FFFFFF', icon: matched?.icon || '⚡' };
  }

  // 3. Default fallback is 'Other'
  const otherMatched = allTypes.find((item) => item.name.toLowerCase() === 'other');
  return {
    name: otherMatched?.name || 'Other',
    bgHex: otherMatched?.color || '#64748B',
    textHex: '#FFFFFF',
    icon: otherMatched?.icon || '📌',
  };
}

export interface PastelColor {
  id: string;
  name: string;
  hex: string;
  textHex: string;
  borderHex: string;
  dotHex: string;
  bgSoft: string;
}

export const PASTEL_COLORS: PastelColor[] = [
  {
    id: 'pastel-pink',
    name: 'Pastel Pink',
    hex: '#F8BBD0',
    textHex: '#831843',
    borderHex: '#F472B6',
    dotHex: '#DB2777',
    bgSoft: '#FDF2F8',
  },
  {
    id: 'soft-rose',
    name: 'Soft Rose',
    hex: '#F5C2C7',
    textHex: '#881337',
    borderHex: '#FB7185',
    dotHex: '#E11D48',
    bgSoft: '#FFF1F2',
  },
  {
    id: 'peach',
    name: 'Peach',
    hex: '#FFD1B3',
    textHex: '#7C2D12',
    borderHex: '#FB923C',
    dotHex: '#EA580C',
    bgSoft: '#FFF7ED',
  },
  {
    id: 'soft-apricot',
    name: 'Soft Apricot',
    hex: '#FFD8A8',
    textHex: '#78350F',
    borderHex: '#FBBF24',
    dotHex: '#D97706',
    bgSoft: '#FFFBEB',
  },
  {
    id: 'butter-yellow',
    name: 'Butter Yellow',
    hex: '#FFF0B3',
    textHex: '#713F12',
    borderHex: '#FACC15',
    dotHex: '#CA8A04',
    bgSoft: '#FEFCE8',
  },
  {
    id: 'pastel-lemon',
    name: 'Pastel Lemon',
    hex: '#FFF4C2',
    textHex: '#713F12',
    borderHex: '#FDE047',
    dotHex: '#EAB308',
    bgSoft: '#FEFCE8',
  },
  {
    id: 'mint',
    name: 'Mint',
    hex: '#BFE8D0',
    textHex: '#064E3B',
    borderHex: '#34D399',
    dotHex: '#059669',
    bgSoft: '#ECFDF5',
  },
  {
    id: 'soft-sage',
    name: 'Soft Sage',
    hex: '#C9E4C5',
    textHex: '#14532D',
    borderHex: '#4ADE80',
    dotHex: '#16A34A',
    bgSoft: '#F0FDF4',
  },
  {
    id: 'pastel-aqua',
    name: 'Pastel Aqua',
    hex: '#BFE7E5',
    textHex: '#134E4A',
    borderHex: '#2DD4BF',
    dotHex: '#0D9488',
    bgSoft: '#F0FDFA',
  },
  {
    id: 'powder-blue',
    name: 'Powder Blue',
    hex: '#BDD7F2',
    textHex: '#1E3A8A',
    borderHex: '#60A5FA',
    dotHex: '#2563EB',
    bgSoft: '#EFF6FF',
  },
  {
    id: 'periwinkle',
    name: 'Periwinkle',
    hex: '#C7CCF5',
    textHex: '#312E81',
    borderHex: '#818CF8',
    dotHex: '#4F46E5',
    bgSoft: '#EEF2FF',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    hex: '#D8C7F2',
    textHex: '#4C1D95',
    borderHex: '#A78BFA',
    dotHex: '#7C3AED',
    bgSoft: '#F5F3FF',
  },
  {
    id: 'lilac-pink',
    name: 'Lilac Pink',
    hex: '#E8C7E8',
    textHex: '#581C87',
    borderHex: '#C084FC',
    dotHex: '#9333EA',
    bgSoft: '#FAF5FF',
  },
  {
    id: 'soft-sand',
    name: 'Soft Sand',
    hex: '#E8D5C4',
    textHex: '#451A03',
    borderHex: '#D6D3D1',
    dotHex: '#78716C',
    bgSoft: '#FAFAF9',
  },
  {
    id: 'mist-grey',
    name: 'Mist Grey',
    hex: '#D9DEE5',
    textHex: '#1E293B',
    borderHex: '#94A3B8',
    dotHex: '#475569',
    bgSoft: '#F8FAFC',
  },
];

export const DEFAULT_PASTEL_COLOR = PASTEL_COLORS[0]; // Pastel Pink

/**
 * Returns color info for any color string. If it matches a pastel hex, returns that.
 * Otherwise returns a fallback pastel styling with dark readable text.
 */
export function getPastelColorInfo(colorStr?: string | null): PastelColor {
  if (!colorStr) return DEFAULT_PASTEL_COLOR;
  
  const normalized = colorStr.toUpperCase();
  const matched = PASTEL_COLORS.find(
    (c) => c.hex.toUpperCase() === normalized || c.name.toLowerCase() === colorStr.toLowerCase()
  );
  
  if (matched) return matched;

  // Map legacy saturated colors to closest pastel
  const legacyMap: Record<string, number> = {
    '#FF4FA3': 0, // Pastel Pink
    '#EC4899': 1, // Soft Rose
    '#F59E0B': 2, // Peach
    '#EF4444': 1, // Soft Rose
    '#10B981': 6, // Mint
    '#06B6D4': 8, // Pastel Aqua
    '#3B82F6': 9, // Powder Blue
    '#8B5CF6': 11, // Lavender
    '#4285F4': 9, // Powder Blue
  };

  if (legacyMap[normalized] !== undefined) {
    return PASTEL_COLORS[legacyMap[normalized]];
  }

  // Fallback custom color object with dark readable text
  return {
    id: 'custom',
    name: 'Custom',
    hex: colorStr,
    textHex: '#0F172A',
    borderHex: '#CBD5E1',
    dotHex: colorStr,
    bgSoft: colorStr,
  };
}

interface PastelColorPickerProps {
  selectedColor: string;
  onSelectColor: (hex: string) => void;
  disabled?: boolean;
}

export const PastelColorPicker: React.FC<PastelColorPickerProps> = ({
  selectedColor,
  onSelectColor,
  disabled = false,
}) => {
  const currentNormalized = (selectedColor || '').toUpperCase();

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-15 gap-2 pt-1">
        {PASTEL_COLORS.map((c) => {
          const isSelected =
            currentNormalized === c.hex.toUpperCase() ||
            (selectedColor === '#FF4FA3' && c.hex === '#F8BBD0');

          return (
            <button
              key={c.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectColor(c.hex)}
              title={c.name}
              style={{ backgroundColor: c.hex }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-black/10 transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                isSelected
                  ? 'ring-2 ring-[#0F172A] ring-offset-2 scale-110 shadow-sm'
                  : 'hover:scale-105 hover:shadow-sm opacity-90 hover:opacity-100'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSelected && (
                <Check className="w-4 h-4 text-[#0F172A] stroke-[2.5]" />
              )}
            </button>
          );
        })}
      </div>
      <div className="text-[11px] text-gray-500 font-medium">
        Selected: <span className="font-semibold text-gray-800">{getPastelColorInfo(selectedColor).name}</span>
      </div>
    </div>
  );
};
