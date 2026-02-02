"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useTeamStore } from "@/store/useTeamStore"
import { Pokemon } from "@/types/pokemon"
import { toast } from "sonner" // Assuming sonner is used, or use-toast if not

export function useSharedTeam() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { setTeam } = useTeamStore()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const teamParam = searchParams.get("team")
        if (!teamParam) return

        const fetchSharedTeam = async () => {
            setIsLoading(true)
            try {
                const ids = teamParam.split("-").filter(Boolean)

                if (ids.length === 0) return

                const promises = ids.map(async (id) => {
                    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
                    if (!res.ok) throw new Error(`Failed to fetch pokemon ${id}`)
                    return res.json()
                })

                const pokemonData = await Promise.all(promises) as Pokemon[]

                // Validate data minimally (check for id/name)
                const validPokemon = pokemonData.filter(p => p.id && p.name)

                if (validPokemon.length > 0) {
                    setTeam(validPokemon)
                    toast.success("Shared Team Loaded!", {
                        description: `Loaded ${validPokemon.length} Pokémon from the link.`
                    })
                }
            } catch (error) {
                console.error("Failed to load team:", error)
                toast.error("Failed to load shared team.", {
                    description: "The link might be invalid or the API is down."
                })
            } finally {
                setIsLoading(false)
                // Clean URL
                const newParams = new URLSearchParams(searchParams.toString())
                newParams.delete("team")
                router.replace(`?${newParams.toString()}`, { scroll: false })
            }
        }

        fetchSharedTeam()
    }, [searchParams, router, setTeam])

    return { isLoading }
}
