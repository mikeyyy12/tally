"use client"
import { Blocktype } from "@/utils/type";
import { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

interface BlocksContextType {
  blocks: Blocktype[];
  setBlocks: React.Dispatch<React.SetStateAction<Blocktype[]>>;
}

export const BlocksContext = createContext<BlocksContextType | undefined>(undefined)

export const BlocksProvider = ({ children }: { children: React.ReactNode }) => {
  const [blocks, setBlocks] = useState<Blocktype[]>([
    { type: "text", id: uuidv4(), content: "First Name" },
    { type: "input", id: uuidv4(), label: "What's your name?", required: true },
    { type: "paragraph", id: uuidv4(), label: "Type '/' to insert block" },
    { type: "checkbox", id: uuidv4(), label: "What's your name?", options: ["true", "false"] },
    { type: "radio", id: uuidv4(), label: "Are you above 18", options: [{ letter: "A", value: "true" }, { letter: "B", value: "false" }] }
  ]);

  return (
    <BlocksContext.Provider value={{ blocks, setBlocks }}>
      {children}
    </BlocksContext.Provider>
  );
};