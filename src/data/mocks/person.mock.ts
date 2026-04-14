import type { PersonMention } from '../types/person'

export const mockPersonMentions: PersonMention[] = [
  {
    id: 'p1',
    personName: '김○○',
    role: '한국은행 총재',
    context: '물가 둔화 흐름이 이어지고 있으며 금리 정책은 데이터에 기반해 결정할 것.',
    stockCodes: [],
    publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    sentiment: 'neutral',
  },
  {
    id: 'p2',
    personName: '이○○',
    role: '반도체 협회장',
    context: 'HBM 수요는 구조적으로 견조하며 국내 기업들의 점유율 확대가 가능하다.',
    stockCodes: ['000660', '005930'],
    publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    sentiment: 'positive',
  },
  {
    id: 'p3',
    personName: '박○○',
    role: '증권사 애널리스트',
    context: '단기 차익 실현 매물 출회 가능성을 염두에 둘 필요가 있다.',
    stockCodes: ['035420'],
    publishedAt: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
    sentiment: 'negative',
  },
]
