import { BlocksContext } from '@/context/context'
import { cn } from '@/utils/cn'
import { GripVertical, Plus, Trash } from 'lucide-react'
import React, { useContext } from 'react'

export const BlockWrapper = ({ children, className, focusId, blockId }: { children: React.ReactNode, className: string, focusId: string, blockId: string, }) => {
    const context = useContext(BlocksContext)
    if (!context) throw new Error("Block context not found")
    const { setIsOpen } = context
    return (
        <div className='flex relative group px-28'>
            <div className={cn("absolute invisible group-hover:visible hover:visible flex items-center justify-center left-14", className,
                focusId == blockId ? "visible" : "invisible"
            )}>
                <button className='hover:bg-neutral-100 p-[2px] cursor-pointer rounded-sm'>
                    <Trash size={14} />
                </button>
                <button className='hover:bg-neutral-100 p-[2px] cursor-pointer rounded-sm'
                    onClick={() => {
                        console.log("clicked")
                        console.log("items", focusId, blockId)
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
                        setIsOpen(true)
                    }}><Plus size={14} /></button>
                <button className='hover:bg-neutral-100 p-[2px] cursor-pointer rounded-sm'>
                    <GripVertical size={14} />
                </button>
            </div>
            <div className='flex-1 '>{children}</div>
        </div>
    )
}
