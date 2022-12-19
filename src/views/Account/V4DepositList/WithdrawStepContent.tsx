import { AmountBeingSwapped } from '@components/AmountBeingSwapped'
import { DownArrow as DefaultDownArrow } from '@components/DownArrow'
import { InfoListItem, ModalInfoList } from '@components/InfoList'
import { EstimatedWithdrawalGasItem } from '@components/InfoList/EstimatedGasItem'
import { MaxAmountTextInputRightLabel } from '@components/Input/MaxAmountTextInputRightLabel'
import { TextInputGroup } from '@components/Input/TextInputGroup'
import { RectangularInput } from '@components/Input/TextInputs'
import { TxButton } from '@components/Input/TxButton'
import { TokenSymbolAndIcon } from '@components/TokenSymbolAndIcon'
import { TransparentDiv } from '@components/TransparentDiv'
import { parseUnits } from '@ethersproject/units'
import { useHasUserCheckedAllDraws } from '@hooks/v4/PrizeDistributor/useHasUserCheckedAllDraws'
import { usePrizeDistributorByChainId } from '@hooks/v4/PrizeDistributor/usePrizeDistributorByChainId'
import { Amount, TokenWithBalance, TokenWithUsdBalance } from '@pooltogether/hooks'
import {
  Button,
  ButtonTheme,
  Tooltip,
  ErrorsBox,
  ButtonLink,
  ButtonSize
} from '@pooltogether/react-components'
import { getMaxPrecision, numberWithCommas } from '@pooltogether/utilities'
import { getAmount } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import { Transaction, useUsersAddress } from '@pooltogether/wallet-connection'
import classnames from 'classnames'
import { ethers } from 'ethers'
import FeatherIcon from 'feather-icons-react'
import { t } from 'i18next'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React from 'react'
import { FieldValues, UseFormReturn } from 'react-hook-form'
import { WithdrawalSteps } from './WithdrawView'

const WITHDRAW_QUANTITY_KEY = 'withdrawal-quantity'

interface WithdrawStepContentProps {
  form: UseFormReturn<FieldValues, object>
  currentStep: WithdrawalSteps
  prizePool: PrizePool
  usersBalances: {
    ticket: TokenWithUsdBalance
    token: TokenWithUsdBalance
  }
  withdrawTx: Transaction
  amountToWithdraw: Amount
  sendWithdrawTx: () => Promise<void>
  setWithdrawTxId: (txId: string) => void
  setCurrentStep: (step: WithdrawalSteps) => void
  setAmountToWithdraw: (amount: Amount) => void
  refetchBalances: () => void
}

export const WithdrawStepContent = (props: WithdrawStepContentProps) => {
  const {
    form,
    prizePool,
    usersBalances,
    currentStep,
    amountToWithdraw,
    withdrawTx,
    sendWithdrawTx,
    setWithdrawTxId,
    setCurrentStep,
    setAmountToWithdraw,
    refetchBalances
  } = props

  const { ticket, token } = usersBalances
  const chainId = prizePool.chainId

  if (currentStep === WithdrawalSteps.review) {
    return (
      <WithdrawReviewStep
        prizePool={prizePool}
        chainId={chainId}
        amountToWithdraw={amountToWithdraw}
        token={token}
        ticket={ticket}
        tx={withdrawTx}
        sendWithdrawTx={sendWithdrawTx}
        setCurrentStep={setCurrentStep}
        setTxId={setWithdrawTxId}
        refetchBalances={refetchBalances}
      />
    )
  }

  return (
    <WithdrawInputStep
      chainId={chainId}
      form={form}
      token={token}
      ticket={ticket}
      setCurrentStep={setCurrentStep}
      setAmountToWithdraw={setAmountToWithdraw}
    />
  )
}

interface WithdrawInputStepProps {
  chainId: number
  form: UseFormReturn<FieldValues, object>
  token: TokenWithBalance
  ticket: TokenWithBalance
  setCurrentStep: (step: WithdrawalSteps) => void
  setAmountToWithdraw: (amount: Amount) => void
}

/**
 * The first step in the withdrawal flow.
 * The user can input an amount & continue to the review page.
 * @param {*} props
 * @returns
 */
