import { Layout } from '@vercel/examples-ui'
import Head from 'next/head'
import { Chat } from '../components/Chat'

function Home() {
  return (
    <>
      <Head>
        <title>AI Mormon Scholar</title>
        <meta name="description" content="Chat and ask questions about Mormonism with AI. Powered by ChatGPT." />
        <meta property="og:title" content="AI Mormon Scholar" />
        <meta property="og:description" content="Chat and ask questions about Mormonism with AI. Powered by ChatGPT." />
        <meta property="og:url" content="https://tensor.church" />
        <meta property="og:site_name" content="AI Islam Scholar" />
        <meta property="og:image" content="https://tensor.church/static/open_graph_5.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en-US" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Islam Scholar" />
        <meta name="twitter:description" content="Chat and ask questions about about Mormonism with AI. Powered by ChatGPT." />
        <meta name="twitter:site" content="@macrocosmcorp" />
        <meta name="twitter:site:id" content="1515531815594864640" />
        <meta name="twitter:image" content="https://tensor.church/static/open_graph_5.png" />
      </Head>

      <div className="w-full max-w-[700px]">
        <Chat beliefType='mormon' />
      </div>
    </>
  )
}

Home.Layout = Layout

export default Home
