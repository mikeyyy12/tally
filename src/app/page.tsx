"use client"

import { EditorPage } from "@/components/editor-page";


const randomGenerator = () => {
  const number = Math.floor(Math.random() * 1000)
  return number as unknown as string;
}

export default function Home() {

  return (
    <div className="relative min-h-screen max-w-4xl mx-auto mt-12 border-2 border-neutral-300 shadow-lg p-8 rounded-xl">
      <EditorPage />

    </div >
  );
}
