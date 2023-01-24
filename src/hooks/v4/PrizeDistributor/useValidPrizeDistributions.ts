import { PrizeDistributor } from '@pooltogether/v4-client-js'
import { useQuery } from 'react-query'
import { useValidDrawIds } from './useValidDrawIds'
import { useDrawBeaconPeriod } from '../PrizePoolNetwork/useDrawBeaconPeriod'

/**
 * Refetches when the draw beacon has updated
 * @returns all of the PrizeDistributions in the PrizeDistributionBuffer for the provided PrizeDistributor
 */
export const useValidPrizeDistributions = (prizeDistributor: PrizeDistributor) => {
  const { data: drawBeaconPeriod, isFetched: isDrawBeaconFetched } = useDrawBeaconPeriod()
  const { data, isFetched: isDrawIdsFetched } = useValidDrawIds(prizeDistributor)
  const enabled = isDrawBeaconFetched && isDrawIdsFetched && Boolean(prizeDistributor)
  const drawIds = data?.drawIds

  return useQuery(
    [
      'useValidPrizeDistributions',
      prizeDistributor?.id(),
      drawBeaconPeriod?.startedAtSeconds.toString()
    ],
    async () => {
      const validPrizeDistributions = await prizeDistributor.getPrizeDistributions(drawIds)
      return validPrizeDistributions
    },
    { enabled }
  )
}
