import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useAllChainsFilteredPromotions } from '@hooks/v4/TwabRewards/useAllChainsFilteredPromotions'
import { usePromotionVAPR } from '@hooks/v4/TwabRewards/usePromotionVAPR'
import { Promotion } from '@interfaces/promotions'
import { TokenIcon } from '@pooltogether/react-components'
import { numberWithCommas } from '@pooltogether/utilities'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { InfoListItem } from '.'

/**
 *
 * @param props
 * @returns
 */
export const TwabRewardsAprItem: React.FC<{
  labelClassName?: string
  valueClassName?: string
}> = (props) => {
  const { labelClassName, valueClassName } = props

  const { t } = useTranslation()

  const prizePool = useSelectedPrizePool()

  const promotionsQueryResults = useAllChainsFilteredPromotions()
  const isFetched = promotionsQueryResults.every((queryResult) => queryResult.isFetched)

  const chainPromotions = promotionsQueryResults?.find(
    (result) => result.data?.chainId === prizePool.chainId
  )?.data?.promotions

  const atLeastOnePromotionActive = chainPromotions?.some((promotion) => !promotion.isComplete)

  const value = (
    <ul className='flex flex-col space-y-1'>
      {chainPromotions?.map((promotion) => (
        <PromotionsVapr key={`promotion-${promotion.id}`} promotion={promotion} />
      ))}
    </ul>
  )

  if (!atLeastOnePromotionActive) {
    return null
  }

  return (
    <InfoListItem
      labelClassName={classNames(labelClassName)}
      valueClassName={valueClassName}
      label={
        <div className='inline-flex space-x-1 items-center'>
          <span className='text-flashy'>{t('bonusRewards')}</span>
          <img className='w-4 h-4 ml-1' src='/beach-with-umbrella.png' />
        </div>
      }
      labelToolTip={t(
        'rewardsVaprDescription',
        'Rewards vAPR is the variable annual rate of return on your deposit in the form of rewards, based on the total value of deposits on this chain'
      )}
      tooltipId='rewardsVaprDescription'
      loading={!isFetched}
      // labelLink='https://docs.pooltogether.com/welcome/faq#what-is-the-prize-apr'
      value={value}
    />
  )
}

export const PromotionsVapr: React.FC<{ promotion: Promotion }> = (props) => {
  const { promotion } = props
  const vapr = usePromotionVAPR(promotion)

  if (vapr <= 0) return null

  return (
    <li className='flex items-center'>
      <div className='inline-flex items-center space-x-1'>
        <span>{numberWithCommas(vapr)}%</span>
        <TokenIcon chainId={promotion.chainId} address={promotion.token} sizeClassName='w-4 h-4' />
        <span>vAPR</span>
      </div>
    </li>
  )
}

TwabRewardsAprItem.defaultProps = {
  labelClassName: '',
  valueClassName: ''
}
