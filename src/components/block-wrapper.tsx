import { cn } from '@/utils/cn'
import { GripVertical, Plus, Trash } from 'lucide-react'
import React from 'react'

export const BlockWrapper = ({ children, className, focusId, blockId }: { children: React.ReactNode, className: string, focusId: string, blockId: string }) => {
    return (
        <div className='flex relative group '>
            <div className={cn("absolute invisible group-hover:visible flex items-center justify-center -left-14", className,
                focusId == blockId ? "visible" : "invisible"
            )}>
                <button className='hover:bg-neutral-100 p-[2px] cursor-pointer rounded-sm'>
                    <Trash size={14} />
                </button>
                <button className='hover:bg-neutral-100 p-[2px] cursor-pointer rounded-sm'><Plus size={14} /></button>
                <button className='hover:bg-neutral-100 p-[2px] cursor-pointer rounded-sm'>
                    <GripVertical size={14} />
                </button>
            </div>
            <div className='flex-1 '>{children}</div>
        </div>
    )
}
