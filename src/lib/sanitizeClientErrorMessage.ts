import { ERROR_CODE_MESSAGES } from '../data/constants/errorCodes'

const TECHNICAL_ERROR_PATTERN =
  /is not defined|referenceerror|syntaxerror|typeerror|cannot read propert|unexpected token/i

/** fetch catch 등 — 개발자용 런타임 문구는 사용자 메시지로 치환 */
export function sanitizeClientErrorMessage(message: string): string {
  const trimmed = message.trim()
  if (!trimmed) return ERROR_CODE_MESSAGES.C003
  if (TECHNICAL_ERROR_PATTERN.test(trimmed)) return ERROR_CODE_MESSAGES.C003
  return trimmed
}
