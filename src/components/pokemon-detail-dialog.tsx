'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, Plus, Trash2 } from "lucide-react"
import { getPokemonDetails } from "@/lib/api"
import { StatsChart } from "@/components/stats-chart"
import { EvolutionChain } from "@/components/evolution-chain"
import { useTeamStore } from "@/store/useTeamStore"
import { formatPokemonName } from "@/lib/pokemon"
import { cn } from "@/lib/utils"

export function PokemonDetailDialog() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pokemonName = searchParams.get('pokemon')
    const [isShiny, setIsShiny] = useState(false)

    const isOpen = !!pokemonName



    const { data: pokemon, isLoading } = useQuery({
        queryKey: ['pokemonDetails', pokemonName],
        queryFn: () => getPokemonDetails(pokemonName!),
        enabled: isOpen,
        staleTime: Infinity
    })

    // Team Logic
    const { addToTeam, removeFromTeam, team } = useTeamStore()
    const isInTeam = pokemon ? team.some((p) => p.id === pokemon.id) : false
    const isTeamFull = team.length >= 6

    const handleClose = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('pokemon')
        router.push(`?${params.toString()}`, { scroll: false })
    }

    const handleTeamAction = () => {
        if (!pokemon) return
        if (isInTeam) {
            removeFromTeam(pokemon.id)
        } else if (!isTeamFull) {
            addToTeam(pokemon)
        }
    }

    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold capitalize flex items-center gap-4">
                        {formatPokemonName(pokemon?.name || "Loading...")}
                        {pokemon && (
                            <span className="text-lg text-muted-foreground font-mono">
                                #{String(pokemon.id).padStart(3, '0')}
                            </span>
                        )}
                    </DialogTitle>
                    <div className="flex gap-2 mt-2">
                        {pokemon?.types.map((t: any) => (
                            <Badge key={t.type.name} variant="outline" className="uppercase tracking-wider">
                                {t.type.name}
                            </Badge>
                        ))}
                    </div>
                </DialogHeader>

                {isLoading ? (
                    <div className="h-64 flex justify-center items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {/* Hero Section: Sprite & Toggles */}
                        <div key={pokemon.id} className="flex flex-col items-center justify-center p-6 bg-secondary/20 rounded-lg relative min-h-[250px]">
                            <div className="absolute top-4 right-4 flex items-center space-x-2">
                                <Label htmlFor="shiny-mode" className="flex items-center gap-1 cursor-pointer">
                                    <Sparkles className={cn("w-4 h-4", isShiny ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                                    <span className="text-xs font-medium">Shiny</span>
                                </Label>
                                <Switch id="shiny-mode" checked={isShiny} onCheckedChange={setIsShiny} />
                            </div>

                            <div className="w-48 h-48 relative drop-shadow-2xl transition-all duration-500">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={
                                        isShiny
                                            ? pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.front_shiny
                                            : pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default
                                    }
                                    alt={pokemon.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>

                        {/* Tabs for Details */}
                        <Tabs defaultValue="stats" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="stats">Stats</TabsTrigger>
                                <TabsTrigger value="evolution">Evolution</TabsTrigger>
                            </TabsList>
                            <TabsContent value="stats" className="mt-4">
                                <StatsChart stats={pokemon.stats} />
                            </TabsContent>
                            <TabsContent value="evolution" className="mt-4">
                                {/* We need species URL to fetch chain. Using simple helper or extracting from stored data if we had it. 
                            But `pokemon` endpoint returns `species: { name, url }`. Perfect. */}
                                <EvolutionChain speciesUrl={pokemon.species.url} />
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="sm:justify-between gap-4">
                            <div className="text-sm text-muted-foreground flex items-center">
                                Height: {pokemon.height / 10}m | Weight: {pokemon.weight / 10}kg
                            </div>
                            <Button
                                onClick={handleTeamAction}
                                variant={isInTeam ? "destructive" : "default"}
                                className="w-full sm:w-auto"
                            >
                                {isInTeam ? (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remove from Team
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add to Team {isTeamFull && "(Full)"}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
