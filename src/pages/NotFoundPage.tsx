import { AppErrorPage } from '../components/common/AppErrorPage'
import { ERROR_PAGE_PRESETS } from '../data/errorPagePresets'

export default function NotFoundPage() {
  return <AppErrorPage layout="fullscreen" preset={ERROR_PAGE_PRESETS['404']} homeHref="/" />
}
