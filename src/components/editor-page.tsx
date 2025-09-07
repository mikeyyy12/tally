import { ChangeEvent, useState } from "react"


export const EditorPage = () => {
  const [formTitle, setFormTitle] = useState("")
  return (
    <div className="flex flex-col gap-4">
      <div className="mb-10">
        <input className="text-2xl outline-none p-2" placeholder="Form title" type="text" onChange={(e: ChangeEvent<HTMLInputElement>) => setFormTitle(e.target.value)} value={formTitle} />
      </div>
      <Block />
    </div>
  )
}