const WithdrawInputStep = (props: WithdrawInputStepProps) => {
  const { chainId, form, token, ticket, setCurrentStep, setAmountToWithdraw } = props

  const { t } = useTranslation()

  const {
    handleSubmit,
    formState: { isValid, isDirty, errors },
    watch
  } = form

  const amount = watch(WITHDRAW_QUANTITY_KEY)

  const onSubmit = (data) => {
    const amount = data[WITHDRAW_QUANTITY_KEY]
    setAmountToWithdraw(getAmount(amount, token.decimals))
    setCurrentStep(WithdrawalSteps.review)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <WithdrawForm chainId={chainId} form={form} token={token} ticket={ticket} />

      <DownArrow />

      <SquaredTokenAmountContainer chainId={chainId} amount={amount} token={token} />

      <ErrorsBox
        errors={
          isDirty && !!errors
            ? Object.values(errors).map((e) => (typeof e.message === 'string' ? e.message : null))
            : []
        }
        className='opacity-75'
      />

      <WithdrawWarning className='mt-2' />

      <Button disabled={!isValid && isDirty} type='submit' className='w-full mt-8'>
        {t('reviewWithdrawal')}
      </Button>
    </form>
  )
}

interface WithdrawReviewStepProps {
  prizePool: PrizePool
  chainId: number
  amountToWithdraw: Amount
  token: TokenWithBalance
  ticket: TokenWithBalance
  tx: Transaction
  sendWithdrawTx: (e: any) => Promise<void>
  setCurrentStep: (step: WithdrawalSteps) => void
  setTxId: (txId: string) => void
  refetchBalances: () => void
}

/**
 * The second step in the withdrawal flow.
 * The user can review their amount & send the transaction to their wallet.
 * @param {*} props
 * @returns
 */
const WithdrawReviewStep = (props: WithdrawReviewStepProps) => {
  const { prizePool, amountToWithdraw, token, ticket, tx, sendWithdrawTx } = props

  const { t } = useTranslation()

  return (
    <>
      <AmountBeingSwapped
        title={t('withdrawTicker', { ticker: ticket.symbol })}
        chainId={prizePool.chainId}
        from={ticket}
        to={token}
        amountFrom={amountToWithdraw}
        amountTo={amountToWithdraw}
      />

      <div className='my-8'>
        <UpdatedStats
          prizePool={prizePool}
          amountToWithdraw={amountToWithdraw}
          token={token}
          ticket={ticket}
        />
      </div>

      <UncheckedPrizesWarning prizePool={prizePool} />

      <TxButton
        chainId={prizePool.chainId}
        className='w-full'
        theme={ButtonTheme.orangeOutline}
        onClick={sendWithdrawTx}
        type='button'
        state={tx?.state}
        status={tx?.status}
      >
        <span>{t('confirmWithdrawal')}</span>
      </TxButton>
    </>
  )
}

const WithdrawLabel = (props) => {
  const { symbol } = props
  const { t } = useTranslation()
  return (
    <div className=' font-semibold uppercase text-accent-3 opacity-60'>
      {t('withdrawTicker', { ticker: symbol })}
    </div>
  )
}

interface WithdrawFormProps {
  chainId: number
  form: UseFormReturn<FieldValues, object>
  token: TokenWithBalance
  ticket: TokenWithBalance
  disabled?: boolean
}

const WithdrawForm = (props: WithdrawFormProps) => {
  const { disabled, chainId, form, token, ticket } = props
  const { register, setValue } = form

  const {
    address: ticketAddress,
    symbol: ticketSymbol,
    amount,
    amountUnformatted,
    hasBalance
  } = ticket

  const withdrawValidationRules = {
    isValid: (v) => {
      if (!v) return false
      const isNotANumber = isNaN(v)
      if (isNotANumber) return false
      const decimals = token.decimals
      if (getMaxPrecision(v) > Number(decimals)) return false
      const valueUnformatted = parseUnits(v, decimals)
      if (valueUnformatted.isZero()) return false
      if (valueUnformatted.lt(ethers.constants.Zero)) return false
      if (valueUnformatted.gt(amountUnformatted)) return t('insufficientFunds')
      return true
    }
  }

  const { t } = useTranslation()

  return (
    <TextInputGroup
      unsignedNumber
      readOnly={disabled}
      Input={RectangularInput}
      symbolAndIcon={<TokenSymbolAndIcon chainId={chainId} token={ticket} />}
      validate={withdrawValidationRules}
      containerBgClassName={'bg-transparent'}
      containerRoundedClassName={'rounded-lg'}
      bgClassName={'bg-body'}
      placeholder='0.0'
      id={WITHDRAW_QUANTITY_KEY}
      name={WITHDRAW_QUANTITY_KEY}
      autoComplete='off'
      register={register}
      required={t('ticketQuantityRequired')}
      label={<WithdrawLabel symbol={ticket.symbol} />}
      rightLabel={
        <MaxAmountTextInputRightLabel
          valueKey={WITHDRAW_QUANTITY_KEY}
          setValue={setValue}
          amount={amount}
          tokenSymbol={ticketSymbol}
          isAmountZero={!hasBalance}
        />
      }
    />
  )
}

WithdrawForm.defaultProps = {
  disabled: false
}

