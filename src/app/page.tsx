"use client"

import { EditorPage } from "@/components/editor-page";
import { Label } from "@/components/label";


const randomGenerator = () => {
  const number = Math.floor(Math.random() * 1000)
  return number as unknown as string;
}

export default function Home() {


  return (
    <div className="relative h-full w-full min-h-screen flex items-center justify-center">
      <div className="max-w-4xl w-full border-2 border-neutral-300 shadow-lg p-8 rounded-xl">
        <EditorPage />
      </div>

    </div>

  );
}
