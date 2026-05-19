import type { PersonTrackerPageData } from '../types/person'
import type { PersonStatementResponse, PersonTopResponse } from '../types/personApi'

const mockStatements: PersonStatementResponse[] = [
  {
    statementId: 1,
    personId: 101,
    personName: '젠슨 황',
    personRole: 'CEO',
    organizationName: '엔비디아',
    statementSummary: 'HBM 수요 급증, 한국 파트너사와 협력 강화 예정',
    sourceName: '연합뉴스',
    publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    sentiment: 'positive',
    score: 81,
    relatedStocks: [
      { stockCode: '000660', stockName: 'SK하이닉스' },
      { stockCode: '005930', stockName: '삼성전자' },
    ],
  },
  {
    statementId: 2,
    personId: 102,
    personName: '이재용',
    personRole: '회장',
    organizationName: '삼성전자',
    statementSummary: '메모리 반도체 투자 확대, AI 인프라 수요에 대응',
    sourceName: '한국경제',
    publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    sentiment: 'positive',
    score: 62,
    relatedStocks: [{ stockCode: '005930', stockName: '삼성전자' }],
  },
  {
    statementId: 3,
    personId: 103,
    personName: '정의선',
    personRole: '회장',
    organizationName: '현대차그룹',
    statementSummary: '전기차 수요 둔화 우려, 가격 경쟁 심화 가능성 언급',
    sourceName: '매일경제',
    publishedAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    sentiment: 'neutral',
    score: 12,
    relatedStocks: [{ stockCode: '005380', stockName: '현대차' }],
  },
  {
    statementId: 4,
    personId: 104,
    personName: '서정진',
    personRole: '회장',
    organizationName: '셀트리온',
    statementSummary: '美 FDA 심사 일정 지연 가능성, 단기 실적 부담',
    sourceName: '이데일리',
    publishedAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    sentiment: 'negative',
    score: -42,
    relatedStocks: [{ stockCode: '068270', stockName: '셀트리온' }],
  },
  {
    statementId: 5,
    personId: 105,
    personName: '최태원',
    personRole: '회장',
    organizationName: 'SK그룹',
    statementSummary: '배터리·반도체 투자 병행, 그룹사 시너지 강화',
    sourceName: '조선비즈',
    publishedAt: new Date(Date.now() - 1000 * 60 * 900).toISOString(),
    sentiment: 'positive',
    score: 45,
    relatedStocks: [
      { stockCode: '000660', stockName: 'SK하이닉스' },
      { stockCode: '006400', stockName: '삼성SDI' },
    ],
  },
]

const mockTopPersons: PersonTopResponse[] = [
  {
    personId: 101,
    personName: '젠슨 황',
    personRole: 'CEO',
    organizationName: '엔비디아',
    mentionCount: 48,
  },
  {
    personId: 102,
    personName: '이재용',
    personRole: '회장',
    organizationName: '삼성전자',
    mentionCount: 41,
  },
  {
    personId: 103,
    personName: '정의선',
    personRole: '회장',
    organizationName: '현대차그룹',
    mentionCount: 33,
  },
  {
    personId: 104,
    personName: '서정진',
    personRole: '회장',
    organizationName: '셀트리온',
    mentionCount: 28,
  },
  {
    personId: 105,
    personName: '최태원',
    personRole: '회장',
    organizationName: 'SK그룹',
    mentionCount: 24,
  },
]

export const mockPersonTrackerPage: PersonTrackerPageData = {
  mentions: mockStatements.map((row) => ({
    id: String(row.statementId),
    personId: String(row.personId),
    personName: row.personName,
    role: row.personRole,
    organizationName: row.organizationName,
    context: row.statementSummary,
    sourceName: row.sourceName,
    publishedAt: row.publishedAt,
    sentiment:
      row.sentiment === 'positive' ? 'positive' : row.sentiment === 'negative' ? 'negative' : 'neutral',
    sentimentScore: row.score,
    relatedStocks: row.relatedStocks.map((s) => ({
      code: s.stockCode,
      name: s.stockName,
    })),
  })),
  topPersons: mockTopPersons.map((row) => ({
    personId: String(row.personId),
    personName: row.personName,
    role: row.personRole,
    organizationName: row.organizationName,
    mentionCount: row.mentionCount,
  })),
  frequentStocks: [
    { code: '000660', name: 'SK하이닉스', mentionCount: 12 },
    { code: '005930', name: '삼성전자', mentionCount: 9 },
    { code: '005380', name: '현대차', mentionCount: 6 },
    { code: '068270', name: '셀트리온', mentionCount: 5 },
    { code: '006400', name: '삼성SDI', mentionCount: 4 },
  ],
}

export const mockPersonStatementsResponse = mockStatements
export const mockPersonTopResponse = mockTopPersons
