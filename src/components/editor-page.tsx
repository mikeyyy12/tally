"use client"
import { Block } from "@/components/block"
import { Label } from "@/components/label";
import { BlocksContext } from "@/context/context";
import { Blocktype } from "@/utils/type"
import { ChangeEvent, useContext, useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid';



export const EditorPage = () => {
  const context = useContext(BlocksContext);
  if (!context) throw new Error("BlocksContext must be used within a BlocksProvider");
  const [formTitle, setFormTitle] = useState("")

  const [coords, setCoords] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const { blocks, setBlocks, isOpen, setIsOpen } = context;

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
  useEffect(() => {


    const domIds = blocks.map(b => {
      const el = document.getElementById(b.id);
      return { id: b.id, domId: el?.id ?? null, count: document.querySelectorAll(`#${CSS.escape(b.id)}`).length };
    });


  }, [blocks]);

  const openModal = () => {


    setIsOpen(true)
    const caret = getCaretCoordinates();
    if (caret) {
      setCoords({
        x: caret.x,
        y: caret.y - 240
      });

    }
  }

  useEffect(() => {


    if (isOpen) {
      openModal()
    }
  }, [isOpen])

  return (
    <div
      className="flex flex-col gap-4 px-28 ">
      <div >
        <input className="text-3xl font-bold text-neutral-800 outline-none p-2 " placeholder="Form title" type="text" onChange={(e: ChangeEvent<HTMLInputElement>) => setFormTitle(e.target.value)} value={formTitle} />
      </div>
      <div className="flex flex-col gap-2 "
      >
        {blocks.map((block, idx) => (
          <Block key={block.id} block={block} />
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

