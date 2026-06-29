export const ADD_PLACE_RATE_LIMIT = {
  limit: 10,
  windowSeconds: 60 * 60,
} as const;

export const ADD_CONFIRMATION_GLOBAL_RATE_LIMIT = {
  limit: 10,
  windowSeconds: 60 * 60,
} as const;

export const ADD_CONFIRMATION_PER_PLACE_RATE_LIMIT = {
  limit: 1,
  windowSeconds: 24 * 60 * 60,
} as const;

export const REPORT_PLACE_GLOBAL_RATE_LIMIT = {
  limit: 5,
  windowSeconds: 60 * 60,
} as const;

export const REPORT_PLACE_PER_PLACE_RATE_LIMIT = {
  limit: 3,
  windowSeconds: 24 * 60 * 60,
} as const;
