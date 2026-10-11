import type { Question } from '../types';

export const PHQ9_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Little interest or pleasure in doing things',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 2,
    text: 'Feeling down, depressed, or hopeless',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 3,
    text: 'Trouble falling or staying asleep, or sleeping too much',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 4,
    text: 'Feeling tired or having little energy',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 5,
    text: 'Poor appetite or overeating',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 6,
    text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 7,
    text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 8,
    text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 9,
    text: 'Thoughts that you would be better off dead or of hurting yourself in some way',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
];

export const GAD7_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Feeling nervous, anxious, or on edge',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 2,
    text: 'Not being able to stop or control worrying',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 3,
    text: 'Worrying too much about different things',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 4,
    text: 'Trouble relaxing',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 5,
    text: 'Being so restless that it is hard to sit still',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 6,
    text: 'Becoming easily annoyed or irritable',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
  {
    id: 7,
    text: 'Feeling afraid as if something awful might happen',
    options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ],
  },
];

export function evaluatePHQ9(score: number): { severity: string; recommendation: string } {
  if (score <= 4) {
    return { severity: 'Minimal Depression', recommendation: 'Monitor clinical status. Re-evaluate if symptoms persist.' };
  } else if (score <= 9) {
    return { severity: 'Mild Depression', recommendation: 'Use clinical judgment. Support with watchful waiting & psychoeducation.' };
  } else if (score <= 14) {
    return { severity: 'Moderate Depression', recommendation: 'Consider treatment plan with CBT, psychotherapy or pharmacotherapy.' };
  } else if (score <= 19) {
    return { severity: 'Moderately Severe Depression', recommendation: 'Active psychotherapy and/or pharmacotherapy recommended.' };
  } else {
    return { severity: 'Severe Depression', recommendation: 'Immediate clinical intervention. High priority monitoring for safety.' };
  }
}

export function evaluateGAD7(score: number): { severity: string; recommendation: string } {
  if (score <= 4) {
    return { severity: 'Minimal Anxiety', recommendation: 'No immediate treatment required. Monitor symptoms.' };
  } else if (score <= 9) {
    return { severity: 'Mild Anxiety', recommendation: 'Provide stress reduction strategies, mindfulness & watchful waiting.' };
  } else if (score <= 14) {
    return { severity: 'Moderate Anxiety', recommendation: 'CBT techniques, cognitive restructuring, and periodic review.' };
  } else {
    return { severity: 'Severe Anxiety', recommendation: 'Active therapeutic plan, intense anxiety management & specialist consultation.' };
  }
}
