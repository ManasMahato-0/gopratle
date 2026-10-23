// Values must match backend/src/constants.js

export type Option = { value: string; label: string };

export const EVENT_TYPES: Option[] = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'concert', label: 'Concert' },
  { value: 'festival', label: 'Festival' },
  { value: 'private_party', label: 'Private party' },
  { value: 'other', label: 'Other' },
];

export const CATEGORIES = [
  { value: 'planner', label: 'Event Planner', hint: 'Someone to plan and run the event end to end' },
  { value: 'performer', label: 'Performer', hint: 'Singer, band, DJ, dancer, anchor and so on' },
  { value: 'crew', label: 'Crew', hint: 'Photographers, technicians, security, staff' },
] as const;

export type Category = (typeof CATEGORIES)[number]['value'];

export const PLANNER_SERVICES: Option[] = [
  { value: 'full_planning', label: 'Full planning' },
  { value: 'decor', label: 'Decor' },
  { value: 'catering', label: 'Catering' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'vendor_management', label: 'Vendor management' },
  { value: 'guest_management', label: 'Guest management' },
];

export const PERFORMER_TYPES: Option[] = [
  { value: 'singer', label: 'Singer' },
  { value: 'band', label: 'Band' },
  { value: 'dj', label: 'DJ' },
  { value: 'dancer', label: 'Dancer / troupe' },
  { value: 'comedian', label: 'Comedian' },
  { value: 'anchor', label: 'Anchor / emcee' },
  { value: 'magician', label: 'Magician' },
];

export const CREW_ROLES: Option[] = [
  { value: 'photographer', label: 'Photographer' },
  { value: 'videographer', label: 'Videographer' },
  { value: 'sound_technician', label: 'Sound technician' },
  { value: 'lighting_technician', label: 'Lighting technician' },
  { value: 'stage_hand', label: 'Stage hand' },
  { value: 'security', label: 'Security' },
  { value: 'hospitality', label: 'Hospitality staff' },
];

export const EXPERIENCE_LEVELS: Option[] = [
  { value: 'any', label: 'Any' },
  { value: 'junior', label: 'Junior is fine' },
  { value: 'experienced', label: 'Experienced only' },
];

// Titles for step 2 and 3, they change with the category
export const STEP_TITLES: Record<Category, [string, string]> = {
  planner: ['Services & guests', 'Budget'],
  performer: ['Performer', 'Performance details'],
  crew: ['Roles needed', 'Shift & pay'],
};

export function labelOf(options: readonly { value: string; label: string }[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value;
}
