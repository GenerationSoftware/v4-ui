import { Amount } from '@pooltogether/hooks'
import { useTranslation } from 'next-i18next'
import { CurrencyValue } from './CurrencyValue'

export const AmountInPrizes = (props: {
  amount: Amount
  className?: string
  numberClassName?: string
  textClassName?: string
}) => {
  const { amount, className, numberClassName, textClassName } = props
  const { t } = useTranslation()

  if (!amount) {
    return null
  }

  return (
    <div className={className}>
      <span className={numberClassName}>
        <CurrencyValue baseValue={amount.amount} />
      </span>
      <span className={textClassName}>{t('inPrizes', 'in prizes')}</span>
    </div>
  )
}

AmountInPrizes.defaultProps = {
  numberClassName: 'font-bold text-inverse text-xs xs:text-sm',
  textClassName: 'font-bold text-inverse text-xxs xs:text-xs ml-1 opacity-60'
}
