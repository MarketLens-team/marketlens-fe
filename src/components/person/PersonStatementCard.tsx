import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { AiSummaryText } from '../common/AiSummaryText'
import type { PersonMention } from '../../data/types/person'
import { formatRelativeTimeKo } from '../../lib/formatRelativeTime'
import {
  formatPersonRole,
  formatPersonSentimentBadge,
  getPersonInitials,
  personSentimentToneClass,
  type PersonSentimentTone,
} from './personDisplay'
import styles from './PersonStatementCard.module.css'

const SENTIMENT_CLASS: Record<PersonSentimentTone, string> = {
  pos: styles.sentiment_pos,
  neu: styles.sentiment_neu,
  neg: styles.sentiment_neg,
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
          <span className={styles.avatar} aria-hidden>
            {getPersonInitials(mention.personName)}
          </span>
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
        <span className={clsx(styles.sentiment, SENTIMENT_CLASS[tone])}>
          {formatPersonSentimentBadge(mention.sentiment, mention.sentimentScore)}
        </span>
      </header>

      <blockquote className={styles.quote}>
        <AiSummaryText text={mention.context} className={styles.quoteText} />
      </blockquote>

      {mention.relatedStocks.length > 0 ? (
        <footer className={styles.footer}>
          <span className={styles.footerLabel}>연관 종목</span>
          <div className={styles.tags}>
            {mention.relatedStocks.map((stock) => (
              <Link key={stock.code} className={styles.tag} to={`/stock/${stock.code}`}>
                #{stock.name}
              </Link>
            ))}
          </div>
        </footer>
      ) : null}
    </article>
  )
}
