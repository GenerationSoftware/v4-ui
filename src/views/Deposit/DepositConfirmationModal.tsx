import { AmountBeingSwapped } from '@components/AmountBeingSwapped'
import { AnimatedBorderCard } from '@components/AnimatedCard'
import { InfoListHeader, ModalInfoList } from '@components/InfoList'
import { EstimatedDepositGasItems } from '@components/InfoList/EstimatedGasItem'
import { PrizePoolNetworkAPRItem } from '@components/InfoList/PrizePoolNetworkAPRItem'
import { TwabRewardsAprItem } from '@components/InfoList/TwabRewardsAprItem'
import { UpdatedPrizePoolNetworkOddsListItem } from '@components/InfoList/UpdatedPrizePoolNetworkOddsListItem'
import { UpdatedPrizePoolOddsListItem } from '@components/InfoList/UpdatedPrizePoolOddsListItem'
import { TxButton } from '@components/Input/TxButton'
import { TransactionReceiptButton } from '@components/TransactionReceiptButton'
import { TransactionTosDisclaimer } from '@components/TransactionTosDisclaimer'
import { TwitterIntentButton } from '@components/TwitterIntentButton'
import { EstimateAction } from '@constants/odds'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { usePrizePoolTicketDecimals } from '@hooks/v4/PrizePool/usePrizePoolTicketDecimals'
import { useSelectedPrizePoolTicket } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicket'
import { usePrizePoolNetworkTicketTotalSupply } from '@hooks/v4/PrizePoolNetwork/usePrizePoolNetworkTicketTotalSupply'
import { useTotalExpectedNumberOfPrizes } from '@hooks/v4/PrizePoolNetwork/useTotalExpectedNumberOfPrizes'
import { Amount, Token } from '@pooltogether/hooks'
import {
  ModalProps,
  Button,
  ButtonLink,
  ButtonSize,
  ButtonTheme,
  ModalTitle,
  BottomSheet
} from '@pooltogether/react-components'
import { msToS, numberWithCommas } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import {
  Transaction,
  TransactionStatus,
  useIsWalletMetamask,
  useWalletChainId
} from '@pooltogether/wallet-connection'
import { addDays } from '@utils/date'
import { getTimestampString } from '@utils/getTimestampString'
import { OddsDisclaimer } from '@views/Account/OddsDisclaimer'
import { ModalLoadingGate } from '@views/Deposit/ModalLoadingGate'
import { DepositLowAmountWarning } from '@views/DepositLowAmountWarning'
import { BigNumber } from 'ethers'
import { Trans, useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { ModalDepositGate } from './ModalDepositGate'

interface DepositConfirmationModalProps extends Omit<ModalProps, 'children'> {
  chainId: number
  token: Token
  ticket: Token
  amountToDeposit: Amount
  depositAllowanceUnformatted: BigNumber
  isDataFetched: boolean
  approveTx: Transaction
  depositTx: Transaction
  prizePool?: PrizePool
  sendApproveTx: () => void
  sendDepositTx: () => void
  resetState: () => void
}

export const DepositConfirmationModal = (props: DepositConfirmationModalProps) => {
  const {
    chainId,
    prizePool,
    token,
    ticket,
    amountToDeposit,
    depositAllowanceUnformatted,
    isDataFetched,
    approveTx,
    depositTx,
    isOpen,
    sendApproveTx,
    sendDepositTx,
    resetState,
    closeModal
  } = props

  const { t } = useTranslation()

  const depositTxCancelled = depositTx?.status === TransactionStatus.cancelled

  useEffect(() => {
    const approveTxIsComplete = approveTx?.status === TransactionStatus.success
    if (isOpen && approveTxIsComplete) {
      sendDepositTx()
    }
  }, [isOpen, approveTx])

  const amountUnformatted = amountToDeposit?.amountUnformatted
  const needsApproval = !!amountUnformatted && depositAllowanceUnformatted?.lt(amountUnformatted)

  const pendingTransaction =
    approveTx?.status === TransactionStatus.pendingBlockchainConfirmation ||
    approveTx?.status === TransactionStatus.pendingUserConfirmation ||
    depositTx?.status === TransactionStatus.pendingBlockchainConfirmation ||
    depositTx?.status === TransactionStatus.pendingUserConfirmation

  const bottomSheetProps = {
    label: t('confirmDepositModal', 'Confirm deposit - modal'),
    isOpen,
    closeModal,
    className: 'flex flex-col space-y-1 xs:space-y-2'
  }

  let content = null
  if (!isDataFetched) {
    content = (
      <>
        <ModalTitle chainId={chainId} title={t('loadingYourData', 'Loading your data')} />
        <ModalLoadingGate className='mt-8' />
      </>
    )
  } else if (pendingTransaction || depositTxCancelled) {
    content = (
      <>
        <ModalTitle
          chainId={chainId}
          title={t('completeYourDeposit', 'Complete your deposit')}
          className='pb-2'
        />
        <ModalDepositGate
          ticket={ticket}
          token={token}
          amountToDeposit={amountToDeposit}
          chainId={chainId}
          approveTx={approveTx}
          depositTx={depositTx}
          sendApproveTx={sendApproveTx}
          sendDepositTx={sendDepositTx}
          className='mt-8'
        />
      </>
    )
  } else if (depositTx?.status === TransactionStatus.error) {
    content = (
      <>
        <ModalTitle chainId={chainId} title={t('errorDepositing', 'Error depositing')} />
        <p className='my-2 text-accent-1 text-center mx-8'>😔 {t('ohNo', 'Oh no')}!</p>
        <p className='mb-8 text-accent-1 text-center mx-8'>
          {t(
            'somethingWentWrongWhileProcessingYourTransaction',
            'Something went wrong while processing your transaction.'
          )}
        </p>
        <Button
          theme={ButtonTheme.tealOutline}
          className='w-full'
          onClick={() => {
            resetState()
            closeModal()
          }}
        >
          {t('tryAgain', 'Try again')}
        </Button>
      </>
    )
  } else if (depositTx?.status === TransactionStatus.success) {
    bottomSheetProps.className = 'flex flex-col space-y-4'

    content = (
      <>
        <ModalTitle chainId={chainId} title={t('depositSubmitted', 'Deposit submitted')} />
        {prizePool && <CheckBackForPrizesBox />}
        <TweetAboutDeposit
          amountUnformatted={amountToDeposit?.amountUnformatted}
          prizePool={prizePool}
        />
        <TransactionReceiptButton className='mt-8 w-full' chainId={chainId} tx={depositTx} />
        <AccountPageButton />
        <AddTicketToWallet />
      </>
    )
  } else {
    content = (
      <>
        <ModalTitle chainId={chainId} title={t('depositConfirmation')} />
        <div className='w-full mx-auto mt-8 space-y-4'>
          <p className='text-center text-xxs xs:text-xs opacity-70'>
            <Trans
              i18nKey='checkDailyForMoreInfoSeeHere'
              components={{
                a: (
                  <a
                    href='https://docs.pooltogether.com/welcome/faq#prizes-and-winning'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-highlight-1 hover:opacity-70 transition-opacity'
                  />
                )
              }}
            />
          </p>
          <AmountBeingSwapped
            isSummary
            title={t('depositTicker', { ticker: token.symbol })}
            chainId={chainId}
            from={token}
            to={ticket}
            amountFrom={amountToDeposit}
            amountTo={amountToDeposit}
          />

          {prizePool && (
            <>
              <DepositLowAmountWarning chainId={chainId} amountToDeposit={amountToDeposit} />

              <ModalInfoList>
                {prizePool && (
                  <>
                    <InfoListHeader
                      className='mt-2'
                      textColorClassName='text-pt-purple-light'
                      label={t('estimatedStats', 'Estimated stats')}
                    />
                    <UpdatedPrizePoolOddsListItem
                      amount={amountToDeposit}
                      prizePool={prizePool}
                      action={EstimateAction.deposit}
                    />
                    <UpdatedPrizePoolNetworkOddsListItem
                      amount={amountToDeposit}
                      action={EstimateAction.deposit}
                      prizePool={prizePool}
                    />
                    <PrizePoolNetworkAPRItem />
                    <TwabRewardsAprItem />
                  </>
                )}
                <EstimatedDepositGasItems chainId={chainId} />
              </ModalInfoList>
            </>
          )}

          <TxButton
            className='mt-8 w-full'
            chainId={chainId}
            onClick={needsApproval ? sendApproveTx : sendDepositTx}
            state={depositTx?.state}
            status={depositTx?.status}
          >
            {t('confirmDeposit', 'Confirm deposit')}
          </TxButton>
          <TransactionTosDisclaimer buttonTexti18nKey='confirmDeposit' />
          <OddsDisclaimer
            textClassName='text-xxs opacity-70'
            linkClassName='text-pt-teal transition hover:opacity-70 underline ml-1'
          />
        </div>
      </>
    )
  }

  return <BottomSheet {...bottomSheetProps}>{content}</BottomSheet>
}

const CheckBackForPrizesBox = () => {
  const { t } = useTranslation()
  const eligibleDate = getTimestampString(msToS(addDays(new Date(), 2).getTime()))

  return (
    <AnimatedBorderCard className='flex flex-col text-center'>
      <div className='mb-2'>
        {t('disclaimerComeBackRegularlyToClaimWinnings', { date: eligibleDate })}
      </div>

      <a
        href='https://docs.pooltogether.com/welcome/faq#prizes-and-winning'
        target='_blank'
        rel='noopener noreferrer'
        className='underline text-xs'
      >
        {t('learnMore', 'Learn more')}
      </a>
    </AnimatedBorderCard>
  )
}

export const AccountPageButton = () => {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <Link href={{ pathname: '/account', query: router.query }}>
      <ButtonLink
        size={ButtonSize.md}
        theme={ButtonTheme.tealOutline}
        className='w-full text-center'
      >
        {t('viewAccount', 'View account')}
      </ButtonLink>
    </Link>
  )
}

