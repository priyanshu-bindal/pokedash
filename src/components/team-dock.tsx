import { useDroppable } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import { useTeamStore } from "@/store/useTeamStore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, X, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { TypeCoverage } from "@/components/type-coverage"
import { useState } from 'react'
import { toPng } from 'html-to-image'
import { Download } from 'lucide-react'
import { ShareTeamButton } from "@/components/share-team-button"
import { PokemonConfigDialog } from "@/components/pokemon-config-dialog"
import { Pokemon } from "@/types/pokemon"

export function TeamDock() {
    const { team, removeFromTeam, clearTeam } = useTeamStore()
    const [showAnalysis, setShowAnalysis] = useState(false)
    const [configPokemon, setConfigPokemon] = useState<Pokemon | null>(null)

    const handleExport = async () => {
        const element = document.getElementById('team-capture-area')
        if (!element) return

        try {
            const dataUrl = await toPng(element, { cacheBust: true, backgroundColor: '#1a1a1a' })
            const link = document.createElement('a')
            link.download = 'my-pokedash-team.png'
            link.href = dataUrl
            link.click()
        } catch (err) {
            console.error('Failed to export image', err)
        }
    }

    // Use Droppable for the whole dock area
    const { setNodeRef, isOver } = useDroppable({
        id: 'team-dock',
    })

    // Empty slots calculation
    const maxSlots = 6
    const emptySlots = maxSlots - team.length

    return (
        <>
            <TypeCoverage team={team} isOpen={showAnalysis} onClose={() => setShowAnalysis(false)} />
            <div className="fixed bottom-0 left-0 right-0 p-4 z-40 pointer-events-none flex justify-center">
                <Card
                    ref={setNodeRef}
                    className={cn(
                        "pointer-events-auto w-full max-w-4xl bg-background/80 backdrop-blur-md border-t border-x rounded-t-xl shadow-2xl transition-all duration-300",
                        isOver ? "ring-4 ring-primary ring-offset-2 bg-secondary/50" : ""
                    )}
                >
                    <div className="p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">Your Team ({team.length}/6)</h3>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowAnalysis(true)}
                                    disabled={team.length === 0}
                                    className="gap-2"
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    Analysis
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { handleExport() }}
                                    disabled={team.length === 0}
                                    className="gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                </Button>
                                <ShareTeamButton />
                                <Button variant="ghost" size="sm" onClick={clearTeam} disabled={team.length === 0} className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Clear
                                </Button>
                            </div>
                        </div>

                        <div id="team-capture-area" className="flex gap-2 justify-center flex-wrap sm:flex-nowrap p-4 rounded-lg bg-background/50">
                            <AnimatePresence mode='popLayout'>
                                {team.map((pokemon) => (
                                    <motion.div
                                        key={pokemon.id}
                                        layout
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="relative group w-16 h-16 sm:w-20 sm:h-20 bg-card border rounded-lg flex items-center justify-center shrink-0"
                                    >
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-50 h-5 w-5"
                                            onClick={() => removeFromTeam(pokemon.id)}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="absolute -top-2 -left-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-50 h-5 w-5"
                                            onClick={() => setConfigPokemon(pokemon)}
                                        >
                                            <Settings className="w-3 h-3" />
                                        </Button>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={pokemon.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                                            alt={pokemon.name}
                                            className="w-14 h-14 object-contain"
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Empty Slots */}
                            {Array.from({ length: Math.max(0, emptySlots) }).map((_, i) => (
                                <div
                                    key={`empty-${i}`}
                                    className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center shrink-0"
                                >
                                    <span className="text-xs text-muted-foreground/50 font-bold">{i + 1 + team.length}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            <PokemonConfigDialog
                pokemon={configPokemon}
                isOpen={configPokemon !== null}
                onClose={() => setConfigPokemon(null)}
            />
        </>
    )
}
