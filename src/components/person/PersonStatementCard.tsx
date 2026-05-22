import clsx from 'clsx'
import { Link } from 'react-router-dom'
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
  /** 인물 상세 — 프로필 헤더 생략, 발언 본문만 */
  variant?: 'full' | 'feed'
}

export function PersonStatementCard({ mention, variant = 'full' }: PersonStatementCardProps) {
  const tone = personSentimentToneClass(mention.sentiment)
  const isFeed = variant === 'feed'
  const roleLabel = formatPersonRole(mention.organizationName, mention.role)
  const timeLabel = formatRelativeTimeKo(mention.publishedAt)
  const sentimentLabel = formatPersonSentimentBadge(mention.sentiment, mention.sentimentScore)

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

  return (
    <article className={styles.timeline}>
      <div className={styles.rail}>
        <EntityAvatar
          variant="person"
          size="md"
          name={mention.personName}
          imageUrl={mention.imageUrl}
          className={styles.avatar}
        />
      </div>

      <div className={styles.timelineBody}>
        <header className={styles.timelineHead}>
          <div className={styles.identity}>
            <p className={styles.name}>
              <Link to={`/person/${mention.personId}`} className={styles.nameLink}>
                {mention.personName}
              </Link>
            </p>
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
        </header>

        <blockquote className={styles.statement}>
          <AiSummaryText text={mention.context} className={styles.statementText} />
        </blockquote>
      </div>
    </article>
  )
}
