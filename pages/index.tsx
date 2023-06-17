import { Layout } from '@vercel/examples-ui'
import Head from 'next/head'
import { Chat } from '../components/Chat'

function Home() {
  return (<>
    <Head>
      <title>TENSOR CHURCH - AI Religion Chat</title>
      <meta name="description" content="Chat and ask questions about religion, belief, or philosophy with AI. Powered by ChatGPT." />
      <meta property="og:title" content="TENSOR CHURCH - AI Religion Chat" />
      <meta property="og:description" content="Chat and ask questions about religion, belief, or philosophy with AI. Powered by ChatGPT." />
      <meta property="og:url" content="https://tensor.church" />
      <meta property="og:site_name" content="TENSOR CHURCH - AI Religion Chat" />
      <meta property="og:image" content="https://tensor.church/static/open_graph_1.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en-US" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="TENSOR CHURCH - AI Religion Chat" />
      <meta name="twitter:description" content="Chat and ask questions about religion, belief, or philosophy with AI. Powered by ChatGPT." />
      <meta name="twitter:site" content="@macrocosmcorp" />
      <meta name="twitter:site:id" content="1515531815594864640" />
      <meta name="twitter:image" content="https://tensor.church/static/open_graph_1.png" />
    </Head>
    <div className="w-full max-w-[700px]">
      <Chat beliefType='all_beliefs' />
    </div>
  </>
  )
}

Home.Layout = Layout

export default Home
