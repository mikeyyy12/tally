"use client"

import { EditorPage } from "@/components/editor-page";
import { useState } from "react";



const intiblocks: Block[] = [
  { id: "shub1", type: "text", content: "this is the text you need t orender" },
]

const randomGenerator = () => {
  const number = Math.floor(Math.random() * 1000)
  return number as unknown as string;
}

export default function Home() {
  const [blocks, setBlocks] = useState<Block[]>(intiblocks)
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="relative">
      <EditorPage />

    </div >
  );
}
