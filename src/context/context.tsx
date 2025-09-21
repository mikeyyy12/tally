"use client"
import { Blocktype } from "@/utils/type";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

interface BlocksContextType {
  blocks: Blocktype[];
  setBlocks: React.Dispatch<React.SetStateAction<Blocktype[]>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currnetId: string,
  setCurrentId: React.Dispatch<React.SetStateAction<string>>;
  focusId: string | null,
  undo: () => void,
  setBlocksState: (blocks: Blocktype[]) => void;
  setFocusId: React.Dispatch<React.SetStateAction<string | null>>
}


const intialBlock = [
  { type: "text", id: "12", content: "First Name" },
  { type: "input", id: "124", label: "What's your name?", required: true },
  { type: "paragraph", id: "123", label: "Type '/' to insert block" },
  { type: "checkbox-group", id: "121", label: "What's your name?", },
  { type: "checkbox-option", id: "1213", parentId: "121", value: "shubham", },
  { type: "checkbox-option", id: "1214", parentId: "121", value: "nine" },
  { type: "multipleChoice-group", id: "1215", label: "What's your name?", },
  { type: "multipleChoice-option", id: "122", letter: "A", parentId: "1215", value: "nice" },
  { type: "multipleChoice-option", id: "1232", letter: "B", parentId: "1215", value: "not nice" }
]
export const BlocksContext = createContext<BlocksContextType | undefined>(undefined)

export const BlocksProvider = ({ children }: { children: React.ReactNode }) => {
  const [blocks, setBlocks] = useState<Blocktype[]>(intialBlock as Blocktype[]);

  const [isOpen, setIsOpen] = useState(false)
  const [currnetId, setCurrentId] = useState('')
  const [focusId, setFocusId] = useState<string | null>(null)
  const undoStack = useRef<Blocktype[][]>([]);

  useEffect(() => {
    // Deep clone blocks before pushing
    undoStack.current.push(JSON.parse(JSON.stringify(blocks)));
    console.log('undo stack', undoStack.current);
  }, []);

  const setBlocksState = (newBlocks: Blocktype[]) => {
    undoStack.current.push(JSON.parse(JSON.stringify(blocks)));
    setBlocks(newBlocks);
  }
  const undo = () => {

    if (undoStack.current.length > 1) {
      // Remove current snapshot
      undoStack.current.pop();

      // Get previous snapshot
      const prev = undoStack.current[undoStack.current.length - 1];
      setBlocks(JSON.parse(JSON.stringify(prev))); // deep clone
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        const len = undoStack.current.length;
        if (len > 0) {
          const prev = undoStack.current[len - 1];
          setBlocks(JSON.parse(JSON.stringify(prev)));
          undoStack.current.pop();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
  return (
    <BlocksContext.Provider value={{ blocks, undo, setBlocks, setBlocksState, isOpen, setIsOpen, currnetId, setCurrentId, focusId, setFocusId }}>
      {children}
    </BlocksContext.Provider>
  );
};
