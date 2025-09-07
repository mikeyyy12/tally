
import { Block } from "@/components/block"
import { Blocktype } from "@/utils/type"
import { ChangeEvent, useState } from "react"
import { v4 as uuidv4 } from 'uuid';


export const EditorPage = () => {
  const [formTitle, setFormTitle] = useState("")
  const [blocks, setBlocks] = useState<Blocktype[]>([
    { type: "text", id: uuidv4(), content: "First Name" },
    { type: "input", id: uuidv4(), label: "What's your name?", required: true },
    { type: "checkbox", id: uuidv4(), label: "What's your name?", options: ["true", "false"] }
  ])

  return (
    <div className="flex flex-col gap-4">
      <div >
        <input className="text-3xl font-bold text-neutral-800 outline-none p-2" placeholder="Form title" type="text" onChange={(e: ChangeEvent<HTMLInputElement>) => setFormTitle(e.target.value)} value={formTitle} />
      </div>
      <div className="flex flex-col gap-2">
        {blocks.map((block, idx) => (
          <Block block={block} key={idx} />
        ))}
      </div>
    </div>
  )
}

