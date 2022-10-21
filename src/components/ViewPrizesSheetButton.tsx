import { Token } from '@pooltogether/hooks'
import { Button, ButtonSize, ButtonTheme } from '@pooltogether/react-components'
import { PrizeTier } from '@pooltogether/v4-client-js'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { PrizeBreakdownModal } from './PrizeBreakdownModal'

interface ViewPrizesSheetTriggerProps {
  ticket: Token
  Button: React.FC<TriggerButtonProps>
  children?: React.ReactNode
  label?: string
  prizeTier?: PrizeTier
  className?: string
}

interface TriggerButtonProps {
  onClick: () => void
  disabled: boolean
  className?: string
  children: React.ReactNode
}

export const ViewPrizesSheetCustomTrigger = (props: ViewPrizesSheetTriggerProps) => {
  const { children, prizeTier, label, Button } = props
  const [isOpen, setIsOpen] = useState(false)

  const { t } = useTranslation()

  return (
    <>
      <Button className={props.className} onClick={() => setIsOpen(true)} disabled={!prizeTier}>
        {children || label || t('viewPrizes')}
      </Button>

      <PrizeBreakdownModal
        {...props}
        prizeTier={prizeTier}
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
      />
    </>
  )
}

export const ViewPrizesSheetButton = (props: Omit<ViewPrizesSheetTriggerProps, 'Button'>) => (
  <ViewPrizesSheetCustomTrigger
    {...props}
    Button={(props: TriggerButtonProps) => (
      <Button {...props} theme={ButtonTheme.tealOutline} size={ButtonSize.sm} />
    )}
  />
)

ViewPrizesSheetCustomTrigger.defaultProps = {
  className:
    'uppercase font-bold text-xxs sm:text-xs text-highlight-9 hover:text-inverse transition leading-none tracking-wide'
}
