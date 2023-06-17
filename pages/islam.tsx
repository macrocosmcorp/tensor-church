import { Layout } from '@vercel/examples-ui'
import { Chat } from '../components/Chat'

function Home() {
  return (
    <div className="w-full max-w-[700px]">
      <Chat beliefType='islam' />
    </div>
  )
}

Home.Layout = Layout

export default Home
