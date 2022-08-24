import { ExpectedPrizeBreakdown } from '@components/ExpectedPrizeBreakdown'
import {
  TokenAmountFormValues,
  TokenAmountInputFormView
} from '@components/ModalViews/TokenAmountInputFormView'
import { TransparentDiv } from '@components/TransparentDiv'
import { useDepositValidationRules } from '@hooks/v4/PrizePool/useDepositValidationRules'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { Amount } from '@pooltogether/hooks'
import { ViewProps } from '@pooltogether/react-components'
import { Transaction } from '@pooltogether/wallet-connection'
import { getAmountFromString } from '@utils/getAmountFromString'
import { DepositInfoBox } from './DepositInfoBox'
import { PrizeBreakdownCard } from './PrizeBreakdownCard'

/**
 * Handles passing default values to the TokenAmountInputFormView for depositing into V4 prize pools.
 * @param props
 * @returns
 */
export const DepositView: React.FC<
  {
    depositAmount: Amount
    setDepositAmount: (amount: Amount) => void
    transaction?: Transaction
    formKey: string
    connectWallet?: () => void
    onSubmit?: () => void
  } & ViewProps
> = (props) => {
  const {
    depositAmount,
    setDepositAmount,
    transaction,
    formKey,
    connectWallet,
    onSubmit,
    ...remainingProps
  } = props
  const prizePool = useSelectedPrizePool()
  const { data: tokens } = useSelectedPrizePoolTokens()

  return (
    <TokenAmountInputFormView
      {...remainingProps}
      formKey={formKey}
      connectWallet={connectWallet}
      useValidationRules={() => useDepositValidationRules(prizePool)}
      handleSubmit={(values: TokenAmountFormValues) => {
        setDepositAmount(getAmountFromString(values[formKey], tokens?.token.decimals))
        onSubmit?.()
      }}
      carouselChildren={[
        <DepositInfoBox
          key='deposit-info-box'
          formKey={formKey}
          transaction={transaction}
          bgClassName='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 transition-opacity'
          errorBgClassName='bg-white bg-opacity-10 dark:bg-actually-black dark:bg-opacity-30 transition-opacity'
        />,
        <TransparentDiv
          key='expected-prize-breakdown'
          className='px-4 py-2 overflow-y-auto rounded-lg minimal-scrollbar max-h-48'
        >
          <ExpectedPrizeBreakdown className='mx-auto' />
        </TransparentDiv>
      ]}
      chainId={prizePool.chainId}
      token={tokens?.token}
      defaultValue={depositAmount?.amount}
    />
  )
}
