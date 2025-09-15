"use client"
import { BlocksContext } from '@/context/context';

import { cn } from '@/utils/cn';
import { Blocktype, CheckboxBlock } from '@/utils/type';
import React, { useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid';


export const Block = ({ block, }: { block: Blocktype }) => {

    const context = useContext(BlocksContext)
    if (!context) throw new Error("Block context not found")
    const { blocks, setBlocks, setIsOpen, setCurrentId, focusId, setFocusId } = context;

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
        console.log("running")
        if (focusId) {
            console.log('setting focus')
            let div = document.getElementById(focusId)
            if (div && !div.isContentEditable) {
                const editable = div.querySelector('[contenteditable="true"]') as HTMLElement;
                if (editable) div = editable;

            }

            if (div) {
                div.focus()
                const range = document.createRange()
                range.selectNodeContents(div)
                range.collapse(false)
                const sel = window.getSelection()
                sel?.removeAllRanges()
                sel?.addRange(range)
                setFocusId(null)
            }
        }
    }, [focusId])


    function isCaretAtStart() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return false
        const range = selection?.getRangeAt(0)
        return range?.startOffset == 0 && range?.endOffset == 0
    }

    function isCaretAtEnd(div: HTMLDivElement) {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) false
        const range = selection?.getRangeAt(0)
        return range?.endOffset === div.textContent.length
    }

    function focusBlock(div: HTMLDivElement, atStart: boolean) {
        div.focus();

        const range = document.createRange()
        if (atStart) {
            const firstChild = div.firstChild || div;
            range.setStart(firstChild, 0)
        } else {
            range.selectNodeContents(div)
            range.collapse(false)
        }
        const sel = window.getSelection();
        sel?.removeAllRanges()
        sel?.addRange(range)
    }
    const handleKeyDown = ({ e, type, blockId }: { e: React.KeyboardEvent<HTMLDivElement>, type: string, blockId: string }) => {


        if (e.key == "Enter") {
            e.preventDefault()
            handleEnter({ id: block.id })
        }
        else if (e.key == "Backspace") {
            handleBackspace({ e, id: block.id })
        }
        else if (e.key === "ArrowUp") {
            // e.preventDefault()
            if (isCaretAtStart()) {
                const index = blocks.findIndex((b) => b.id == blockId)
                const prevDivId = blocks[index - 1].id
                e.preventDefault();
                const prevDiv = document.getElementById(prevDivId)
                if (prevDiv) focusBlock(prevDiv as HTMLDivElement, false)
            }
        }
        else if (e.key === "ArrowDown") {
            const div = document.getElementById(blockId)
            if (isCaretAtEnd(div as HTMLDivElement)) {
                const index = blocks.findIndex((b) => b.id == blockId)
                const nextId = blocks[index + 1].id

                e.preventDefault();

                const nextDiv = document.getElementById(nextId)
                if (nextDiv) focusBlock(nextDiv as HTMLDivElement, true)
            }
        }
        else if (e.key === "/" && type == "paragraph") {
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
    const handleAddOption = (groupId: string) => {
        const options = blocks.filter(
            b => b.type === "checkbox-option" && b.parentId === groupId
        );
        console.log("lenght", options.length, blocks)
        const newOption: CheckboxBlock = {
            id: uuidv4(),
            type: "checkbox-option",
            parentId: groupId,
            label: `Opt ${options.length + 1}`,
        };
        const lastIndex = (() => {
            let last = -1;
            blocks.forEach((b, idx) => {
                if (b.type === "checkbox-option" && b.parentId === groupId) {
                    last = idx;
                }
            });
            return last;
        })();
        const insertIndex = lastIndex >= 0 ? lastIndex + 1 : blocks.findIndex(b => b.id === groupId) + 1;
        console.log(insertIndex, 'inset')
        const newBlocks = [
            ...blocks.slice(0, insertIndex),
            newOption,
            ...blocks.slice(insertIndex),
        ];
        setBlocks(newBlocks);
    }
    const handleInput = (e: React.KeyboardEvent<HTMLDivElement>) => {

        const value = e.currentTarget.textContent || "";
        if (value === "") {
            e.currentTarget.textContent = "";
        }


        if (!value.includes("/")) {
            setIsOpen(false);
        }
    }
    const handleBackspace = ({ e, id }: { e: React.KeyboardEvent<HTMLDivElement>, id: string }) => {

        const currentDiv = e.currentTarget;
        const isEmpty = !currentDiv.textContent || currentDiv.textContent === "";
        if (isEmpty) {
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

                    onKeyDown={(e) => handleKeyDown({ e, type: block.type, blockId: block.id })}
                    data-placeholder={block.label}
                    onInput={handleInput}

                    suppressContentEditableWarning
                    className={cn("[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-neutral-400",
                        "text-xl text-black focus:outline-none font-semibold tracking-tight px-1 py-1"
                    )}>{block.content as string}</div>
            )
        case "input":

            return (

                <div
                    id={block.id}

                    data-placeholder={block.label}
                    contentEditable={'true'}
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onKeyDown={(e) => handleKeyDown({ e, type: block.type, blockId: block.id })}
                    className={cn("[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-neutral-400 ",
                        "w-full h-full text-sm tracking-wide focus:outline-none  font-normal text-neutral-800",
                        "w-60  shadow-checkbox  rounded-lg px-4 py-2 my-1 text-sm",
                        "whitespace-nowrap overflow-x-auto overflow-y-hidden scrollbar-hide"
                    )} >{block.content as string}</div>

            )
        case "checkbox-group":
            const options = blocks
                .filter((b): b is CheckboxBlock => b.type === "checkbox-option" && b.parentId === block.id)
                .sort((a, b) => blocks.indexOf(a) - blocks.indexOf(b));
            return (
                <>
                    {
                        options.map((opt, idx) => (
                            <div id={opt.id}
                                onKeyDown={(e) => handleKeyDown({ e, type: opt.type, blockId: opt.id })}
                                className='flex items-center gap-2'>
                                <div className='rounded-[3px]  h-[17px] w-[18px] bg-white  shadow-checkbox'></div>
                                <div
                                    suppressContentEditableWarning
                                    data-placeholder={`Option`}
                                    contentEditable="true"
                                    className={cn("[&:empty]:before:content-[attr(data-placeholder)]  [&:empty]:before:text-neutral-400",
                                        "w-full h-full text-sm  focus:outline-none py-px font-normal"
                                    )} >{opt.value}</div>
                            </div>
                        ))}
                    < div
                        className='flex items-center gap-2 opacity-20 cursor-pointer hover:opacity-80 ' >
                        <div className='rounded-[3px]  h-[17px] w-[18px] bg-white  shadow-checkbox'></div>
                        <div
                            onClick={() => {
                                handleAddOption(block.id)
                            }}
                            className={cn(
                                "w-full h-full text-sm  focus:outline-none py-1 font-normal "
                            )} >Add Option</div>
                    </div >


                </>
            )
        case "paragraph":
            return (<div id={block.id} contentEditable={'true'}
                onKeyDown={(e) => handleKeyDown({ e, type: block.type, blockId: block.id })}
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
                <div
                    id={block.id} className=" flex flex-col px-1 gap-3  ">
                    <div
                        onKeyDown={(e) => handleKeyDown({ e, type: block.type, blockId: block.id })}
                        className='flex items-center gap-2 max-w-fit rounded-lg shadow-checkbox px-3 '>
                        <div className='rounded-[3px]  h-[17px] w-[18px] bg-radio  shadow-checkbox p-2 text-xs font-bold text-shadow-xl flex items-center justify-center text-white '>{block.letter}</div>
                        <div
                            data-placeholder="Input"
                            contentEditable="true"
                            suppressContentEditableWarning
                            className={cn(
                                "w-full h-full text-sm  focus:outline-none py-2 font-normal text-neutral-800"
                            )} >{block.value}</div>
                    </div>

                </div>
            )

    }
}
