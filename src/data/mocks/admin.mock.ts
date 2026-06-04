import type { AdminOverview, AdminStockRow, CrawlingLog } from '../types/admin'

export const mockAdminOverview: AdminOverview = {
  totalStocks: 1284,
  crawlingRunsToday: 42,
  failedRuns24h: 2,
  lastCrawlEndedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
}

export const mockAdminStocks: AdminStockRow[] = [
  {
    stockId: '1',
    stockCode: '005930',
    stockName: '삼성전자',
    market: 'KOSPI',
    deletedAt: null,
    lastNewsCrawledAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    stockId: '2',
    stockCode: '000660',
    stockName: 'SK하이닉스',
    market: 'KOSPI',
    deletedAt: null,
    lastNewsCrawledAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    stockId: '3',
    stockCode: '035420',
    stockName: 'NAVER',
    market: 'KOSPI',
    deletedAt: null,
    lastNewsCrawledAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  },
  {
    stockId: '4',
    stockCode: '999999',
    stockName: '(삭제된 종목 예시)',
    market: 'KOSPI',
    deletedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    lastNewsCrawledAt: null,
  },
]

export const mockCrawlingLogs: CrawlingLog[] = [
  {
    crawlingLogId: '101',
    startedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    endedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    totalCount: 1200,
    successCount: 1188,
    failCount: 12,
    status: 'SUCCESS',
    errorMessage: null,
  },
  {
    crawlingLogId: '102',
    startedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    endedAt: null,
    totalCount: 400,
    successCount: 210,
    failCount: 3,
    status: 'PARTIAL',
    errorMessage: null,
  },
  {
    crawlingLogId: '103',
    startedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    endedAt: new Date(Date.now() - 1000 * 60 * 118).toISOString(),
    totalCount: 800,
    successCount: 0,
    failCount: 800,
    status: 'FAIL',
    errorMessage: '429 Too Many Requests',
  },
  {
    crawlingLogId: '104',
    startedAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    endedAt: new Date(Date.now() - 1000 * 60 * 195).toISOString(),
    totalCount: 500,
    successCount: 480,
    failCount: 20,
    status: 'PARTIAL',
    errorMessage: '일부 소스 타임아웃',
  },
]
