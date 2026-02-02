"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface MoveComboboxProps {
    moves: string[]
    selectedMove: string | null
    onSelectMove: (move: string | null) => void
    disabledMoves?: string[]
}

export function MoveCombobox({
    moves,
    selectedMove,
    onSelectMove,
    disabledMoves = [],
}: MoveComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")

    // Filter moves based on search
    const filteredMoves = React.useMemo(() => {
        if (!searchValue) return moves.slice(0, 50) // Show first 50 by default
        return moves.filter((move) =>
            move.toLowerCase().includes(searchValue.toLowerCase())
        )
    }, [moves, searchValue])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between capitalize"
                >
                    {selectedMove ? selectedMove.replace(/-/g, " ") : "Select move..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder="Search moves..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>No move found.</CommandEmpty>
                        <CommandGroup>
                            {/* Clear selection option */}
                            {selectedMove && (
                                <CommandItem
                                    value="_clear_"
                                    onSelect={() => {
                                        onSelectMove(null)
                                        setOpen(false)
                                        setSearchValue("")
                                    }}
                                    className="text-muted-foreground italic"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            "opacity-0"
                                        )}
                                    />
                                    (Clear selection)
                                </CommandItem>
                            )}

                            {filteredMoves.map((move) => {
                                const isDisabled = disabledMoves.includes(move)
                                const isSelected = selectedMove === move

                                return (
                                    <CommandItem
                                        key={move}
                                        value={move}
                                        onSelect={(currentValue: string) => {
                                            if (!isDisabled) {
                                                onSelectMove(currentValue === selectedMove ? null : currentValue)
                                                setOpen(false)
                                                setSearchValue("")
                                            }
                                        }}
                                        disabled={isDisabled}
                                        className={cn(
                                            "capitalize",
                                            isDisabled && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {move.replace(/-/g, " ")}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
