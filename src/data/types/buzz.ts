export interface BuzzAlert {
  id: string
  topic: string
  spikeScore: number
  /** ISO 8601 */
  detectedAt: string
  relatedStocks: string[]
}
