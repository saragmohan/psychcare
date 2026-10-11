export interface DsmCode {
  code: string;
  name: string;
  category: string;
}

export const DSM5_DATABASE: DsmCode[] = [
  { code: 'F41.1', name: 'Generalized Anxiety Disorder (GAD)', category: 'Anxiety Disorders' },
  { code: 'F32.1', name: 'Major Depressive Disorder, Single Episode, Moderate', category: 'Depressive Disorders' },
  { code: 'F33.1', name: 'Major Depressive Disorder, Recurrent, Moderate', category: 'Depressive Disorders' },
  { code: 'F43.10', name: 'Post-Traumatic Stress Disorder (PTSD)', category: 'Trauma & Stressor-Related' },
  { code: 'F41.0', name: 'Panic Disorder', category: 'Anxiety Disorders' },
  { code: 'F42.2', name: 'Obsessive-Compulsive Disorder (OCD)', category: 'OCD & Related Disorders' },
  { code: 'F31.12', name: 'Bipolar I Disorder, Current Episode Manic, Moderate', category: 'Bipolar & Related' },
  { code: 'F31.81', name: 'Bipolar II Disorder', category: 'Bipolar & Related' },
  { code: 'F43.23', name: 'Adjustment Disorder With Mixed Anxiety and Depressed Mood', category: 'Trauma & Stressor-Related' },
  { code: 'F50.01', name: 'Anorexia Nervosa, Restricting Type', category: 'Feeding & Eating Disorders' },
  { code: 'F50.2', name: 'Bulimia Nervosa', category: 'Feeding & Eating Disorders' },
  { code: 'F90.2', name: 'Attention-Deficit/Hyperactivity Disorder, Combined Presentation', category: 'Neurodevelopmental' },
  { code: 'F84.0', name: 'Autism Spectrum Disorder', category: 'Neurodevelopmental' },
  { code: 'F60.3', name: 'Borderline Personality Disorder', category: 'Personality Disorders' },
  { code: 'F60.4', name: 'Histrionic Personality Disorder', category: 'Personality Disorders' },
];
