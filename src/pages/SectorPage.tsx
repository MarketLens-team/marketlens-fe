import { Layout } from '../components/common/Layout'
import { DetailSplitShell, type DetailAccordionSidebarGroup } from '../components/common/DetailSplitShell'
import { PageHeader } from '../components/common/PageHeader'

type SectorSidebarKey = 'overview' | 'analysis' | 'news'

const sectorSidebarGroups: DetailAccordionSidebarGroup<SectorSidebarKey>[] = [
  {
    key: 'overview',
    section: '개요',
    icon: '📊',
    items: [
      { id: 'sector-overview', label: '섹터 개요' },
      { id: 'sector-ranking', label: '섹터 랭킹' },
    ],
  },
  {
    key: 'analysis',
    section: '분석',
    icon: '🧭',
    items: [
      { id: 'sector-sentiment', label: '감성 흐름' },
      { id: 'sector-buzz', label: '버즈 변화' },
    ],
  },
  {
    key: 'news',
    section: '뉴스',
    icon: '📰',
    items: [{ id: 'sector-news', label: '섹터 뉴스' }],
  },
]

export default function SectorPage() {
  return (
    <Layout hideSidebar>
      <DetailSplitShell groups={sectorSidebarGroups}>
        <PageHeader title="섹터" description="섹터 화면은 다음 단계에서 연결 예정입니다." />
      </DetailSplitShell>
    </Layout>
  )
}
