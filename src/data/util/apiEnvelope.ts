import type { ApiEnvelope } from '../types/api'
import { messageFromApiError } from './apiError'

export function unwrapApiEnvelope<T>(envelope: ApiEnvelope<T>, fallbackMessage: string): T {
  if (envelope.success) {
    return envelope.data as T
  }
  throw new Error(messageFromApiError(envelope.error, fallbackMessage))
}
