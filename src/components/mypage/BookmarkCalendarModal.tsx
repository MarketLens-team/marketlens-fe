import { Modal } from '../ui/Modal'
import type { MyPageBookmarkDateSummary } from '../../data/types/myPage'
import { BookmarkCalendar } from './BookmarkCalendar'
import styles from './BookmarkCalendarModal.module.css'

export interface BookmarkCalendarModalProps {
  isOpen: boolean
  onClose: () => void
  summaries: MyPageBookmarkDateSummary[]
  loading?: boolean
  onDateClick: (date: string) => void
}

export function BookmarkCalendarModal({
  isOpen,
  onClose,
  summaries,
  loading = false,
  onDateClick,
}: BookmarkCalendarModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="날짜별 보기"
      lockBackgroundScroll
      contentClassName={styles.content}
      contentClassOnly
    >
      {loading ? (
        <p className={styles.loadingHint} aria-busy="true">
          불러오는 중…
        </p>
      ) : (
        <BookmarkCalendar summaries={summaries} onDateClick={onDateClick} />
      )}
    </Modal>
  )
}
