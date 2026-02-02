import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Pokemon } from '@/types/pokemon'

interface TeamStore {
    team: Pokemon[]
    addToTeam: (pokemon: Pokemon) => void
    removeFromTeam: (pokemonId: number) => void
    clearTeam: () => void
    reorderTeam: (newTeam: Pokemon[]) => void
    setTeam: (newTeam: Pokemon[]) => void
    updatePokemonConfig: (id: number, config: { selectedAbility?: string | null; selectedMoves?: (string | null)[] }) => void
}

export const useTeamStore = create<TeamStore>()(
    persist(
        (set) => ({
            team: [],
            addToTeam: (pokemon: Pokemon) =>
                set((state: TeamStore) => {
                    if (state.team.length >= 6) {
                        return state
                    }
                    if (state.team.some((p) => p.id === pokemon.id)) {
                        return state
                    }
                    return { team: [...state.team, pokemon] }
                }),
            removeFromTeam: (pokemonId: number) =>
                set((state: TeamStore) => ({
                    team: state.team.filter((p) => p.id !== pokemonId),
                })),
            clearTeam: () => set({ team: [] }),
            reorderTeam: (newTeam: Pokemon[]) => set({ team: newTeam }),
            setTeam: (newTeam: Pokemon[]) => set({ team: newTeam }),
            updatePokemonConfig: (id: number, config: { selectedAbility?: string | null; selectedMoves?: (string | null)[] }) =>
                set((state: TeamStore) => ({
                    team: state.team.map((p) =>
                        p.id === id ? { ...p, ...config } : p
                    ),
                })),
        }),
        {
            name: 'pokedash-team-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
