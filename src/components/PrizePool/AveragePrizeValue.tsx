import { usePrizePoolExpectedPrizes } from '@hooks/v4/PrizePool/usePrizePoolExpectedPrizes'
import { PrizePool } from '@pooltogether/v4-client-js'

/**
 * TODO: Change based on currency selected
 * @param props
 * @returns
 */
export const AveragePrizeValue = (props: { prizePool: PrizePool }) => {
  const { prizePool } = props
  const { data, isFetched } = usePrizePoolExpectedPrizes(prizePool)
  return isFetched ? <>${data?.averagePrizeValue.amountPretty}</> : null
}
