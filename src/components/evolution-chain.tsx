'use client'

import { useQuery } from '@tanstack/react-query'
import { getEvolutionChain, getPokemonSpecies, getPokemonDetails } from "@/lib/api"
import { Loader2, ArrowRight } from "lucide-react"
import { getPokemonIdFromUrl, getPokemonImageUrl } from "@/lib/pokemon"
// eslint-disable-next-line @next/next/no-img-element
import Image from 'next/image' // Just in case, but using standard img for external URLs is simpler if config issues, but we fixed config.
// using standard img with configured class for simplicity and Framer

interface EvolutionNodeProps {
    chainLink: any // EvolutionChainLink interface
}

function EvolutionNode({ chainLink }: EvolutionNodeProps) {
    const speciesUrl = chainLink.species.url
    const id = getPokemonIdFromUrl(speciesUrl)
    const imageUrl = getPokemonImageUrl(id)
    const name = chainLink.species.name

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 mb-2 p-2 rounded-full bg-secondary/30 border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-contain"
                />
            </div>
            <span className="text-sm font-medium capitalize">{name}</span>

            {/* Recursively render children */}
            {chainLink.evolves_to.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-4 relative">
                    {/* If multiple evolutions (Eevee), show them side by side */}
                    <div className="flex flex-row gap-6">
                        {chainLink.evolves_to.map((child: any, i: number) => (
                            <div key={i} className="flex flex-col items-center">
                                <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90 md:rotate-0 mb-2 md:mb-0 md:mr-2 self-center my-2" />
                                <EvolutionNode chainLink={child} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

interface EvolutionChainProps {
    speciesUrl: string
}

export function EvolutionChain({ speciesUrl }: EvolutionChainProps) {
    const id = getPokemonIdFromUrl(speciesUrl)

    // 1. Fetch Species to get Evolution Chain URL
    const { data: speciesData, isLoading: isLoadingSpecies } = useQuery({
        queryKey: ['species', id],
        queryFn: () => getPokemonSpecies(id)
    })

    const evolutionHelpersUrl = speciesData?.evolution_chain?.url

    // 2. Fetch Evolution Chain
    const { data: evolutionData, isLoading: isLoadingEvo } = useQuery({
        queryKey: ['evolution', evolutionHelpersUrl],
        queryFn: () => getEvolutionChain(evolutionHelpersUrl!),
        enabled: !!evolutionHelpersUrl
    })

    if (isLoadingSpecies || isLoadingEvo) {
        return <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
    }

    if (!evolutionData) return null

    return (
        <div className="flex flex-col items-center overflow-x-auto py-4">
            <h3 className="text-lg font-semibold mb-6">Evolution Chain</h3>
            <div className="min-w-max">
                <EvolutionNode chainLink={evolutionData.chain} />
            </div>
        </div>
    )
}
