import { cn } from '@/utils/cn';
import { Blocktype } from '@/utils/type';
import React from 'react'


// // [
//   { "type": "insert", "blockId": "b1", "content": "What's your name?" },
//   { "type": "update", "blockId": "b1", "prev": "What's your name?", "next": "Your full name?" },
//   { "type": "insertOption", "blockId": "b2", "optionId": "o1", "label": "Red" }
// ]

export const Block = ({ block, }: { block: Blocktype }) => {

    switch (block.type) {
        case "text":
            return (
                <div id={block.id} contentEditable={'true'}
                    onInput={(e) => {
                        const value = e.currentTarget.textContent;
                        console.log(value);
                    }}
                    suppressContentEditableWarning
                    className={cn(
                        "text-xl text-black focus:outline-none font-semibold tracking-tight p-2"
                    )}>{block.content as string}</div>
            )
        case "input":
            return (
                <div id={block.id} className='w-60  shadow-checkbox  rounded-lg  text-sm '>
                    <div
                        data-placeholder="Input"
                        className={cn("[&:empty]:before:content-[attr(data-placeholder)]  [&:empty]:before:text-neutral-400 ",
                            "w-full h-full text-sm  focus:outline-none px-4 py-2 font-normal"
                        )} ></div>
                </div>
            )
        case "checkbox":
            return (
                <div id={block.id} className=" flex flex-col px-1">
                    {block.options.map((option, idx) => (
                        <div key={idx} className='flex items-center gap-2'>
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
