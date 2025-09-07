import { cn } from '@/utils/cn';
import { Blocktype } from '@/utils/type'
import React from 'react'
import { v4 as uuidv4 } from 'uuid';

const LableElements = [
    { type: "text", id: uuidv4() },
    { type: "input", id: uuidv4() },
    { type: "checkbox", id: uuidv4() },
    { type: "radio", id: uuidv4() }
]

export const Label = ({ onClick }: { onClick: () => void }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center" >
            <div className='absolute inset-0 w-full bg-neutral-800/50 h-full'
                onClick={onClick}></div>
            <div className='absolute m-auto inset-0 w-72 h-fit p-10 flex flex-col gap-4 bg-white rounded-xl shadow-checkbox z-10'
                onClick={(e) => e.stopPropagation()}>
                {LableElements.map((label, idx) => (
                    <div className='flex gap-2'>
                        {label.type == "text" ? <div className='text-2xl font-bold text-center cursor-pointer'>Heading</div>
                            : label.type == "input" ?
                                <div className='flex items-center gap-1'>
                                    <div
                                        data-placeholder="Input"
                                        className={cn("[&:empty]:before:content-[attr(data-placeholder)] cursor-pointer [&:empty]:before:text-neutral-400",
                                            "px-4  text-sm  focus:outline-none py-1 font-normal shadow-checkbox rounded-sm"
                                        )} ></div>
                                    <div>short content</div>
                                </div>
                                : label.type == "radio" ? <div className='flex items-center gap-1 cursor-pointer'>
                                    <div className='size-2 rounded-xs shadow-checkbox '></div>
                                    <p>Checkbox</p>
                                </div> :
                                    <div className='cursor-pointer'>
                                        Multiple Choice quesiton
                                    </div>
                        }
                    </div>
                ))}
            </div>

        </div>
    )
}
