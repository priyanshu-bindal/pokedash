'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { PokemonLite } from "@/types/pokemon"
import { getPokemonImageUrl, getPokemonIdFromUrl, formatPokemonName } from "@/lib/pokemon"
import { useTeamStore } from "@/store/useTeamStore"
import { cn } from "@/lib/utils"
import { useDraggable } from '@dnd-kit/core'

import { useRouter } from 'next/navigation'
// ...

export interface PokemonCardProps {
    pokemon: PokemonLite
    index: number
}

export function PokemonCard({ pokemon, index }: PokemonCardProps) {
    const router = useRouter() // Add router
    // ...
    const id = pokemon.id || getPokemonIdFromUrl(pokemon.url)
    const imageUrl = pokemon.image || getPokemonImageUrl(id)
    const formattedName = formatPokemonName(pokemon.name)

    const { addToTeam, removeFromTeam, team } = useTeamStore()
    const isInTeam = team.some((p) => p.id === id)
    const isTeamFull = team.length >= 6

    // DnD Hook
    const { attributes, listeners, setNodeRef, transform: dragTransform, isDragging } = useDraggable({
        id: `pokemon-${id}`,
        data: {
            type: 'Pokemon',
            pokemon: { id, name: pokemon.name, imageUrl } // removed 'as any' as it should be fine, or strictly typed if needed. 
        }
    })

    // 3D Tilt Logic
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useSpring(useTransform(y, [-100, 100], [30, -30]), { stiffness: 300, damping: 30 })
    const rotateY = useSpring(useTransform(x, [-100, 100], [-30, 30]), { stiffness: 300, damping: 30 })

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top
        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5
        x.set(xPct * 200)
        y.set(yPct * 200)
    }

    function handleMouseLeave() {
        x.set(0)
        y.set(0)
    }

    const handleAction = (e: React.MouseEvent) => {
        e.stopPropagation()
        // Simplified team addition logic for MVP
        const partialPokemon: any = {
            id,
            name: pokemon.name,
            sprites: {
                front_default: imageUrl,
                other: { 'official-artwork': { front_default: imageUrl } }
            },
            types: [],
            stats: []
        }

        if (isInTeam) {
            removeFromTeam(id)
        } else if (!isTeamFull) {
            addToTeam(partialPokemon)
        }
    }

    const style = dragTransform ? {
        transform: `translate3d(${dragTransform.x}px, ${dragTransform.y}px, 0)`,
        zIndex: isDragging ? 50 : undefined,
    } : undefined

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none h-full">
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className={cn("relative groupPerspective h-full", isDragging && "opacity-50")}
            >
                <Card
                    onClick={() => router.push(`?pokemon=${pokemon.name}`, { scroll: false })}
                    className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors cursor-pointer group h-full bg-card/50 backdrop-blur-sm"
                >
                    <CardContent className="p-6 flex flex-col items-center gap-4 relative z-10">
                        <div className="absolute top-2 right-2 text-xs font-mono text-muted-foreground opacity-50">
                            #{String(id).padStart(3, '0')}
                        </div>

                        <motion.div
                            className="relative w-32 h-32"
                            style={{ transformStyle: "preserve-3d", transform: "translateZ(50px)" }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={imageUrl}
                                alt={pokemon.name}
                                className="w-full h-full object-contain drop-shadow-xl select-none pointer-events-none" // prevent img drag
                                loading="lazy"
                            />
                        </motion.div>

                        <div className="text-center space-y-2" style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}>
                            <h3 className="font-bold capitalize text-lg tracking-tight">
                                {formattedName}
                            </h3>
                        </div>
                    </CardContent>
                    <CardFooter className="p-3 bg-secondary/20 flex justify-between items-center transition-colors group-hover:bg-secondary/40">
                        <Button
                            variant={isInTeam ? "destructive" : "secondary"}
                            size="sm"
                            className={cn("w-full transition-all", isInTeam && "hover:bg-destructive/90")}
                            onClick={handleAction}
                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on button click
                        >
                            {isInTeam ? (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add to Team
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}
