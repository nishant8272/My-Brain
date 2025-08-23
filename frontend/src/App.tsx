import Button from "./components/Button"
import {Plusicon} from "../icons/Plusicon.tsx"
import Shareicon from "../icons/ShareIcon.tsx"
import {Card }from "./components/Card.tsx"
import { CreateContent } from "./components/CreateContent.tsx"
function App() {
  //@ts-ignore
  const tag=["hello","bye","everyone"]
  return (
    <> 
    <div className="p-4">
      <CreateContent open={true}/>
     <div className="flex justify-end gap-4">
       <Button variant="primary" text="Add Content" startIcon={<Plusicon/>}></Button>
      <Button variant="secondary" text="Share Brain" startIcon={<Shareicon/>}></Button>
     </div> 
     <div className="flex gap-5 ">
      <Card title="hello eveyone" type="youtube" text="i am a developer." Tags={tag} link="https://www.youtube.com/watch?v=EvzNDQLwCqw"/>
      <Card title="hello eveyone" type="youtube" text="i am a developer." Tags={tag} link="https://www.youtube.com/watch?v=EvzNDQLwCqw"/>
      <Card title="hello eveyone" type="twitter" text="i am a developer." Tags={tag} link="https://x.com/narendramodi/status/1958465156305821996"/>
    </div>
    </div>
    </>
  )
}

export default App
