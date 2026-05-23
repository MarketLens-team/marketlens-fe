import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { buildPersonDetailPath } from '../../lib/buildPersonRoute'
import { AiSummaryText } from '../common/AiSummaryText'
import type { PersonMention } from '../../data/types/person'
import { formatRelativeTimeKo } from '../../lib/formatRelativeTime'
import { EntityAvatar } from '../ui/EntityAvatar'
import {
  formatPersonRole,
  formatPersonSentimentBadge,
  personSentimentToneClass,
  type PersonSentimentTone,
} from './personDisplay'
import styles from './PersonStatementCard.module.css'

const SENTIMENT_SCORE_CLASS: Record<PersonSentimentTone, string> = {
  pos: styles.sentPos,
  neu: styles.sentNeu,
  neg: styles.sentNeg,
}

interface PersonStatementCardProps {
  mention: PersonMention
  /** full: 트래커 타임라인 · feed: 상세 카드형 · detailFeed: 상세 고정 프로필 아래 발언만 */
  variant?: 'full' | 'feed' | 'detailFeed'
  /** 검색 `?statementId=` 진입 시 본문 초록 강조 */
  highlighted?: boolean
}

export function PersonStatementCard({
  mention,
  variant = 'full',
  highlighted = false,
}: PersonStatementCardProps) {
  const tone = personSentimentToneClass(mention.sentiment)
  const isFeed = variant === 'feed'
  const isDetailFeed = variant === 'detailFeed'
  const roleLabel = formatPersonRole(mention.organizationName, mention.role)
  const timeLabel = formatRelativeTimeKo(mention.publishedAt)
  const sentimentLabel = formatPersonSentimentBadge(mention.sentiment, mention.sentimentScore)

  if (isDetailFeed) {
    return (
      <article className={clsx(styles.detailFeed, highlighted && styles.detailFeedFocused)}>
        <p className={styles.metaRow}>
          <span className={styles.metaTime}>{timeLabel}</span>
          <span className={styles.metaDot} aria-hidden>
            ·
          </span>
          <span className={clsx(styles.sentInline, SENTIMENT_SCORE_CLASS[tone])}>{sentimentLabel}</span>
        </p>
        <blockquote className={styles.statement}>
          <AiSummaryText text={mention.context} className={styles.statementText} />
        </blockquote>
      </article>
    )
  }

  if (isFeed) {
    return (
      <article className={clsx(styles.card, styles.cardFeed)}>
        <header className={styles.feedHeader}>
          <p className={styles.feedMeta}>{timeLabel}</p>
          <span className={clsx(styles.sentScore, SENTIMENT_SCORE_CLASS[tone])}>{sentimentLabel}</span>
        </header>
        <blockquote className={styles.quote}>
          <AiSummaryText text={mention.context} className={styles.quoteText} />
        </blockquote>
      </article>
    )
  }

  const personHref = buildPersonDetailPath(mention.personId, { statementId: mention.id })

  return (
    <article className={styles.timeline}>
      <Link
        to={personHref}
        className={clsx(styles.timelineLink, highlighted && styles.timelineLinkFocusedFromSearch)}
        aria-label={`${mention.personName} 인물 상세`}
      >
        <div className={styles.rail}>
          <EntityAvatar
            variant="person"
            size="md"
            name={mention.personName}
            imageUrl={mention.imageUrl}
            className={styles.avatar}
          />
        </div>

        <div className={styles.bodyCol}>
          <div className={styles.identity}>
            <p className={styles.name}>{mention.personName}</p>
            {roleLabel ? <p className={styles.role}>{roleLabel}</p> : null}
            <p className={styles.metaRow}>
              <span className={styles.metaTime}>{timeLabel}</span>
              <span className={styles.metaDot} aria-hidden>
                ·
              </span>
              <span className={clsx(styles.sentInline, SENTIMENT_SCORE_CLASS[tone])}>
                {sentimentLabel}
              </span>
            </p>
          </div>

          <blockquote className={styles.statement}>
            <AiSummaryText text={mention.context} className={styles.statementText} />
          </blockquote>
        </div>
      </Link>
    </article>
  )
}
