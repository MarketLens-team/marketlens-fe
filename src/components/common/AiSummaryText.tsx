import clsx from 'clsx'
import { splitIntoSentences } from '../../lib/splitIntoSentences'
import styles from './AiSummaryText.module.css'

export interface AiSummaryTextProps {
  text: string
  className?: string
  sentenceClassName?: string
}

export function AiSummaryText({ text, className, sentenceClassName }: AiSummaryTextProps) {
  const sentences = splitIntoSentences(text)

  return (
    <span className={clsx(styles.root, className)}>
      {sentences.map((sentence, index) => (
        <span key={index} className={clsx(styles.sentence, sentenceClassName)}>
          {sentence}
        </span>
      ))}
    </span>
  )
}
