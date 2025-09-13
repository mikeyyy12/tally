"use client"
import { BlocksContext } from "@/context/context";
import { cn } from "@/utils/cn";
import { Blocktype } from "@/utils/type";
import React, { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const LableElements = [
    { type: "text", id: uuidv4() },
    { type: "input", id: uuidv4() },
    { type: "checkbox", id: uuidv4() },
    { type: "radio", id: uuidv4(), options: [{ letter: "", value: "" }] },
];

export const Label = ({
    coords,
    setBlocks,
    close,

}: {
    coords: { x: number, y: number },
    close: () => void,
    setBlocks: React.Dispatch<React.SetStateAction<Blocktype[]>>;

}) => {

    const context = useContext(BlocksContext)
    if (!context) throw new Error("Context not found")

    const { blocks, setIsOpen, currnetId, setFocusId, focusId } = context;


    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute h-full w-full" onClick={close}></div>
            {coords && <div
                className="absolute m-auto w-fit h-fit py-4 px-4 flex flex-col gap-4 bg-white rounded-xl shadow-checkbox z-10"
                style={{
                    top: coords.y + window.scrollY,
                    left: coords.x + window.scrollX,
                    position: "absolute",
                }}
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                {LableElements.map((label) => (
                    <div key={label.id} className="flex gap-2 cursor-pointer">
                        {label.type === "text" ? (
                            <div
                                className="text-2xl font-bold text-center"
                                onClick={() => {
                                    console.log('clicked')
                                    const index = blocks.findIndex((b) => b.id == currnetId)
                                    const currentDiv = document.getElementById(currnetId);
                                    const rawText = currentDiv?.textContent ?? "";
                                    const cleaned = rawText.trim();

                                    const isEmpty = cleaned === "" || cleaned === "/"
                                    let newBlock = { type: "text" as const, id: uuidv4(), label: "Heading 1", content: "" };

                                    let newBlocks;
                                    if (isEmpty) {
                                        newBlocks = [...blocks.slice(0, index),
                                            newBlock,
                                        ...blocks.slice(index + 1)
                                        ]
                                    } else {
                                        newBlocks = [...blocks.slice(0, index + 1),
                                            newBlock,
                                        ...blocks.slice(index + 1)
                                        ]
                                    }

                                    setBlocks(newBlocks);
                                    setIsOpen(false)
                                    console.log("new block id:", newBlock.id)
                                    setFocusId(newBlock.id)
                                }
                                }
                            >
                                Heading
                            </div>
                        ) : label.type === "input" ? (
                            <div
                                className="flex items-center gap-1"
                                onClick={() =>
                                    setBlocks((prev) => [
                                        ...prev,
                                        {
                                            type: "input",
                                            id: uuidv4(),
                                            label: "New input",
                                            required: false,
                                        },
                                    ])
                                }
                            >
                                <div
                                    data-placeholder="Input"
                                    className={cn(
                                        "[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-neutral-400",
                                        "px-4 text-sm focus:outline-none py-1 font-normal shadow-checkbox rounded-sm"
                                    )}
                                ></div>
                                <div>short content</div>
                            </div>
                        ) : label.type === "checkbox" ? (
                            <div
                                className="flex items-center gap-1"
                                onClick={() =>
                                    setBlocks((prev) => [
                                        ...prev,
                                        {
                                            type: "checkbox",
                                            id: uuidv4(),
                                            label: "New checkbox",
                                            options: ["Option "],
                                        },
                                    ])
                                }
                            >
                                <div className="size-2 rounded-xs shadow-checkbox"></div>
                                <p>Checkbox</p>
                            </div>
                        ) : (
                            <div
                                className="flex items-center gap-1"
                                onClick={() =>
                                    setBlocks((prev) => {
                                        if (prev.length > 0 && prev[prev.length - 1].type === "radio") {

                                            return prev.map((block, idx) => {
                                                if (idx === prev.length - 1 && block.type == "radio") {
                                                    const lastOption = block.options[block.options.length - 1];
                                                    const nextLetter = String.fromCharCode(lastOption.letter.charCodeAt(0) + 1);

                                                    return {
                                                        ...block,
                                                        options: [
                                                            ...block.options,
                                                            { letter: nextLetter, value: `Option ${nextLetter}` },
                                                        ],
                                                    };
                                                }
                                                return block;
                                            });
                                        } else {

                                            return [
                                                ...prev,
                                                {
                                                    type: "radio",
                                                    id: uuidv4(),
                                                    label: "New radio",
                                                    options: [{ letter: "A", value: "Option A" }],
                                                },
                                            ];
                                        }
                                    })
                                }
                            >
                                <div className="size-2 rounded-xs shadow-checkbox"></div>
                                <p>Multiple Choice</p>
                            </div>

                        )}
                    </div>
                ))}
            </div>}
        </div>
    );
};
