"use client";
import React, { useRef, useState, useEffect } from "react";

type Block = { id: string; text: string };

export default function NotionLikeEditorFixed() {
    const [blocks] = useState<Block[]>([
        { id: "1", text: "This is the first block of text" },
        { id: "2", text: "Second block with a longer line of text to test movement" },
        { id: "3", text: "Third block, shorter" },
    ]);

    const [caretX, setCaretX] = useState<number | null>(null);
    const refs = useRef<Record<string, HTMLDivElement | null>>({});

    // --- get caret rectangle (position on screen) ---
    function getCaretRect() {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        const range = sel.getRangeAt(0).cloneRange();
        range.collapse(true); // collapse to caret only
        const rects = range.getClientRects();
        return rects.length > 0 ? rects[0] : null;
    }

    // --- place caret in a block at targetX ---
    function placeCaretAtX(blockId: string, targetX: number) {
        const el = refs.current[blockId];
        if (!el) return;

        el.focus(); // ensure the block is focused so caret becomes visible

        const range = document.createRange();
        const sel = window.getSelection();
        if (!sel) return;

        // Search for closest character inside block
        type Best = { node: Node | null; offset: number; dist: number };
        let best: Best = { node: null, offset: 0, dist: Infinity };

        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const text = node.textContent || "";
            for (let i = 0; i <= text.length; i++) {
                try {
                    range.setStart(node, i);
                } catch (err) {
                    continue; // invalid positions may throw
                }
                range.collapse(true);
                const rect = range.getClientRects()[0];
                if (!rect) continue;
                const dist = Math.abs(rect.x - targetX);
                if (dist < best.dist) {
                    best = { node, offset: i, dist };
                }
            }
        }

        // If no text node found (empty block), put caret at the start of the element
        if (!best.node) {
            try {
                range.setStart(el, 0);
            } catch (err) {
                // fallback: try the first child
                if (el.firstChild) {
                    range.setStart(el.firstChild, 0);
                }
            }
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return;
        }

        // Apply new caret position
        range.setStart(best.node, best.offset);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    // --- helper: find the block id that contains current selection anchor ---
    function getCurrentBlockIdFromSelection() {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        const anchor = sel.anchorNode;
        if (!anchor) return null;
        return Object.entries(refs.current).find(([id, el]) => el?.contains(anchor))?.[0] ?? null;
    }

    // --- update caretX from current selection rect ---
    function updateCaretXFromSelection() {
        const rect = getCaretRect();
        console.log('rec lo', rect!.x)
        if (rect) setCaretX(rect.x);
    }

    // --- handle key movement ---
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            // update caretX for most navigation keys so mouse click / Home/End are covered
            if (
                e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "Home" ||
                e.key === "End"
            ) {
                // small timeout to let browser update selection after the key action
                setTimeout(updateCaretXFromSelection, 0);
            }

            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                const rect = getCaretRect();
                if (!rect) return;
                const sel = window.getSelection();
                if (!sel || sel.rangeCount === 0) return;

                const currentBlockId = getCurrentBlockIdFromSelection();
                if (!currentBlockId) return;

                const blockIds = blocks.map((b) => b.id);
                const idx = blockIds.indexOf(currentBlockId);
                let targetIdx = e.key === "ArrowUp" ? idx - 1 : idx + 1;
                if (targetIdx < 0 || targetIdx >= blockIds.length) return;

                e.preventDefault(); // stop browser default line jump
                const targetBlockId = blockIds[targetIdx];

                // Use stored caretX if available (updated on mouse/select/left-right); otherwise use current rect.x
                const targetX = caretX ?? rect.x;
                placeCaretAtX(targetBlockId, targetX);

                // after moving, update caretX to the new position (allow browser to finish placement)
                setTimeout(updateCaretXFromSelection, 0);
            }
        }

        // selectionchange catches mouse clicks, programmatic changes and some keyboard changes
        function handleSelectionChange() {
            // small debounce by scheduling, prevents too many updates during drag-selection
            setTimeout(() => {
                const rect = getCaretRect();
                if (rect) setCaretX(rect.x);
            }, 0);
        }

        document.addEventListener("keydown", handleKey);
        document.addEventListener("selectionchange", handleSelectionChange);
        document.addEventListener("mouseup", updateCaretXFromSelection);

        return () => {
            document.removeEventListener("keydown", handleKey);
            document.removeEventListener("selectionchange", handleSelectionChange);
            document.removeEventListener("mouseup", updateCaretXFromSelection);
        };
    }, [caretX, blocks]);

    return (
        <div className="p-4 space-y-2 border rounded w-[700px]">
            <h2 className="text-lg font-bold mb-2">📝 Notion-like Caret Movement (Fixed)</h2>
            {blocks.map((b) => (
                <div
                    key={b.id}
                    ref={(el) => (refs.current[b.id] = el)}
                    contentEditable
                    suppressContentEditableWarning
                    className="p-2 border rounded focus:outline-none min-h-[30px]"
                    // give each block a tabindex so it can be focused programmatically
                    tabIndex={0}
                >
                    {b.text}
                </div>
            ))}
            <p className="text-sm text-gray-500 mt-2">
                Click anywhere to place caret, or use arrow keys. Now mouse clicks + arrow-up/down keep the
                expected X position.
            </p>
        </div>
    );
}
