import { Analytics } from '@vercel/analytics/react'
import type { AppProps } from 'next/app'

import '@vercel/examples-ui/globals.css'

function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-col min-h-screen p-10">
      <Component {...pageProps} />
      <Analytics />
    </div>
  )
}

export default App
