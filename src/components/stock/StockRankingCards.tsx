import type { StockRankings, StockRankingCategory } from '../../data/types/stock'
import {
  StockRankingCard,
  type StockRankingMetric,
} from './StockRankingCard'
import styles from './StockRankingCards.module.css'

interface RankingCardConfig {
  category: StockRankingCategory
  title: string
  metric: StockRankingMetric
}

const CARD_CONFIG: RankingCardConfig[] = [
  { category: 'topMentionCount', title: '언급량 TOP', metric: 'mention' },
  { category: 'topSentimentScore', title: '감성 TOP', metric: 'sentiment' },
  { category: 'topChangeRate', title: '급등 TOP', metric: 'change' },
]

interface StockRankingCardsProps {
  rankings: StockRankings
  onMoreClick?: (category: StockRankingCategory) => void
}

export function StockRankingCards({ rankings, onMoreClick }: StockRankingCardsProps) {
  return (
    <section className={styles.grid} aria-label="종목 랭킹">
      {CARD_CONFIG.map((config) => (
        <StockRankingCard
          key={config.category}
          title={config.title}
          items={rankings[config.category]}
          metric={config.metric}
          onMoreClick={onMoreClick ? () => onMoreClick(config.category) : undefined}
        />
      ))}
    </section>
  )
}

export function rankingCategoryToSortKey(
  category: StockRankingCategory,
): 'mention' | 'sentiment' | 'change' {
  const config = CARD_CONFIG.find((item) => item.category === category)
  return config?.metric ?? 'mention'
}
