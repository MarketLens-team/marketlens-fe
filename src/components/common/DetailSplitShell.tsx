import clsx from 'clsx'
import { useMemo, useState, type ReactNode } from 'react'
import {
  DetailAccordionSidebar,
  type DetailAccordionSidebarGroup,
  type DetailAccordionSidebarItem,
} from './DetailAccordionSidebar'
import styles from './DetailSplitShell.module.css'

type DetailSplitShellProps<TKey extends string> = {
  /** 아코디언 사이드바 그룹 정의 — `hideDetailSidebar`가 false일 때만 렌더 */
  groups?: DetailAccordionSidebarGroup<TKey>[]
  /** 기본 true. 좌측 DetailAccordionSidebar 숨김(컴포넌트·groups 데이터는 보존) */
  hideDetailSidebar?: boolean
  children: ReactNode
}

/** 사이드바 `groups`의 큰 그룹 1개에 대응하는 본문 영역. 나란히 두면 두 번째부터 위에 가로 구분선. */
export function DetailMainGroup({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section className={clsx(styles.mainGroup, className)} id={id}>
      <div className={styles.mainGroupInner}>{children}</div>
    </section>
  )
}

export function DetailMainGroupPlaceholder({ children }: { children: ReactNode }) {
  return <p className={styles.mainGroupPlaceholder}>{children}</p>
}

export function DetailSplitShell<TKey extends string>({
  groups = [],
  hideDetailSidebar = true,
  children,
}: DetailSplitShellProps<TKey>) {
  const [collapsedByGroup, setCollapsedByGroup] = useState<Record<TKey, boolean>>(() =>
    Object.fromEntries(groups.map((group, idx) => [group.key, idx !== 0])) as Record<TKey, boolean>,
  )

  const firstItemId = useMemo(() => groups.flatMap((g) => g.items)[0]?.id ?? '', [groups])
  const [activeItemId, setActiveItemId] = useState(firstItemId)

  const onToggleGroup = (key: TKey) => {
    setCollapsedByGroup((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const onSelectItem = (itemId: string, groupKey: TKey) => {
    setActiveItemId(itemId)
    setCollapsedByGroup((prev) => ({ ...prev, [groupKey]: false }))
  }

  const showDetailSidebar = !hideDetailSidebar && groups.length > 0

  return (
    <div className={styles.splitRoot}>
      <section className={clsx(styles.split, !showDetailSidebar && styles.splitNoSidebar)}>
        {showDetailSidebar ? (
          <DetailAccordionSidebar
            groups={groups}
            collapsedByGroup={collapsedByGroup}
            activeItemId={activeItemId}
            onToggleGroup={onToggleGroup}
            onSelectItem={onSelectItem}
          />
        ) : null}
        <div className={styles.content}>{children}</div>
      </section>
    </div>
  )
}

export type { DetailAccordionSidebarGroup, DetailAccordionSidebarItem }
