'use client'

import { useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { getPokemonList } from '@/lib/api'
import { PokemonCard } from './pokemon-grid-card'
import { Loader2 } from 'lucide-react'
import { PokemonLite } from '@/types/pokemon'

interface PokemonGridProps {
    searchResults?: PokemonLite[] | null
    isSearching: boolean
}

export function PokemonGrid({ searchResults, isSearching }: PokemonGridProps) {
    const ref = useRef(null)
    const isInView = useInView(ref)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['pokemonList'],
        queryFn: ({ pageParam = 0 }) => getPokemonList(20, pageParam as number),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            if (!lastPage.next) return undefined
            const url = new URL(lastPage.next)
            return parseInt(url.searchParams.get('offset') || '0')
        },
        enabled: !isSearching, // Disable infinite scroll when searching
    })

    useEffect(() => {
        if (isInView && hasNextPage && !isSearching) {
            fetchNextPage()
        }
    }, [isInView, hasNextPage, fetchNextPage, isSearching])

    // Determine what to display
    const displayList = isSearching
        ? searchResults
        : data?.pages.flatMap((page) => page.results) || []

    if (status === 'pending' && !isSearching) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (status === 'error' && !isSearching) {
        return <div className="text-center text-destructive">Failed to load Pokémon.</div>
    }

    if (isSearching && (!searchResults || searchResults.length === 0)) {
        return <div className="text-center text-muted-foreground mt-10">No Pokémon found.</div>
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {displayList?.map((pokemon: any, index: number) => (
                    // Using name as key might be duplicate in some edge cases but usually fine. 
                    // Better to use URL or ID if available. 
                    <PokemonCard
                        key={`${pokemon.name}-${index}`}
                        pokemon={pokemon}
                        index={index}
                    />
                ))}
            </div>

            {/* Sentinel for Infinite Scroll */}
            {!isSearching && (
                <div ref={ref} className="flex justify-center p-4">
                    {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
                    {!hasNextPage && data && <div className="text-muted-foreground">You have caught them all!</div>}
                </div>
            )}
        </div>
    )
}
