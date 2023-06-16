import { Layout } from '@vercel/examples-ui'
import { Chat } from '../components/Chat'

function Home() {
  return (
    <div className="flex flex-col-reverse items-center overflow-auto">
      <div className="w-full max-w-[700px]">
        <Chat beliefType='hinduism' />
      </div>
    </div>
  )
}

Home.Layout = Layout

export default Home
