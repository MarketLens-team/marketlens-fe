import { useCallback, useEffect, useRef } from 'react'

export function useModal(isOpen: boolean) {
  const savedScrollYRef = useRef(0)

  const open = useCallback(() => {
    savedScrollYRef.current = window.scrollY
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
    document.documentElement.classList.add('modal-open')
    document.body.classList.add('modal-open')
    document.body.style.position = 'fixed'
    document.body.style.top = `-${savedScrollYRef.current}px`
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }, [])

  const close = useCallback(() => {
    document.documentElement.classList.remove('modal-open')
    document.body.classList.remove('modal-open')
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.paddingRight = ''
    window.scrollTo(0, savedScrollYRef.current)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    open()
    return () => close()
  }, [isOpen, open, close])

  return { isOpen, open, close }
}
