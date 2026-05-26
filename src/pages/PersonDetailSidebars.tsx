import clsx from 'clsx'
import { memo } from 'react'
import { PersonFrequentStocksPanel } from '../components/person/PersonFrequentStocksPanel'
import { PersonTop5Panel } from '../components/person/PersonTop5Panel'
import type { PersonFrequentStock, PersonMentionsRange, PersonTopItem } from '../data/types/person'
import detailStyles from './PersonDetailPage.module.css'
import gridStyles from './personPageLayout.module.css'

interface PersonDetailLeftSidebarProps {
  items: PersonTopItem[]
  range: PersonMentionsRange
  onRangeChange: (range: PersonMentionsRange) => void
  showInitialLoading: boolean
}

interface PersonDetailRightSidebarProps {
  items: PersonFrequentStock[]
  range: PersonMentionsRange
  onRangeChange: (range: PersonMentionsRange) => void
  showInitialLoading: boolean
}

export const PersonDetailLeftSidebar = memo(function PersonDetailLeftSidebar({
  items,
  range,
  onRangeChange,
  showInitialLoading,
}: PersonDetailLeftSidebarProps) {
  return (
    <div className={detailStyles.detailLeftSticky}>
      <PersonTop5Panel
        items={items}
        range={range}
        onRangeChange={onRangeChange}
        loading={showInitialLoading}
      />
    </div>
  )
})

export const PersonDetailRightSidebar = memo(function PersonDetailRightSidebar({
  items,
  range,
  onRangeChange,
  showInitialLoading,
}: PersonDetailRightSidebarProps) {
  return (
    <aside className={detailStyles.detailRightPanel}>
      <PersonFrequentStocksPanel
        items={items}
        title="함께 언급된 종목"
        range={range}
        onRangeChange={onRangeChange}
        loading={showInitialLoading}
      />
    </aside>
  )
})

export const PersonTrackerLeftSidebar = memo(function PersonTrackerLeftSidebar(
  props: PersonDetailLeftSidebarProps,
) {
  return (
    <aside className={clsx(gridStyles.leftAside, gridStyles.sideSticky)}>
      <PersonTop5Panel
        items={props.items}
        range={props.range}
        onRangeChange={props.onRangeChange}
        loading={props.showInitialLoading}
      />
    </aside>
  )
})

export const PersonTrackerRightSidebar = memo(function PersonTrackerRightSidebar(
  props: PersonDetailRightSidebarProps,
) {
  return (
    <aside className={clsx(gridStyles.rightAside, gridStyles.sideSticky)}>
      <PersonFrequentStocksPanel
        items={props.items}
        range={props.range}
        onRangeChange={props.onRangeChange}
        loading={props.showInitialLoading}
      />
    </aside>
  )
})
