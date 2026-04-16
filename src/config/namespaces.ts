import { API_RATE_LIMITS } from '@/config/api-rate-limit';

type ApiNamespaces = {
  [K in keyof typeof API_RATE_LIMITS]: (typeof API_RATE_LIMITS)[K]['namespace'];
};

export const API_NAMESPACES = Object.fromEntries(
  Object.entries(API_RATE_LIMITS).map(([key, value]) => [key, value.namespace])
) as ApiNamespaces;