const SquaredTokenAmountContainer = (props) => {
  const { chainId, amount, token } = props

  return (
    <TextInputGroup
      readOnly
      disabled
      symbolAndIcon={<TokenSymbolAndIcon chainId={chainId} token={token} />}
      Input={RectangularInput}
      roundedClassName={'rounded-lg'}
      containerRoundedClassName={'rounded-lg'}
      placeholder='0.0'
      id='result'
      name='result'
      register={() => {}}
      label={null}
      value={amount}
    />
  )
}

SquaredTokenAmountContainer.defaultProps = {
  borderClassName: 'border-body'
}

const WithdrawWarning = (props) => {
  const { t } = useTranslation()

  return (
    <div
      className={classnames(
        'w-full py-1 px-4 text-xxs text-center rounded-lg bg-orange-darkened text-orange',
        props.className
      )}
    >
      {t(
        'withdrawingWillReduceYourOddsToWin',
        'Withdrawing funds will decrease your chances to win prizes!'
      )}
    </div>
  )
}

const UpdatedStats = (props: {
  className?: string
  prizePool: PrizePool
  amountToWithdraw: Amount
  token: TokenWithBalance
  ticket: TokenWithBalance
}) => {
  const { className, prizePool, amountToWithdraw, token, ticket } = props

  return (
    <ModalInfoList className={className}>
      {/* // TODO: Add back odds from main branch */}
      <FinalTicketBalanceStat amount={amountToWithdraw?.amount} ticket={ticket} />
      <UnderlyingReceivedStat amount={amountToWithdraw?.amount} token={token} />
      <EstimatedWithdrawalGasItem chainId={prizePool.chainId} />
    </ModalInfoList>
  )
}

const FinalTicketBalanceStat = (props: { amount: string; ticket: TokenWithBalance }) => {
  const { amount, ticket } = props
  const { t } = useTranslation()
  const amountUnformatted = ethers.utils.parseUnits(amount, ticket.decimals)
  const finalBalanceUnformatted = ticket.amountUnformatted.sub(amountUnformatted)
  const finalBalance = ethers.utils.formatUnits(finalBalanceUnformatted, ticket.decimals)
  const finalBalancePretty = numberWithCommas(finalBalance)
  const fullFinalBalancePretty = numberWithCommas(finalBalance, {
    precision: getMaxPrecision(finalBalance)
  })

  return (
    <InfoListItem
      label={t('finalDepositBalance', 'Remaining balance')}
      value={
        <Tooltip id='final-ticket-balance' tip={`${fullFinalBalancePretty} ${ticket.symbol}`}>
          <div className='flex flex-wrap justify-end'>
            <span>{finalBalancePretty}</span>
            <span className='ml-1'>{ticket.symbol}</span>
          </div>
        </Tooltip>
      }
    />
  )
}

const UnderlyingReceivedStat = (props) => {
  const { token, amount } = props
  const { t } = useTranslation()

  const amountPretty = numberWithCommas(amount, { precision: getMaxPrecision(amount) })
  const fullFinalBalancePretty = numberWithCommas(amount, {
    precision: getMaxPrecision(amount)
  })

  return (
    <InfoListItem
      label={t('tickerToReceive', { ticker: token.symbol })}
      value={
        <Tooltip
          id={`${token.symbol}-to-receive`}
          tip={`${fullFinalBalancePretty} ${token.symbol}`}
        >
          <div className='flex flex-wrap justify-end'>
            <span>{amountPretty}</span>
            <span className='ml-1'>{token.symbol}</span>
          </div>
        </Tooltip>
      }
    />
  )
}

const DownArrow = () => <DefaultDownArrow className='my-2 text-inverse' />

export const UncheckedPrizesWarning = (props: { prizePool: PrizePool }) => {
  const { prizePool } = props
  const usersAddress = useUsersAddress()
  const prizeDistributor = usePrizeDistributorByChainId(prizePool.chainId)
  const { data, isFetched } = useHasUserCheckedAllDraws(usersAddress, prizeDistributor)
  const { t } = useTranslation()

  if (!isFetched || data.hasUserCheckedAllDraws) return null

  return (
    <TransparentDiv className='rounded-xl p-4 border border-orange'>
      <div className='text-lg font-bold text-center w-full'>🎁 {t('youHaveUncheckedDraws')}</div>
      <div className='text-center mb-4'>{t('goToPrizesPageToCheck')}</div>
      <Link href={'/prizes'}>
        <ButtonLink size={ButtonSize.sm} className='w-1/2 mx-auto'>
          {t('checkForPrizes')} <FeatherIcon icon='arrow-up-right' className='w-4 h-4' />
        </ButtonLink>
      </Link>
    </TransparentDiv>
  )
}
