import { Analytics } from '@vercel/analytics/react'
import type { AppProps } from 'next/app'

import '@vercel/examples-ui/globals.css'
import Header from '../components/Header'

function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col min-h-screen p-10">
      <div className="flex flex-col items-center overflow-auto">
        <Header />
        <Component {...pageProps} />
      </div>
      <Analytics />
    </div>
  )
}

export default App
