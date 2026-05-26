import clsx from 'clsx'
import { memo } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../common/EmptyState'
import { EntityAvatar } from '../ui/EntityAvatar'
import type { StockDetail } from '../../data/types/stock'
import { buildPersonDetailPath } from '../../lib/buildPersonRoute'
import { formatStockScore } from './stockScore'
import styles from './StockDetailContent.module.css'

type PeopleTimeline = StockDetail['peopleTimeline']

interface StockDetailPeoplePanelProps {
  peopleTimeline: PeopleTimeline
  pillClass: (score: number) => string
}

export const StockDetailPeoplePanel = memo(function StockDetailPeoplePanel({
  peopleTimeline,
  pillClass,
}: StockDetailPeoplePanelProps) {
  return (
    <div className={styles.rightStack}>
      <section
        className={clsx(styles.panel, styles.peoplePanel)}
        aria-labelledby="stock-people-title"
      >
        <div className={styles.peoplePanelBody}>
          <h2 id="stock-people-title" className={styles.peoplePanelTitle}>
            최신 인물 발언 타임라인
          </h2>
          <ul className={styles.peopleTimelineList}>
            {peopleTimeline.length === 0 ? (
              <li className={styles.peopleTimelineItem}>
                <EmptyState
                  className={styles.emptyPeople}
                  title="발언이 없어요"
                  message="이 종목과 연결된 인물 발언이 아직 없습니다."
                />
              </li>
            ) : (
              peopleTimeline.map((person) => (
                <li key={person.id} className={styles.peopleTimelineItem}>
                  <Link
                    to={buildPersonDetailPath(person.personId, { statementId: person.id })}
                    className={styles.personTimelineItemLink}
                    aria-label={`${person.personName} 발언 상세`}
                  >
                    <div className={styles.personTimelineRail}>
                      <EntityAvatar
                        className={styles.personTimelineAvatar}
                        variant="person"
                        size="md"
                        name={person.personName}
                        imageUrl={person.imageUrl}
                      />
                      <span
                        className={clsx(
                          styles.personTimelineTime,
                          person.isFresh
                            ? styles.personTimelineTimeFresh
                            : styles.personTimelineTimeMuted,
                        )}
                      >
                        {person.relativeLabel}
                      </span>
                    </div>
                    <div className={styles.personTimelineBody}>
                      <p className={styles.personTimelineHeadline}>{person.summary}</p>
                      <p className={styles.personTimelineMeta}>
                        <span className={styles.personTimelineName}>{person.personName}</span>
                        <span aria-hidden> · </span>
                        <span>{person.role}</span>
                        <span
                          className={clsx(
                            styles.personTimelineScore,
                            styles.mono,
                            pillClass(person.sentimentScore),
                          )}
                        >
                          {formatStockScore(person.sentimentScore)}
                        </span>
                      </p>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  )
})
