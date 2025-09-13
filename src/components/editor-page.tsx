
import { Block } from "@/components/block"
import { Label } from "@/components/label";
import { Blocktype } from "@/utils/type"
import { ChangeEvent, useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid';


export const EditorPage = () => {
  const [formTitle, setFormTitle] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [blocks, setBlocks] = useState<Blocktype[]>([
    { type: "text", id: uuidv4(), content: "First Name" },
    { type: "input", id: uuidv4(), label: "What's your name?", required: true },
    { type: "checkbox", id: uuidv4(), label: "What's your name?", options: ["true", "false"] },
    { type: "radio", id: uuidv4(), label: "Are you above 18", options: [{ letter: "A", value: "true" }, { letter: "B", value: "false", }] }
  ])

  const [coords, setCoords] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  function getCaretCoordinates() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0).cloneRange();
    range.collapse(true);

    const rect = range.getBoundingClientRect();
    if (!rect) return null;

    return {
      x: rect.left,
      y: rect.top,
      height: rect.height,
    };
  }


  const openModal = () => {
    console.log('open model triggerd')
    setIsOpen(true)
    const caret = getCaretCoordinates();
    if (caret) {
      setCoords({
        x: caret.x,
        y: caret.y - 240
      });

    }
  }
  const handleEnter = () => {
    const newBlock = { type: "paragraph", id: uuidv4(), label: "Type '/' to intsert block" }
  }

  useEffect(() => {
    console.log(blocks)
  }, [blocks])

  return (
    <div
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {

        if (e.key == "/") {
          openModal();
          console.log("/ is pressed")
        } else if (e.key == "Backspace") {
          console.log("backspace pressed")
          setIsOpen(false)
        } else if (e.key == "Enter") {
          console.log("its enter")
          handleEnter()
        }
      }}
      className="flex flex-col gap-4  ">
      <div >
        <input className="text-3xl font-bold text-neutral-800 outline-none p-2" placeholder="Form title" type="text" onChange={(e: ChangeEvent<HTMLInputElement>) => setFormTitle(e.target.value)} value={formTitle} />
      </div>
      <div className="flex flex-col gap-2">
        {blocks.map((block, idx) => (
          <Block key={idx} block={block} />
        ))}
      </div>
      <div className="px-4 py-2 bg-sky-500 text-white w-fit rounded-lg cursor-pointer"
        onClick={openModal}
      >Add</div>
      {
        isOpen && <Label close={() => setIsOpen(false)} coords={coords} setBlocks={setBlocks} />
      }
    </div >
  )
}

