import type { Status } from './site'

/** Homepage copy. Every item carries a status; drafts appear only in the preview build. */

export const INTRO = {
  eyebrow: 'RANCO · Kerala',
  heading: 'Homes shaped around the families who live in them.',
  paragraphs: [
    {
      status: 'confirmed' as Status,
      text: 'RANCO works with homeowners in Kottayam, Pathanamthitta, Idukki and Ernakulam to renovate and improve the homes they love.',
    },
    {
      status: 'draft' as Status,
      text: 'Every project begins with a conversation about how your family lives, what the house needs and what you would like it to become. From there, we plan the work carefully and keep you informed at every stage.',
    },
  ],
}

/** Short description of each service for the homepage list. Visibility follows the service status in taxonomy.json. */
export const SERVICE_SUMMARIES: Record<string, string> = {
  'home-construction': 'New houses planned around your plot, your family and Kerala’s climate.',
  'home-renovation': 'Renewing older homes and apartments: layouts, finishes and services, while keeping what makes them yours.',
  'house-extensions': 'Extra rooms, upper floors and verandahs that sit naturally with the existing house.',
  'roofing-waterproofing': 'Tiled and concrete roofs, leak repairs and waterproofing for heavy monsoon seasons.',
  'kitchen-bathroom-renovation': 'Kitchens and bathrooms with better layouts, ventilation, plumbing and finishes.',
  'repair-maintenance': 'Repairs, repainting and upkeep that keep a home sound between larger projects.',
}

export const PRINCIPLES = {
  status: 'draft' as Status,
  heading: 'Why homeowners choose RANCO',
  items: [
    { title: 'Kerala homes, understood', text: 'Plans and materials chosen for monsoon rain, humidity and the way Kerala families live.' },
    { title: 'One team to talk to', text: 'A single point of contact from the first discussion to the final handover.' },
    { title: 'Clear estimates', text: 'You see what the work involves, and what it is expected to cost, before it begins.' },
    { title: 'Care on site', text: 'Tidy, safe sites and regular updates while the work is under way.' },
  ],
}

export const STORY = [
  { word: 'Your Vision.', text: 'It begins with how you want to live: the rooms, the light, the way your family gathers.' },
  { word: 'Our Craft.', text: 'Thoughtful design and quality workmanship turn that vision into something real.' },
  { word: 'Your Home.', text: 'A place that feels like yours from the very first morning.' },
]

export const PROCESS = {
  status: 'draft' as Status,
  heading: 'How a project moves forward',
  steps: [
    { title: 'Enquiry', text: 'Call or message us with your location and the work you have in mind.' },
    { title: 'Project discussion', text: 'We talk through your needs, priorities and budget expectations.' },
    { title: 'Site visit', text: 'We visit the house or plot to understand the conditions on site.' },
    { title: 'Planning', text: 'The scope, layout and materials are agreed with you.' },
    { title: 'Estimate', text: 'You receive an estimate based on the agreed scope.' },
    { title: 'Execution', text: 'Work proceeds in stages, with regular updates.' },
    { title: 'Handover', text: 'A final walk-through together before the home is handed back to you.' },
  ],
}

/** General observations about each district's homes, not claims about RANCO's project history. */
export const AREAS = [
  { district: 'Kottayam', text: 'Independent family homes, older houses ready for renewal and additions for growing families.' },
  { district: 'Pathanamthitta', text: 'Homes across the district’s towns and villages, from focused upgrades to larger renovations.' },
  { district: 'Idukki', text: 'Sloping plots, heavy rainfall and hill-country access shape how homes here are planned, drained and roofed.' },
  { district: 'Ernakulam', text: 'Space-efficient renovation for city homes and apartments, where every square foot matters.' },
]

export interface Faq {
  status: Status
  question: string
  answer: string
}

/** General guidance and verified facts only: no prices, timelines or guarantees. */
export const FAQS: Faq[] = [
  {
    status: 'confirmed',
    question: 'Can an old Kerala house be renovated?',
    answer: 'Often, yes. The first step is to check the condition of the walls, foundations, roof timber or slab, wiring and plumbing. Sound older houses can usually be renewed and modernised while keeping their character; where parts are weak, they may need repair or replacement first.',
  },
  {
    status: 'confirmed',
    question: 'What affects the cost of a home renovation?',
    answer: 'The main factors are the scope of work, the condition of the existing structure, the materials and finishes you choose, access to the site and whether services such as wiring, plumbing or the roof need replacing. An estimate is only reliable once the house has been seen.',
  },
  {
    status: 'confirmed',
    question: 'What should be checked before renovating a roof?',
    answer: 'Look at the condition of the rafters or slab, signs of leaks and damp on ceilings and walls, the state of the tiles or sheets, gutters and drainage, and how the roof copes with heavy rain. These decide whether repair, waterproofing or replacement makes sense.',
  },
  {
    status: 'confirmed',
    question: 'What information helps with an estimate?',
    answer: 'Your location, a short description of the work, photographs of the areas involved, any existing drawings or measurements, and when you would like the work to happen.',
  },
  {
    status: 'confirmed',
    question: 'How do I start a project with RANCO?',
    answer: 'Call +91 98466 67095 or send a WhatsApp message with your district, the work you have in mind and a few photographs of the house.',
  },
  {
    status: 'confirmed',
    question: 'Which areas does RANCO serve?',
    answer: 'RANCO serves homeowners in Kottayam, Pathanamthitta, Idukki and Ernakulam districts. If your home is nearby, call or message to ask.',
  },
  {
    status: 'draft',
    question: 'How do I request a site visit?',
    answer: 'Call or message us with your location and a short description of the work. We will arrange a convenient time to visit the house or plot.',
  },
]

export const CONTACT_COPY = {
  heading: 'Discuss Your Project',
  text: 'Tell us about your home and what you would like to change. Call us, or send the details on WhatsApp.',
}
