import { LoadingScreen } from '@pooltogether/react-components'
import { DepositUI } from '@views/Deposit'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import dynamic from 'next/dynamic.js'
import React, { Suspense } from 'react'
import nextI18NextConfig from '../../next-i18next.config.mjs'

const Layout = dynamic(() => import('../components/Layout'), {
  suspense: true
})

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'], nextI18NextConfig))
    }
  }
}

export default function IndexPage(props) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <DepositUI />
      </Layout>
    </Suspense>
  )
}
