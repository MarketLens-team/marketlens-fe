/** 네트워크 지연을 흉내 내어 로딩 UI를 확인할 때 사용 */
export function mockDelay(ms = 180): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
