import clsx from 'clsx'
import { useState } from 'react'
import { getPersonInitials, getStockInitial } from '../../lib/entityInitials'
import { resolveImageUrl } from '../../lib/normalizeImageUrl'
import styles from './EntityAvatar.module.css'

export type EntityAvatarVariant = 'stock' | 'person'
export type EntityAvatarSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_CLASS: Record<EntityAvatarSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
}

export interface EntityAvatarProps {
  variant: EntityAvatarVariant
  name: string
  imageUrl?: string | null
  size?: EntityAvatarSize
  className?: string
}

export function EntityAvatar({
  variant,
  name,
  imageUrl,
  size = 'md',
  className,
}: EntityAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const label = variant === 'person' ? getPersonInitials(name) : getStockInitial(name)
  const px = size === 'sm' ? 32 : size === 'md' ? 40 : size === 'lg' ? 56 : 64
  const src = resolveImageUrl(imageUrl)

  return (
    <span
      className={clsx(
        styles.root,
        variant === 'stock' ? styles.variantStock : styles.variantPerson,
        SIZE_CLASS[size],
        className,
      )}
      aria-hidden
    >
      {src && !imgFailed ? (
        <img
          className={clsx(styles.img, variant === 'stock' ? styles.imgStock : styles.imgPerson)}
          src={src}
          alt=""
          width={px}
          height={px}
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        label
      )}
    </span>
  )
}
