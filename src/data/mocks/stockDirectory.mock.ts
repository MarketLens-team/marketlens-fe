import type { StockDirectory } from '../types/stockDirectory'

export const mockStockDirectory: StockDirectory = {
  sectors: [
    {
      sectorCode: 'semi',
      sectorName: '반도체',
      stocks: [
        { code: '005930', name: '삼성전자', market: 'KOSPI' },
        { code: '000660', name: 'SK하이닉스', market: 'KOSPI' },
        { code: '042700', name: '한미반도체', market: 'KOSDAQ' },
        { code: '357780', name: '솔브레인', market: 'KOSDAQ' },
        { code: '403870', name: 'HPSP', market: 'KOSDAQ' },
      ],
    },
    {
      sectorCode: 'auto',
      sectorName: '자동차',
      stocks: [
        { code: '005380', name: '현대차', market: 'KOSPI' },
        { code: '000270', name: '기아', market: 'KOSPI' },
        { code: '012330', name: '현대모비스', market: 'KOSPI' },
        { code: '018880', name: '한온시스템', market: 'KOSPI' },
        { code: '204320', name: '만도', market: 'KOSPI' },
      ],
    },
    {
      sectorCode: 'battery',
      sectorName: '2차전지',
      stocks: [
        { code: '373220', name: 'LG에너지솔루션', market: 'KOSPI' },
        { code: '006400', name: '삼성SDI', market: 'KOSPI' },
        { code: '247540', name: '에코프로비엠', market: 'KOSDAQ' },
        { code: '086520', name: '에코프로', market: 'KOSDAQ' },
        { code: '003670', name: '포스코퓨처엠', market: 'KOSPI' },
      ],
    },
    {
      sectorCode: 'bio',
      sectorName: '바이오',
      stocks: [
        { code: '207940', name: '삼성바이오로직스', market: 'KOSPI' },
        { code: '068270', name: '셀트리온', market: 'KOSPI' },
        { code: '326030', name: 'SK바이오팜', market: 'KOSPI' },
        { code: '145020', name: '휴젤', market: 'KOSPI' },
        { code: '196170', name: '알테오젠', market: 'KOSDAQ' },
      ],
    },
    {
      sectorCode: 'platform',
      sectorName: '플랫폼',
      stocks: [
        { code: '035420', name: 'NAVER', market: 'KOSPI' },
        { code: '035720', name: '카카오', market: 'KOSPI' },
        { code: '377300', name: '카카오페이', market: 'KOSPI' },
        { code: '263750', name: '펄어비스', market: 'KOSDAQ' },
        { code: '259960', name: '크래프톤', market: 'KOSPI' },
      ],
    },
    {
      sectorCode: 'ship',
      sectorName: '조선·방산',
      stocks: [
        { code: '010140', name: '삼성중공업', market: 'KOSPI' },
        { code: '042660', name: '한화오션', market: 'KOSPI' },
        { code: '009540', name: 'HD한국조선해양', market: 'KOSPI' },
        { code: '047810', name: '한국항공우주', market: 'KOSPI' },
        { code: '272210', name: '한화시스템', market: 'KOSPI' },
      ],
    },
  ],
}
