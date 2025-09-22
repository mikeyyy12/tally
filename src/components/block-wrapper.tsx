import { GripVertical, Plus, Trash } from 'lucide-react'
import React from 'react'

export const BlockWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='flex relative  group'>
            <div className=' absolute top-[9px] invisible group-hover:visible flex items-center justify-center -left-14'>

                <button className='hover:bg-neutral-100 p-[2px] cursor-pointer rounded-sm'>
                    <Trash size={14} />
                </button>
                <button className='hover:bg-neutral-100 p-[2px] cursor-pointer rounded-sm'><Plus size={14} /></button>
                <button className='hover:bg-neutral-100 p-[2px] cursor-pointer rounded-sm'>
                    <GripVertical size={14} />
                </button>
            </div>
            <div className='flex-1'>{children}</div>
        </div>
    )
}
