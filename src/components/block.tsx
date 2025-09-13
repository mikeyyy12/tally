import { BlocksContext } from '@/context/context';
import { cn } from '@/utils/cn';
import { Blocktype } from '@/utils/type';
import React, { useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid';


export const Block = ({ block, }: { block: Blocktype }) => {
    const [focusId, setFocusId] = useState<string | null>(null)

    const context = useContext(BlocksContext)
    if (!context) throw new Error("Block context not found")
    const { blocks, setBlocks, setIsOpen, setCurrentId } = context;

    const handleEnter = ({ id }: { id: string }) => {
        const newBlock = { type: "paragraph" as const, id: uuidv4(), label: "Type '/' to insert block" }
        const index = blocks.findIndex(b => b.id === id);
        const newBlocks = [
            ...blocks.slice(0, index + 1),
            newBlock,
            ...blocks.slice(index + 1)
        ]
        setBlocks(newBlocks)
        setFocusId(newBlock.id)
    }

    useEffect(() => {
        if (focusId) {
            const div = document.getElementById(focusId)
            if (div) {
                div.focus()
                const range = document.createRange()
                range.selectNodeContents(div)
                range.collapse(true)
                const sel = window.getSelection()
                sel?.removeAllRanges()
                sel?.addRange(range)
                setFocusId(null)
            }
        }
    }, [focusId])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {

        console.log(e.key)

        if (e.key == "Enter") {
            e.preventDefault()
            handleEnter({ id: block.id })
        }
        else if (e.key == "Backspace") {
            handleBackspace({ e, id: block.id })
        }
        else if (e.key === "/") {
            setCurrentId(block.id)
            requestAnimationFrame(() => {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    if (rect && rect.top > 0) {
                        setIsOpen(true);
                    }
                }
            });
        }

    }

    const handleInput = (e: React.KeyboardEvent<HTMLDivElement>) => {

        const value = e.currentTarget.textContent || "";
        if (value === "") {
            e.currentTarget.textContent = "";
        }
        if (!value.includes("/")) {
            console.log("closing this shit")
            setIsOpen(false);
        }
    }
    const handleBackspace = ({ e, id }: { e: React.KeyboardEvent<HTMLDivElement>, id: string }) => {
        console.log("presed it fu")
        const currentDiv = e.currentTarget;
        const isEmpty = !currentDiv.textContent || currentDiv.textContent === "";
        if (isEmpty) {
            console.log('is empt')
            e.preventDefault()
            const index = blocks.findIndex((b) => b.id == id)
            const newBlocks = [
                ...blocks.slice(0, index),
                ...blocks.slice(index + 1)
            ]
            setBlocks(newBlocks)
            if (index > 0) {
                const prevId = blocks[index - 1].id;
                const prevDiv = document.getElementById(prevId);

                if (prevDiv) {
                    prevDiv.focus();
                    const range = document.createRange();
                    range.selectNodeContents(prevDiv);
                    range.collapse(false);
                    const sel = window.getSelection();
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                }
            }

        }
    }
    switch (block.type) {
        case "text":
            return (
                <div id={block.id} contentEditable={'true'}
                    onKeyDown={(e) => handleKeyDown(e)}
                    data-placeholder={block.label}
                    onInput={handleInput}
                    suppressContentEditableWarning
                    className={cn("[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-neutral-400 ",
                        "text-xl text-black focus:outline-none font-semibold tracking-tight px-1 py-1"
                    )}>{block.content as string}</div>
            )
        case "input":

            return (
                <div id={block.id}

                    className='w-60  shadow-checkbox  rounded-lg px-4 py-2 text-sm '>
                    <div
                        data-placeholder="Input"
                        contentEditable
                        onKeyDown={(e) => handleKeyDown(e)}
                        className={cn("[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-neutral-400 ",
                            "w-full h-full text-sm tracking-wide focus:outline-none  font-normal text-neutral-400",
                            "whitespace-nowrap overflow-x-auto overflow-y-hidden scrollbar-hide"
                        )} ></div>
                </div>
            )
        case "checkbox":
            return (
                <div id={block.id} className=" flex flex-col px-1">
                    {block.options.map((option, idx) => (
                        <div key={idx}
                            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                                e.preventDefault();
                                console.log(e.key)
                            }}
                            className='flex items-center gap-2'>
                            <div className='rounded-[3px]  h-[17px] w-[18px] bg-white  shadow-checkbox'></div>
                            <div
                                suppressContentEditableWarning
                                data-placeholder="Input"
                                contentEditable="true"
                                className={cn("[&:empty]:before:content-[attr(data-placeholder)]  [&:empty]:before:text-neutral-400",
                                    "w-full h-full text-sm  focus:outline-none py-2 font-normal"
                                )} >{option}</div>
                        </div>
                    ))}
                </div>
            )
        case "paragraph":
            return (<div id={block.id} contentEditable={'true'}
                onKeyDown={(e) => handleKeyDown(e)}

                data-placeholder={block.label}
                onInput={handleInput}
                suppressContentEditableWarning
                className={cn("[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-neutral-400 ",
                    "w-full h-full text-sm tracking-wide focus:outline-none  font-normal text-neutral-800 my-1 px-1",
                    "whitespace-nowrap overflow-x-auto overflow-y-hidden scrollbar-hide"
                )}></div>
            )
        case "radio":
            return (
                <div id={block.id} className=" flex flex-col px-1 gap-3  ">
                    {block.options.map((option, idx) => (
                        <div key={idx} className='flex items-center gap-2 max-w-fit rounded-lg shadow-checkbox px-3 '>
                            <div className='rounded-[3px]  h-[17px] w-[18px] bg-radio  shadow-checkbox p-2 text-xs font-bold text-shadow-xl flex items-center justify-center text-white '>{option.letter}</div>
                            <div
                                data-placeholder="Input"
                                contentEditable="true"
                                suppressContentEditableWarning
                                className={cn(
                                    "w-full h-full text-sm  focus:outline-none py-2 font-normal text-neutral-800"
                                )} >{option.value}</div>
                        </div>
                    ))}
                </div>
            )

    }
}
