"use client"
import { BlocksContext } from '@/context/context';

import { cn } from '@/utils/cn';
import { Blocktype, CheckboxBlock, MultipleChoiceOption } from '@/utils/type';
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
        requestAnimationFrame(() => {
            const focusId = newBlock.id

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
                    const sel = window.getSelection()
                    sel?.removeAllRanges()
                    sel?.addRange(range)
                    setFocusId(null)
                }
            }
        })
    }


    useEffect(() => {
        const handler = () => {
            const selection = document.getSelection();
            if (!selection || !selection.anchorNode) return;

            let node: Node | null = selection.anchorNode;
            if (node.nodeType === Node.TEXT_NODE) {
                node = node.parentElement;
            }
            if (node instanceof HTMLElement) {
                const blockDiv = node.closest<HTMLElement>("[data-block-id]");
                if (blockDiv) {
                    setFocusId(blockDiv.getAttribute("data-block-id")!);
                    return;
                }
            }
            setFocusId(null);
        };
        document.addEventListener("selectionchange", handler);
        return () => document.removeEventListener("selectionchange", handler);
    }, []);

    function isCaretInChexbox() {

        if (!focusId) return false;

        const focusBlock = blocks.find(b => b.id === focusId)
        if (focusBlock?.type === "checkbox-group") return true
        if (focusBlock?.type === "checkbox-option") return true

        return false
    }
    function isCaretInMcq() {
        if (!focusId) return false;
        const focusBlock = blocks.find(b => b.id === focusId)
        if (focusBlock?.type === "multipleChoice-group") return true
        if (focusBlock?.type === "multipleChoice-option") return true

        return false
    }
    function isCaretAtStart() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return false
        const range = selection?.getRangeAt(0)
        return range?.startOffset == 0 && range?.endOffset == 0
    }

    function isCaretAtEnd(div: HTMLElement) {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return false;
        const range = selection.getRangeAt(0);
        const textLength = div.innerText.length;
        console.log('textlen', textLength, range.endOffset, range)
        return range.endOffset === textLength;
    }


    function focusBlock(div: HTMLDivElement, atStart: boolean) {
        console.log("inside focus", div)
        requestAnimationFrame(() => {
            div.focus();

            const range = document.createRange()
            if (atStart) {
                const firstChild = div.firstChild || div;
                range.setStart(firstChild, 0)
                range.collapse(true);
            } else {
                range.selectNodeContents(div)
                range.collapse(false)
            }
            const sel = window.getSelection();
            sel?.removeAllRanges()
            sel?.addRange(range)
        })
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
            console.log('a up', isCaretAtStart())
            if (isCaretAtStart()) {

                const index = blocks.findIndex((b) => b.id === blockId);
                if (index <= 0) return;
                let prevIndex = index - 1;
                console.log('p idx', prevIndex, blocks)
                while (prevIndex >= 0 && blocks[prevIndex].type === "checkbox-group") {
                    prevIndex--;
                }
                while (prevIndex >= 0 && blocks[prevIndex].type === "multipleChoice-group") {
                    prevIndex--;
                }
                if (prevIndex >= 0) {
                    const prevDiv = document.getElementById(blocks[prevIndex].id);
                    if (prevDiv) focusBlock(prevDiv as HTMLDivElement, false);
                }
            }
        }

        else if (e.key === "ArrowDown") {
            requestAnimationFrame(() => {
                const div = document.getElementById(blockId);
                if (!div) return
                if (isCaretAtEnd(div as HTMLDivElement)) {
                    const index = blocks.findIndex((b) => b.id == blockId);
                    let nextIdx = index + 1;

                    while (nextIdx < blocks.length && blocks[nextIdx].type === "checkbox-group") {
                        nextIdx++;
                    }
                    while (nextIdx < blocks.length && blocks[nextIdx].type === "multipleChoice-group") {
                        nextIdx++;
                    }

                    if (nextIdx < blocks.length) {
                        const nextDiv = document.getElementById(blocks[nextIdx].id);
                        if (nextDiv) focusBlock(nextDiv as HTMLDivElement, false);
                    }
                }
            });
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

    const handleAddOption = (groupId: string, type: string) => {
        console.log('handleAddOption called for', groupId, type);
        if (type === "checkbox-option") {
            console.log('inside checbox')
            setBlocks(prevBlocks => {
                console.log("insde ran")
                const options = prevBlocks.filter(
                    b => b.type === "checkbox-option" && b.parentId === groupId
                );
                const newOption: CheckboxBlock = {
                    id: uuidv4(),
                    type: "checkbox-option",
                    parentId: groupId,
                    label: `Option ${options.length + 1}`,
                    value: ""
                };

                const lastIndex = (() => {
                    let last = -1;
                    prevBlocks.forEach((b, idx) => {
                        if (b.type === "checkbox-option" && b.parentId === groupId) {
                            last = idx;
                        }
                    });
                    return last;
                })()
                console.log("insde")
                const insertIndex = lastIndex >= 0 ? lastIndex + 1 : prevBlocks.findIndex(b => b.id === groupId) + 1;
                console.log('insertedindex', insertIndex, lastIndex, 'last')
                const newBlocks = [
                    ...prevBlocks.slice(0, insertIndex),
                    newOption,
                    ...prevBlocks.slice(insertIndex),
                ];

                requestAnimationFrame(() => {
                    // update focusId and focus DOM
                    setFocusId(newOption.id);
                    const el = document.getElementById(newOption.id);
                    let target: HTMLElement | null = el as HTMLElement | null;
                    if (target && !target.isContentEditable) {
                        const edit = target.querySelector<HTMLElement>('[contenteditable="true"]');
                        if (edit) target = edit;
                    }
                    if (target) {
                        target.focus();
                        const range = document.createRange();
                        range.selectNodeContents(target);
                        range.collapse(false);
                        const sel = window.getSelection();
                        sel?.removeAllRanges();
                        sel?.addRange(range);
                    }
                });

                return newBlocks;
            });
        }

        else if (type == "multipleChoice-option") {
            setBlocks(prevBlocks => {
                const mcq = prevBlocks.filter(
                    b => b.type == "multipleChoice-option" && b.parentId === groupId
                )
                const length = mcq.length;
                const letter = String.fromCharCode(65 + length);
                const newMcq: MultipleChoiceOption = {
                    id: uuidv4(),
                    type: "multipleChoice-option",
                    parentId: groupId,
                    letter: letter,
                    value: 'Choice'
                }
                const lastIndex = (() => {
                    let last = -1;
                    prevBlocks.forEach((b, idx) => {
                        if (b.type === "multipleChoice-option" && b.parentId === groupId) {
                            last = idx
                        }
                    })
                    return last
                })()

                const insertIndex = lastIndex >= 0 ? lastIndex + 1 : prevBlocks.findIndex((b) => b.id === groupId) + 1;

                const newBlocks = [
                    ...prevBlocks.slice(0, insertIndex),
                    newMcq,
                    ...prevBlocks.slice(insertIndex)
                ]

                requestAnimationFrame(() => {
                    setFocusId(newMcq.id)
                    const el = document.getElementById(newMcq.id)
                    let target: HTMLElement | null = el as HTMLElement | null;
                    if (target && !target.isContentEditable) {
                        const edit = target.querySelector<HTMLElement>('[contenteditable="true"]');
                        if (edit) target = edit
                    }
                    if (target) {
                        target.focus()
                        const range = document.createRange()
                        range.selectNodeContents(target)
                        range.collapse(true)
                        const sel = window.getSelection()
                        sel?.removeAllRanges()
                        sel?.addRange(range)

                    }
                })
                return newBlocks
            })
        }
    };

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
                    data-block-id={block.id}
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
                    data-block-id={block.id}
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
                    {options.map((opt, idx) => (
                        <div
                            key={opt.id}
                            className='flex items-center gap-2'>
                            <div className='rounded-[3px]  h-[17px] w-[18px] bg-white  shadow-checkbox'></div>
                            <div
                                id={opt.id}
                                data-block-id={opt.id}
                                onMouseDown={() => setFocusId(opt.id)}
                                onInput={handleInput}
                                onKeyDown={(e) => handleKeyDown({ e, type: opt.type, blockId: opt.id })}
                                suppressContentEditableWarning
                                data-placeholder={opt.label}
                                contentEditable="true"
                                className={cn("[&:empty]:before:content-[attr(data-placeholder)]  [&:empty]:before:text-neutral-400",
                                    "w-full h-full text-sm  focus:outline-none py-px font-normal"
                                )} >{opt.value}</div>
                        </div>
                    ))}
                    {isCaretInChexbox() && <div
                        className='flex items-center gap-2 opacity-20 cursor-pointer hover:opacity-80 ' >
                        <div className='rounded-[3px]  h-[17px] w-[18px] bg-white  shadow-checkbox'></div>
                        <div onMouseDown={(e) => {
                            handleAddOption(block.id, "checkbox-option")
                        }}
                            className={cn(
                                "w-full h-full text-sm  focus:outline-none py-1 font-normal "
                            )} >Add Option</div>
                    </div >}
                </>
            )
        case "multipleChoice-group":
            const mcqOptions = blocks.filter((b): b is MultipleChoiceOption => b.type === "multipleChoice-option" && b.parentId == block.id)
                .sort((a, b) => blocks.indexOf(a) - blocks.indexOf(b))
            const nextLetter = String.fromCharCode(65 + mcqOptions.length);
            return (
                <>
                    {mcqOptions.map((mcq, idx) => (
                        <div className=" flex flex-col px-1 gap-3  ">
                            <div
                                className='flex items-center gap-2 max-w-fit rounded-lg shadow-checkbox px-3 '>
                                <div className='rounded-[3px]  h-[17px] w-[18px] bg-radio  shadow-checkbox p-2 text-xs font-bold text-shadow-xl flex items-center justify-center text-white '>{mcq.letter}</div>
                                <div
                                    id={mcq.id} data-block-id={mcq.id}
                                    onKeyDown={(e) => handleKeyDown({ e, type: mcq.type, blockId: mcq.id })}
                                    data-placeholder="Input"
                                    contentEditable="true"
                                    suppressContentEditableWarning
                                    className={cn(
                                        "w-full h-full text-sm  focus:outline-none py-2 font-normal text-neutral-800"
                                    )} >{mcq.value}</div>
                            </div>
                        </div>
                    ))}
                    {isCaretInMcq() && <div className="flex flex-col px-1 gap-3">
                        <div
                            className='flex items-center gap-2 max-w-fit rounded-lg shadow-checkbox px-3 opacity-20 hover:opacity-80  cursor-pointer'>
                            <div className='rounded-[3px]  h-[17px] w-[18px] bg-radio  shadow-checkbox p-2 text-xs font-bold text-shadow-xl flex items-center justify-center text-white '>{nextLetter}</div>
                            <div
                                data-placeholder="Input"
                                contentEditable="true"
                                suppressContentEditableWarning
                                onMouseDown={() => handleAddOption(block.id, "multipleChoice-option")}
                                className={cn(
                                    "w-full h-full text-sm  focus:outline-none py-2 font-normal text-neutral-800"
                                )} >Add Choice</div>
                        </div>
                    </div>}
                </>
            )
        case "paragraph":
            return (<div id={block.id} contentEditable={'true'}
                data-block-id={block.id}
                onKeyDown={(e) => handleKeyDown({ e, type: block.type, blockId: block.id })}
                data-placeholder={block.label}
                onInput={handleInput}
                suppressContentEditableWarning
                className={cn("[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-neutral-400 ",
                    "w-full h-full text-sm tracking-wide focus:outline-none  font-normal text-neutral-800 my-1 px-1",
                    "whitespace-nowrap overflow-x-auto overflow-y-hidden scrollbar-hide"
                )}></div>
            )


    }
}
