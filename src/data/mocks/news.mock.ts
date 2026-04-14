import type { NewsFeedItem } from '../types/news'

const trend = (scores: number[], base: Date) =>
  scores.map((score, i) => {
    const d = new Date(base)
    d.setDate(d.getDate() - (scores.length - 1 - i))
    return { at: d.toISOString(), score }
  })

const baseDate = new Date()

export const mockNewsFeed: NewsFeedItem[] = [
  {
    id: 'n1',
    title: '“AI·로봇·반도체 리더 전면에”…삼성전자, 부사장 51명 등 161명 승진',
    summary:
      '삼성전자가 연초 인사에서 AI·로봇·반도체 등 미래 먹거리를 이끌 인재를 전면 배치했다. 부사장 51명, 전무 110명 등 총 161명이 승진했다.',
    body:
      '삼성전자는 2025년 정기 임원 인사를 단행하며 AI, 로봇, 반도체 등 핵심 사업을 총괄할 리더십을 강화했다고 밝혔다. 이번 인사에서는 부사장 51명, 상무·전무급 110명 등 총 161명이 승진했으며, 차세대 성장 동력과 직결된 부문 인사 비중이 확대됐다는 설명이다.',
    source: '매일경제',
    reporter: '전종헌 기자',
    publishedAt: new Date(baseDate.getTime() - 138 * 86400000).toISOString(),
    imageUrl: 'https://picsum.photos/seed/mln1/120/80',
    sentimentScore: 42,
    coverage: {
      percent: 88,
      scopes: ['제목·리드', '본문 요약', '핵심 문장'],
      entitySummary: '언급 종목 5개 중 3개 엔티티 감성 스코어',
    },
    buzzScore: 76,
    primaryTicker: { code: '005930', name: '삼성전자' },
    sentimentTrend: trend([12, 18, 22, 28, 35, 40, 42], baseDate),
  },
  {
    id: 'n2',
    title: '네이버페이·삼성화재, 디지털 대출 제휴…금융 공동 영역 확대',
    summary:
      '네이버페이와 삼성화재가 플랫폼 기반 대출·보험 연계 상품을 확대한다. 비대면 심사와 데이터 연동을 통해 이용자 편의를 높이는 방향이다.',
    body:
      '양사는 디지털 채널에서의 대출·보험 가입 절차를 단순화하고, 이용자 동의 기반 데이터를 활용한 맞춤형 금융 서비스를 순차 출시할 계획이라고 밝혔다.',
    source: '한국경제',
    publishedAt: new Date(baseDate.getTime() - 36 * 86400000).toISOString(),
    imageUrl: 'https://picsum.photos/seed/mln2/120/80',
    sentimentScore: 18,
    coverage: {
      percent: 72,
      scopes: ['제목·리드', '본문 요약'],
      entitySummary: '언급 종목 4개 중 2개 엔티티 감성 스코어',
    },
    buzzScore: 54,
    primaryTicker: { code: '035420', name: 'NAVER' },
    sentimentTrend: trend([8, 10, 6, 14, 16, 20, 18], baseDate),
  },
  {
    id: 'n3',
    title: '폭염·에너지 효율 이슈에 에어컨 판매 “봄보다 빨리” 달아올라',
    summary:
      '유통 채널별 조기 물량 확보와 친환경·고효율 모델 수요가 겹치며 계절 가전 판매가 전년보다 빠르게 회복세를 보이고 있다.',
    body:
      '업계는 기상 이변과 전기요금 부담이 소비자의 구매 기준을 효율 등급·전력 소비 쪽으로 이동시켰다고 분석했다. 온라인몰을 중심으로 한 사전 예약 비중도 늘었다.',
    source: '조선일보',
    publishedAt: new Date(baseDate.getTime() - 5 * 86400000).toISOString(),
    imageUrl: 'https://picsum.photos/seed/mln3/120/80',
    sentimentScore: -6,
    coverage: {
      percent: 65,
      scopes: ['제목·리드', '본문 일부'],
      entitySummary: '언급 종목 6개 중 2개 엔티티 감성 스코어',
    },
    buzzScore: 41,
    primaryTicker: { code: '066570', name: 'LG전자' },
    sentimentTrend: trend([4, 2, -2, -4, -8, -5, -6], baseDate),
  },
  {
    id: 'n4',
    title: '하나은행·맥도날드코리아, ESG 연계 적금 상품 출시',
    summary:
      '친환경 캠페인 참여 실적을 금리 우대와 연계하는 적금형 상품이 나왔다. 젊은 층 대상 디지털 채널 중심으로 판매된다.',
    body:
      '은행 측은 ESG 활동 데이터를 단순 이벤트가 아닌 금융 혜택과 연결해 지속 참여를 유도한다는 전략이라고 설명했다.',
    source: '매일경제',
    publishedAt: new Date(baseDate.getTime() - 20 * 86400000).toISOString(),
    imageUrl: 'https://picsum.photos/seed/mln4/120/80',
    sentimentScore: 24,
    coverage: {
      percent: 79,
      scopes: ['제목·리드', '본문 요약', '인용문'],
      entitySummary: '언급 종목 3개 중 3개 엔티티 감성 스코어',
    },
    buzzScore: 33,
    primaryTicker: { code: '086790', name: '하나금융지주' },
    sentimentTrend: trend([10, 12, 15, 18, 20, 22, 24], baseDate),
  },
]
