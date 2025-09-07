import { cn } from '@/utils/cn';
import React from 'react'


// // [
//   { "type": "insert", "blockId": "b1", "content": "What's your name?" },
//   { "type": "update", "blockId": "b1", "prev": "What's your name?", "next": "Your full name?" },
//   { "type": "insertOption", "blockId": "b2", "optionId": "o1", "label": "Red" }
// ]

export const Block = ({ block }: { block: Block }) => {

    switch (block.type) {
        case "text":
            return (
                <div contentEditable={'true'}
                    data-placeholder="Input"
                    onInput={(e) => {
                        const value = e.currentTarget.textContent;
                        console.log(value);
                    }}
                    className={cn("[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-neutral-400",
                        "text-xl font-semibold tracking-tight p-2"
                    )}></div>
            )
        case "input":
            return (
                <div className='w-full h-20 border border-neutral-400 text-sm '>
                    <div className='w-full h-full ' ></div>
                </div>
            )
    }
}
