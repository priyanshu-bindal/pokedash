"use client"

import { useState, useMemo } from "react"
import { Pokemon } from "@/types/pokemon"
import { useTeamStore } from "@/store/useTeamStore"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Swords, Zap } from "lucide-react"
import { MoveCombobox } from "@/components/move-combobox"

interface PokemonConfigDialogProps {
    pokemon: Pokemon | null
    isOpen: boolean
    onClose: () => void
}

export function PokemonConfigDialog({ pokemon, isOpen, onClose }: PokemonConfigDialogProps) {
    const { updatePokemonConfig } = useTeamStore()

    // Local state for form
    const [selectedAbility, setSelectedAbility] = useState<string | null>(null)
    const [selectedMoves, setSelectedMoves] = useState<(string | null)[]>([null, null, null, null])

    // Initialize state when dialog opens
    useMemo(() => {
        if (pokemon) {
            setSelectedAbility(pokemon.selectedAbility || null)
            setSelectedMoves(pokemon.selectedMoves || [null, null, null, null])
        }
    }, [pokemon, isOpen])

    if (!pokemon) return null

    // Extract abilities list
    const abilities = pokemon.abilities?.map(a => a.ability.name) || []

    // Extract moves list
    const moves = pokemon.moves?.map(m => m.move.name) || []

    const handleSave = () => {
        updatePokemonConfig(pokemon.id, {
            selectedAbility,
            selectedMoves,
        })
        onClose()
    }

    const handleMoveChange = (index: number, value: string | null) => {
        const newMoves = [...selectedMoves]
        newMoves[index] = value
        setSelectedMoves(newMoves)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl capitalize">
                        <Swords className="w-6 h-6" />
                        Battle Configuration: {pokemon.name}
                    </DialogTitle>
                    <DialogDescription>
                        Customize your Pokémon's ability and moveset for battle.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Ability Selection */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-base">
                            <Zap className="w-4 h-4" />
                            Ability
                        </Label>
                        <Select
                            value={selectedAbility || undefined}
                            onValueChange={(value: string) => setSelectedAbility(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an ability..." />
                            </SelectTrigger>
                            <SelectContent>
                                {abilities.map((ability) => (
                                    <SelectItem key={ability} value={ability} className="capitalize">
                                        {ability.replace(/-/g, " ")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Move Selection */}
                    <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-base">
                            <Swords className="w-4 h-4" />
                            Moves (Select up to 4)
                        </Label>

                        {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="space-y-2">
                                <Label className="text-sm text-muted-foreground">
                                    Move {index + 1}
                                </Label>
                                <MoveCombobox
                                    moves={moves}
                                    selectedMove={selectedMoves[index]}
                                    onSelectMove={(value: string | null) => handleMoveChange(index, value)}
                                    disabledMoves={selectedMoves.filter((m, i) => i !== index && m !== null) as string[]}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Configuration
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
