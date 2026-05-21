export const features = {
  CHAINS:   true,
  ALERTS:   true,
  DISPATCH: true,
  KEYBOARD: true,
  COSTS:    true,
  QUALITY:  true,
  MEMORY:   true,
  TOKEN:    true,
} as const

export type FeatureFlag = keyof typeof features
