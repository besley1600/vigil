export const features = {
  CHAINS:   true,
  ALERTS:   true,
  DISPATCH: true,
  KEYBOARD: true,
  COSTS:    true,
  QUALITY:  true,
  MEMORY:   true,
  TOKEN:    false,
} as const

export type FeatureFlag = keyof typeof features
