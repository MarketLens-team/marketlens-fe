import { Navigate, useParams } from 'react-router-dom'
import { AppErrorPage } from '../components/common/AppErrorPage'
import { ERROR_PAGE_PRESETS, isErrorPageVariant } from '../data/errorPagePresets'

export default function DevErrorPagePreview() {
  const { variant } = useParams()

  if (!variant || !isErrorPageVariant(variant)) {
    return <Navigate to="/dev/errors" replace />
  }

  return <AppErrorPage preset={ERROR_PAGE_PRESETS[variant]} layout="fullscreen" showDevBackLink />
}
