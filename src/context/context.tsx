"use client"
import { Blocktype } from "@/utils/type";
import { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

interface BlocksContextType {
  blocks: Blocktype[];
  setBlocks: React.Dispatch<React.SetStateAction<Blocktype[]>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currnetId: string,
  setCurrentId: React.Dispatch<React.SetStateAction<string>>;
  focusId: string | null,
  setFocusId: React.Dispatch<React.SetStateAction<string | null>>
}


const intialBlock = [
  { type: "text", id: uuidv4(), content: "First Name" },
  { type: "input", id: uuidv4(), label: "What's your name?", required: true },
  { type: "paragraph", id: uuidv4(), label: "Type '/' to insert block" },
  { type: "checkbox", id: uuidv4(), label: "What's your name?", options: ["true", "false"] },
  { type: "radio", id: uuidv4(), label: "Are you above 18", options: [{ letter: "A", value: "true" }, { letter: "B", value: "false" }] }
]
export const BlocksContext = createContext<BlocksContextType | undefined>(undefined)

export const BlocksProvider = ({ children }: { children: React.ReactNode }) => {
  const [blocks, setBlocks] = useState<Blocktype[]>(intialBlock as Blocktype[]);

  const [isOpen, setIsOpen] = useState(false)
  const [currnetId, setCurrentId] = useState('')
  const [focusId, setFocusId] = useState<string | null>(null)
  useEffect(() => {
    console.log("og", blocks)
  }, [])

  return (
    <BlocksContext.Provider value={{ blocks, setBlocks, isOpen, setIsOpen, currnetId, setCurrentId, focusId, setFocusId }}>
      {children}
    </BlocksContext.Provider>
  );
};
