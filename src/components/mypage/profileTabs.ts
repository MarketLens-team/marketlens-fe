export type MyPageTab = 'account' | 'watchlist' | 'news'

export const MY_PAGE_TABS: Array<{ id: MyPageTab; label: string }> = [
  { id: 'watchlist', label: '관심종목' },
  { id: 'news', label: '뉴스' },
  { id: 'account', label: '계정 설정' },
]

export function parseMyPageTab(value: string | null): MyPageTab {
  if (value === 'news' || value === 'account') return value
  return 'watchlist'
}

