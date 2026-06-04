import { AppErrorPage } from './AppErrorPage'
import { appErrorPresetFromMessage } from '../../data/errorPagePresets'

export interface PageFetchErrorProps {
  message: string
  title: string
  homeHref?: string
  /** 기본 true — API 문장만 두고 힌트는 숨김 */
  omitHint?: boolean
}

/** Layout `main` 안에서 쓰는 공통 fetch 실패 UI (401·403·404·5xx·네트워크는 페이지에서 풀스크린으로 분기) */
export function PageFetchError({
  message,
  title,
  homeHref = '/',
  omitHint = true,
}: PageFetchErrorProps) {
  return (
    <AppErrorPage
      layout="embedded"
      preset={appErrorPresetFromMessage(message, { title, omitHint })}
      homeHref={homeHref}
    />
  )
}
