import type { Status } from './site'

/**
 * Homepage copy. Wording supplied in the Version 4.2 brief is published;
 * anything that would claim a specific responsibility, credential or result
 * not yet confirmed carries status "draft" and appears only in the preview.
 */

export const ABOUT = {
  title: 'Built Around Your Vision. Rooted in Kerala.',
  text: 'At RANCO, every home begins with understanding the people who will live in it. From shaping new spaces to renewing traditional homes, our approach brings together thoughtful planning, careful execution and an appreciation for Kerala’s architectural identity.',
  message: [
    'Every home begins with an idea. RANCO helps transform that idea into a thoughtfully planned and beautifully completed home, bringing together the different stages of the home-building journey.',
    'For traditional Kerala homes, RANCO focuses on renewing existing spaces while respecting their architectural heritage and original character.',
  ],
}

export interface Stage {
  title: string
  text: string
  /** Preview-only note for stages whose division of responsibility is not yet confirmed. */
  note?: string
}

export const JOURNEY = {
  title: 'Every Dream Home Has a Beginning.',
  text: 'From the first conversation to the finishing touches, discover the journey of bringing your dream home to life.',
  stages: [
    { title: 'Your Idea', text: 'Understanding your vision, requirements, lifestyle and expectations.' },
    {
      title: 'Planning & Design',
      text: 'Turning the initial concept into architectural planning and design.',
      note: 'To confirm: does RANCO provide architectural design directly, or coordinate it through qualified professionals?',
    },
    {
      title: 'Drawings & Approvals',
      text: 'Preparing the required drawings and coordinating applicable approval processes.',
      note: 'To confirm: who prepares the drawings and handles approvals, RANCO or qualified professionals RANCO works with?',
    },
    { title: 'Construction', text: 'Bringing the approved plans to life through the construction process.' },
    { title: 'Finishing', text: 'Completing the details that shape the look and feel of the home.' },
    { title: 'Final Handover', text: 'The completed home, ready for its next chapter.' },
  ] as Stage[],
}

export const EXPERTISE = {
  title: 'Two Signature Services',
  services: {
    'new-home-construction': {
      headline: 'A Home Designed Around Your Dreams.',
      text: 'From your first idea to the final details, RANCO helps shape a home that reflects your vision, lifestyle and aspirations.',
    },
    'heritage-home-renovation': {
      headline: 'Preserving the Past. Renewing for the Future.',
      text: 'Traditional Kerala homes hold stories, memories and craftsmanship worth preserving. RANCO brings a thoughtful approach to heritage home renovation, respecting original architectural character while adapting spaces for contemporary living.',
    },
  } as Record<string, { headline: string; text: string }>,
}

export const AREAS_TITLE = 'Building Homes Across Central Kerala.'
export const AREAS_INTRO = 'RANCO works with homeowners in four districts of Central Kerala. These are the areas we serve, not branch offices. If your home or plot is nearby, call or message to ask.'

/** General observations about each district's homes, not claims about RANCO's project history. */
export const AREAS = [
  { district: 'Kottayam', text: 'Family homes on their own plots, and older houses with character worth keeping.' },
  { district: 'Pathanamthitta', text: 'Homes across the district’s towns and villages, from new houses to traditional homes ready for renewal.' },
  { district: 'Idukki', text: 'Sloping plots, heavy rainfall and hill-country access shape how homes here are planned, drained and roofed.' },
  { district: 'Ernakulam', text: 'Homes in and around the city, where careful planning makes the most of every plot.' },
]

export interface Faq {
  status: Status
  question: string
  answer: string
}

/** General guidance and verified facts only: no prices, timelines, responsibilities or guarantees. */
export const FAQS: Faq[] = [
  {
    status: 'confirmed',
    question: 'How do I begin a new home construction enquiry?',
    answer: 'Call +91 98466 67095 or send a WhatsApp message with your district, where your plot is, and a few words about the home you have in mind. You can also use the form on this page, which prepares the message for you.',
  },
  {
    status: 'confirmed',
    question: 'What stages are involved in building a home?',
    answer: 'A new home usually moves from your initial idea to planning and design, the drawings and approvals the project needs, construction, finishing, and finally handover. The details of each stage depend on the plot, the design and the approvals that apply.',
  },
  {
    status: 'confirmed',
    question: 'What does heritage home renovation mean?',
    answer: 'It means renewing a traditional Kerala home, such as a house with a tiled roof, timber pillars, verandahs or a courtyard, while respecting its original architectural character, so that it suits contemporary living without losing what makes it special.',
  },
  {
    status: 'confirmed',
    question: 'Which areas of Central Kerala does RANCO serve?',
    answer: 'RANCO serves homeowners in Kottayam, Pathanamthitta, Idukki and Ernakulam districts. These are service areas, not branch offices. If your home is nearby, call or message to ask.',
  },
  {
    status: 'confirmed',
    question: 'How do I contact RANCO for an initial discussion?',
    answer: 'Call +91 98466 67095, message on WhatsApp, or fill in the short form on this page. Tell us whether you are planning a new home or renewing a traditional house, and where it is.',
  },
  {
    status: 'confirmed',
    question: 'Can an old Kerala house be renovated?',
    answer: 'Often, yes. The first step is to check the condition of the walls, foundations, roof timber or slab, wiring and plumbing. Sound older houses can usually be renewed while keeping their character; where parts are weak, they may need repair or replacement first.',
  },
]

export const CONTACT_COPY = {
  heading: 'Your Dream Home Starts With a Conversation.',
  text: 'Whether you’re planning a new home or renewing a traditional Kerala house, tell us what you have in mind.',
}