export const AddTicketToWallet = () => {
  const { chainId: selectedChainId } = useSelectedChainId()
  const { data: ticket } = useSelectedPrizePoolTicket()
  const { t } = useTranslation()
  const isMetaMask = useIsWalletMetamask()
  const walletChainId = useWalletChainId()
  const isWalletOnProperNetwork = selectedChainId === walletChainId

  if (!isMetaMask || !isWalletOnProperNetwork) return null

  return (
    <Button theme={ButtonTheme.tealOutline} className='w-full'>
      {t('addTicketTokenToMetamask', {
        token: ticket.symbol
      })}
    </Button>
  )
}

export const TweetAboutDeposit = (props: {
  amountUnformatted: BigNumber
  prizePool: PrizePool
}) => {
  const { amountUnformatted, prizePool } = props
  const { data: decimals, isFetched: isDecimalsFetched } = usePrizePoolTicketDecimals(prizePool)
  const { totalAmountOfPrizes } = useTotalExpectedNumberOfPrizes()
  const { data: totalSupply, isFetched: isTotalSuppluFetched } =
    usePrizePoolNetworkTicketTotalSupply()
  const { t } = useTranslation()

  const isReady = isDecimalsFetched && !!totalAmountOfPrizes && isTotalSuppluFetched

  return (
    <TwitterIntentButton
      disabled={!isReady}
      url='https://app.pooltogether.com'
      text={t('depositTweet', {
        amountDeposited: `$${numberWithCommas(amountUnformatted, {
          decimals,
          precision: 0
        })}`,
        totalAmountDeposited: `$${totalSupply?.totalSupply.amountPretty}`,
        totalAmountOfPrizes
      })}
    />
  )
}
