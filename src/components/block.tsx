"use client"
import { BlockWrapper } from '@/components/block-wrapper';
import { BlocksContext } from '@/context/context';

import { cn } from '@/utils/cn';
import { Blocktype, CheckboxBlock, MultipleChoiceOption } from '@/utils/type';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid';


export const Block = ({ block, }: { block: Blocktype }) => {
    const [caretX, setCaretX] = useState<number | null>(null)

    const context = useContext(BlocksContext)
    if (!context) throw new Error("Block context not found")
    const { blocks, undo, setBlocksState, setBlocks, setIsOpen, setCurrentId, focusId, setFocusId } = context;

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            console.log()
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [undo]);

    const handleEnter = ({ id }: { id: string }) => {
        const newBlock = { type: "paragraph" as const, id: uuidv4(), label: "Type '/' to insert block" }
        const index = blocks.findIndex(b => b.id === id);
        const newBlocks = [
            ...blocks.slice(0, index + 1),
            newBlock,
            ...blocks.slice(index + 1)
        ]
        setBlocksState(newBlocks)
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

    function getCaretRect() {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        const range = sel.getRangeAt(0).cloneRange();
        range.collapse(true);
        const rects = range.getClientRects();
        if (rects.length > 0) {
            return rects[0];
        }

        const marker = document.createElement("span");
        marker.textContent = "\u200b";
        range.insertNode(marker);

        const rect = marker.getBoundingClientRect();
        const parent = marker.parentNode;
        if (parent) parent.removeChild(marker);

        return rect;
    }

    function placeCaretAtX(targetIdx: number, targetX: number) {
        const el = document.getElementById(blocks[targetIdx].id) as HTMLDivElement;
        el?.focus();
        setFocusId(blocks[targetIdx].id)
        const range = document.createRange()
        const sel = window.getSelection()
        if (!sel) return;

        type Best = { node: Node | null; offset: number; dist: number };
        let best: Best = { node: null, offset: 0, dist: Infinity };

        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const text = node.textContent || "";

            if (text.length === 0) continue;

            for (let i = 0; i <= text.length; i++) {
                try { range.setStart(node, i); } catch { continue; }
                range.collapse(true);
                const rect = range.getClientRects()[0];
                if (!rect) continue;
                const dist = Math.abs(rect.x - targetX);

                if (dist < best.dist) {
                    best = { node, offset: i, dist };
                    console.log('offset', i, 'rect.x', rect.x, 'dist', dist, 'bestSoFar', best.dist);
                }
            }
        }

        if (!best.node || best.dist === Infinity) {
            range.selectNodeContents(el);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
            console.log('fallback: placed at end of block');
            return;
        }


        range.setStart(best.node, best.offset)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
    }

    function updateCaretXFromSelection() {
        const rect = getCaretRect();
        if (rect) setCaretX(rect.x)
    }

    const handleKeyDown = ({ e, type, blockId }: { e: React.KeyboardEvent<HTMLDivElement>, type: string, blockId: string }) => {
        if (e.key == "Enter") {
            e.preventDefault()
            handleEnter({ id: block.id })
        }
        else if (e.key == "Backspace") {
            handleBackspace({ e, id: block.id })
        }
        if (
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight" ||
            e.key === "Home" ||
            e.key === "End"
        ) {

            setTimeout(updateCaretXFromSelection, 0);
        }
        else if (e.key === "ArrowUp" || e.key == "ArrowDown") {


            const rect = getCaretRect();

            if (!rect) return
            const sel = window.getSelection();
            if (!sel || sel.rangeCount == 0) return;
            const idx = blocks.findIndex((b) => b.id == blockId)


            let targetIdx = e.key == "ArrowUp" ? idx - 1 : idx + 1
            if (blocks[targetIdx].type == "checkbox-group" || blocks[targetIdx].type == "multipleChoice-group") {
                targetIdx = e.key == "ArrowUp" ? targetIdx - 1 : targetIdx + 1
            }
            e.preventDefault()
            if (targetIdx < 0 || targetIdx >= blocks.length) return;

            const currentX = rect.x;
            const targetX = caretX ?? currentX;

            placeCaretAtX(targetIdx, targetX);

            setTimeout(updateCaretXFromSelection, 0);
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

        if (type === "checkbox-option") {
            const options = blocks.filter(
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
                blocks.forEach((b, idx) => {
                    if (b.type === "checkbox-option" && b.parentId === groupId) {
                        last = idx;
                    }
                });
                return last;
            })()

            const insertIndex = lastIndex >= 0 ? lastIndex + 1 : blocks.findIndex(b => b.id === groupId) + 1;

            const newBlocks = [
                ...blocks.slice(0, insertIndex),
                newOption,
                ...blocks.slice(insertIndex),
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
            setBlocksState(newBlocks)
            return newBlocks;

        }

        else if (type == "multipleChoice-option") {
            const mcqOptions = blocks.filter(
                b => b.type === "multipleChoice-option" && b.parentId === groupId
            );
            const length = mcqOptions.length;
            const letter = String.fromCharCode(65 + length);
            const newMcq: MultipleChoiceOption = {
                id: uuidv4(),
                type: "multipleChoice-option",
                parentId: groupId,
                letter: letter,
                value: 'Choice'
            };

            const lastIndex = (() => {
                let last = -1;
                blocks.forEach((b, idx) => {
                    if (b.type === "multipleChoice-option" && b.parentId === groupId) last = idx;
                });
                return last;
            })();

            const insertIndex = lastIndex >= 0 ? lastIndex + 1 : blocks.findIndex(b => b.id === groupId) + 1;

            const newBlocks = [
                ...blocks.slice(0, insertIndex),
                newMcq,
                ...blocks.slice(insertIndex)
            ];

            // Push snapshot for undo
            setBlocksState(newBlocks);

            requestAnimationFrame(() => {
                setFocusId(newMcq.id);
                const el = document.getElementById(newMcq.id);
                let target: HTMLElement | null = el;
                if (target && !target.isContentEditable) {
                    const edit = target.querySelector<HTMLElement>('[contenteditable="true"]');
                    if (edit) target = edit;
                }
                if (target) {
                    target.focus();
                    const range = document.createRange();
                    range.selectNodeContents(target);
                    range.collapse(true);
                    const sel = window.getSelection();
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                }
            });
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
            setBlocksState(newBlocks)
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
    const handleAdd = () => {

    }
    const handleDelete = () => {

    }

    useEffect(() => {
        const handler = () => {
            updateCaretXFromSelection();

        };
        document.addEventListener("selectionchange", handler);
        return () => document.removeEventListener("selectionchange", handler);
    }, []);
    switch (block.type) {
        case "text":
            return (
                <BlockWrapper focusId={focusId!} blockId={block.id} className='top-[9px]'><div
                    id={block.id}
                    contentEditable
                    suppressContentEditableWarning
                    data-block-id={block.id}
                    data-placeholder={block.label}
                    onInput={handleInput}
                    onKeyDown={(e) => handleKeyDown({ e, type: block.type, blockId: block.id })}
                    className={cn(
                        "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-neutral-400",
                        "text-xl text-black focus:outline-none font-semibold tracking-tight px-1 py-1"
                    )}
                >
                    {block.content as string}
                </div></BlockWrapper>
            )
        case "input":
            return (
                <BlockWrapper focusId={focusId!} blockId={block.id} className='top-[9px]'>
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
                            "w-60  shadow-checkbox  rounded-lg px-4 py-2 text-sm",
                            "whitespace-nowrap overflow-x-auto overflow-y-hidden scrollbar-hide"
                        )} >{block.content as string}</div>

                </BlockWrapper>
            )
        case "checkbox-group":
            const options = blocks
                .filter((b): b is CheckboxBlock => b.type === "checkbox-option" && b.parentId === block.id)
                .sort((a, b) => blocks.indexOf(a) - blocks.indexOf(b));
            return (

                <div className='flex gap-2 flex-col'>
                    {options.map((opt, idx) => (
                        <BlockWrapper focusId={focusId!} blockId={opt.id} className='top-[2px]'>
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
                        </BlockWrapper>
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
                    </div >
                    }
                </div>


            )
        case "multipleChoice-group":
            const mcqOptions = blocks.filter((b): b is MultipleChoiceOption => b.type === "multipleChoice-option" && b.parentId == block.id)
                .sort((a, b) => blocks.indexOf(a) - blocks.indexOf(b))
            const nextLetter = String.fromCharCode(65 + mcqOptions.length);
            return (

                <div className='flex flex-col gap-2 mt-2'>
                    {mcqOptions.map((mcq, idx) => (
                        <BlockWrapper focusId={focusId!} blockId={mcq.id} className='top-[4px]'>
                            <div key={idx} className=" flex flex-col">
                                <div className='flex items-center gap-1 min-w-28 w-fit max-w-full rounded-md shadow-checkbox px-2 pr-4'>
                                    <div className='rounded-[3px] h-[16px] w-[16px] bg-radio  shadow-checkbox p-2 text-xs font-bold text-shadow-xl flex items-center justify-center text-white '>{mcq.letter}</div>
                                    <div
                                        id={mcq.id} data-block-id={mcq.id}
                                        onKeyDown={(e) => handleKeyDown({ e, type: mcq.type, blockId: mcq.id })}
                                        data-placeholder="Input"
                                        contentEditable="true"
                                        suppressContentEditableWarning
                                        className={cn(
                                            " h-full w-full text-sm focus:outline-none py-[5px] font-normal text-neutral-800"
                                        )} >{mcq.value}</div>
                                </div>
                            </div>
                        </BlockWrapper>
                    ))}
                    {isCaretInMcq() && <div className="flex flex-col ">
                        <div
                            className='flex items-center gap-2 max-w-fit  rounded-lg shadow-checkbox px-3 opacity-20 hover:opacity-80  cursor-pointer'>
                            <div className='rounded-[3px]  h-[17px] w-[18px] bg-radio  shadow-checkbox p-2 text-xs font-bold text-shadow-xl flex items-center justify-center text-white '>{nextLetter}</div>
                            <div
                                data-placeholder="Input"
                                contentEditable="true"
                                suppressContentEditableWarning
                                onMouseDown={() => handleAddOption(block.id, "multipleChoice-option")}
                                className={cn(
                                    "w-full h-full text-sm  focus:outline-none py-2 font-normal text-neutral-800"
                                )} >Add Option</div>
                        </div>
                    </div>}
                </div>

            )
        case "paragraph":
            return (
                <BlockWrapper focusId={focusId!} blockId={block.id} className='top-[4px]'>
                    <div id={block.id} contentEditable={'true'}
                        data-block-id={block.id}
                        onKeyDown={(e) => handleKeyDown({ e, type: block.type, blockId: block.id })}
                        data-placeholder={block.label}
                        onInput={handleInput}
                        suppressContentEditableWarning
                        className={cn("[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-neutral-400 ",
                            "w-full h-full text-sm tracking-wide focus:outline-none  font-normal text-neutral-800 my-1 px-1",
                            "whitespace-nowrap overflow-x-auto overflow-y-hidden scrollbar-hide"
                        )}></div>
                </BlockWrapper>
            )


    }
}
