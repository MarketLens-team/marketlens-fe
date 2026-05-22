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
  /** 인물 상세 등 — 프로필 헤더 생략, 발언 본문만 */
  variant?: 'full' | 'feed'
}

export function PersonStatementCard({ mention, variant = 'full' }: PersonStatementCardProps) {
  const tone = personSentimentToneClass(mention.sentiment)
  const isFeed = variant === 'feed'

  return (
    <article className={clsx(styles.card, isFeed && styles.cardFeed)}>
      {isFeed ? (
        <header className={styles.feedHeader}>
          <p className={styles.feedMeta}>
            {mention.sourceName} · {formatRelativeTimeKo(mention.publishedAt)}
          </p>
          <span className={clsx(styles.sentScore, SENTIMENT_SCORE_CLASS[tone])}>
            {formatPersonSentimentBadge(mention.sentiment, mention.sentimentScore)}
          </span>
        </header>
      ) : (
        <header className={styles.header}>
          <div className={styles.profile}>
            <EntityAvatar
              variant="person"
              size="lg"
              name={mention.personName}
              imageUrl={mention.imageUrl}
            />
            <div className={styles.identity}>
              <p className={styles.name}>
                <Link to={`/person/${mention.personId}`} className={styles.nameLink}>
                  {mention.personName}
                </Link>
              </p>
              <p className={styles.role}>
                {formatPersonRole(mention.organizationName, mention.role)}
              </p>
              <p className={styles.meta}>
                {mention.sourceName} · {formatRelativeTimeKo(mention.publishedAt)}
              </p>
            </div>
          </div>
          <span className={clsx(styles.sentScore, SENTIMENT_SCORE_CLASS[tone])}>
            {formatPersonSentimentBadge(mention.sentiment, mention.sentimentScore)}
          </span>
        </header>
      )}

      <blockquote className={styles.quote}>
        <AiSummaryText text={mention.context} className={styles.quoteText} />
      </blockquote>
    </article>
  )
}
