import { cn } from '@/utils/cn';
import { Blocktype } from '@/utils/type';
import React from 'react'


// // [
//   { "type": "insert", "blockId": "b1", "content": "What's your name?" },
//   { "type": "update", "blockId": "b1", "prev": "What's your name?", "next": "Your full name?" },
//   { "type": "insertOption", "blockId": "b2", "optionId": "o1", "label": "Red" }
// ]

export const Block = ({ block, key }: { block: Blocktype, key: number }) => {

    switch (block.type) {
        case "text":
            return (
                <div key={key} id={block.id} contentEditable={'true'}

                    onInput={(e) => {
                        const value = e.currentTarget.textContent;
                        console.log(value);
                    }}
                    className={cn(
                        "text-xl focus:outline-none font-semibold tracking-tight p-2"
                    )}></div>
            )
        case "input":
            return (
                <div key={key} id={block.id} className='w-60  border-2  rounded-lg border-neutral-400 text-sm '>
                    <div
                        data-placeholder="Input"
                        className={cn("[&:empty]:before:content-[attr(data-placeholder)]  [&:empty]:before:text-neutral-400",
                            "w-full h-full text-sm  focus:outline-none px-4 py-2 font-normal"
                        )} ></div>
                </div>
            )
        case "checkbox":
            return (
                <div key={key} id={block.id} className=" flex flex-col px-1">
                    {block.options.map((option, idx) => (
                        <div key={idx} className='flex items-center gap-2'>
                            <div className='rounded-[3px]  h-[17px] w-[18px] bg-white  shadow-checkbox'></div>
                            <div
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
                <div key={key} id={block.id} className=" flex flex-col px-1 border shadow-checkbox">
                    {block.options.map((option, idx) => (
                        <div key={idx} className='flex items-center gap-2'>
                            <div className='rounded-[3px]  h-[17px] w-[18px] bg-white  shadow-checkbox'></div>
                            <div
                                data-placeholder="Input"
                                contentEditable="true"
                                className={cn("[&:empty]:before:content-[attr(data-placeholder)]  [&:empty]:before:text-neutral-400",
                                    "w-full h-full text-sm  focus:outline-none py-2 font-normal"
                                )} >{option}</div>
                        </div>
                    ))}
                </div>
            )

    }
}
