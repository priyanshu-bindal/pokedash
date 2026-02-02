'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from "@/components/ui/input"
import { PokemonGrid } from "@/components/pokemon-grid"
import { getAllPokemonLite, getPokemonByType } from "@/lib/api"
import { Search, Tent } from "lucide-react"
import { TypeFilter } from "@/components/type-filter"
import { PokemonDetailDialog } from "@/components/pokemon-detail-dialog"
import { TeamDock } from "@/components/team-dock"
import { useDebounce } from "@/hooks/use-debounce"
import { Card } from "@/components/ui/card"
import { useTeamStore } from "@/store/useTeamStore"
import { ModeToggle } from "@/components/mode-toggle"
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core'

// Simple debounce hook implementation inline for now or I'll create the file
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

import { useSharedTeam } from "@/hooks/use-shared-team"

export default function DashboardPage() {
  // Handle shared team loading
  useSharedTeam()

  const [search, setSearch] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const debouncedSearch = useDebounceValue(search, 300)

  // DnD State
  const [activeDragItem, setActiveDragItem] = useState<any>(null)
  const { addToTeam } = useTeamStore()

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current?.pokemon)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event
    setActiveDragItem(null)

    if (over && over.id === 'team-dock') {
      const pokemon = active.data.current?.pokemon
      if (pokemon) {
        addToTeam(pokemon)
      }
    }
  }

  // 1. Fetch all names for Search (Lite List)
  const { data: allPokemon } = useQuery({
    queryKey: ['allPokemonLite'],
    queryFn: getAllPokemonLite,
    staleTime: Infinity,
  })

  // 2. Fetch by Type if selected
  const { data: typePokemon } = useQuery({
    queryKey: ['pokemonByType', selectedType],
    queryFn: () => getPokemonByType(selectedType!),
    enabled: !!selectedType && !debouncedSearch,
  })

  // 3. Determine the list to show
  const isSearching = debouncedSearch.length > 0
  const isFiltering = !!selectedType && !isSearching

  const filteredPokemon = useMemo(() => {
    if (isSearching) {
      if (!allPokemon) return []
      const lower = debouncedSearch.toLowerCase()
      return allPokemon.filter(p => p.name.includes(lower))
    }
    if (isFiltering) {
      return typePokemon || []
    }
    return null
  }, [isSearching, isFiltering, allPokemon, typePokemon, debouncedSearch])



  const showCustomGrid = isSearching || isFiltering

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <main className="min-h-screen p-4 md:p-8 space-y-8 bg-background max-w-7xl mx-auto pb-32">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center gap-2">
              PokéDash <Tent className="w-8 h-8 text-primary" />
            </h1>
            <p className="text-muted-foreground mt-2">
              Build your ultimate dream team.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search Pokémon..."
                className="pl-10"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  if (e.target.value) setSelectedType(null)
                }}
              />
            </div>
            <ModeToggle />
          </div>
        </div>

        {/* Type Filter */}
        <TypeFilter
          selectedType={selectedType}
          onSelectType={setSelectedType}
        />

        {/* Main Content */}
        <PokemonGrid
          searchResults={filteredPokemon}
          isSearching={showCustomGrid}
        />

        <PokemonDetailDialog />
        <TeamDock />

        <DragOverlay>
          {activeDragItem ? (
            <Card className="w-32 h-32 flex items-center justify-center bg-card/80 backdrop-blur border-2 border-primary shadow-2xl rounded-xl cursor-grabbing pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeDragItem.imageUrl || activeDragItem.image || activeDragItem.sprites?.front_default}
                alt={activeDragItem.name}
                className="w-24 h-24 object-contain"
              />
            </Card>
          ) : null}
        </DragOverlay>
      </main>
    </DndContext>
  )
}

// Import needed for getPokemonByType which was missing in imports?
// Check imports relative to file. 

