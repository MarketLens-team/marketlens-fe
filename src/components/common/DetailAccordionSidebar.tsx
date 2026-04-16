import styles from './DetailAccordionSidebar.module.css'

export type DetailAccordionSidebarItem = {
  id: string
  label: string
}

export type DetailAccordionSidebarGroup<TKey extends string = string> = {
  key: TKey
  section: string
  icon?: string
  items: DetailAccordionSidebarItem[]
}

interface DetailAccordionSidebarProps<TKey extends string> {
  groups: DetailAccordionSidebarGroup<TKey>[]
  collapsedByGroup: Record<TKey, boolean>
  activeItemId: string
  onToggleGroup: (key: TKey) => void
  onSelectItem: (itemId: string, groupKey: TKey) => void
}

export function DetailAccordionSidebar<TKey extends string>({
  groups,
  collapsedByGroup,
  activeItemId,
  onToggleGroup,
  onSelectItem,
}: DetailAccordionSidebarProps<TKey>) {
  return (
    <aside className={styles.sidebar}>
      {groups.map((group) => (
        <div key={group.section} className={styles.group}>
          <button
            type="button"
            className={styles.groupToggle}
            onClick={() => onToggleGroup(group.key)}
            aria-expanded={!collapsedByGroup[group.key]}
          >
            <span className={styles.groupHead}>
              {group.icon ? (
                <span className={styles.groupIcon} aria-hidden>
                  {group.icon}
                </span>
              ) : null}
              {group.section}
            </span>
            <span className={styles.chevron}>{collapsedByGroup[group.key] ? '▸' : '▾'}</span>
          </button>

          {!collapsedByGroup[group.key] ? (
            <div className={styles.menuRail}>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === activeItemId ? styles.itemActive : styles.item}
                  onClick={() => onSelectItem(item.id, group.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </aside>
  )
}

