import clsx from 'clsx'
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
}

export function PersonStatementCard({ mention }: PersonStatementCardProps) {
  const tone = personSentimentToneClass(mention.sentiment)

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.profile}>
          <EntityAvatar
            variant="person"
            size="lg"
            name={mention.personName}
            imageUrl={mention.imageUrl}
          />
          <div className={styles.identity}>
            <p className={styles.name}>{mention.personName}</p>
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

      <blockquote className={styles.quote}>
        <AiSummaryText text={mention.context} className={styles.quoteText} />
      </blockquote>
    </article>
  )
}
