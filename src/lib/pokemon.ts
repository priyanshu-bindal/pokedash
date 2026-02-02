import { PokemonLite } from "@/types/pokemon";

// Base URL for Official Artwork (high quality)
const IMAGE_BASE_URL =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

export function getPokemonIdFromUrl(url: string): number {
    const parts = url.split("/").filter(Boolean);
    return parseInt(parts[parts.length - 1], 10);
}

export function getPokemonImageUrl(id: number): string {
    return `${IMAGE_BASE_URL}/${id}.png`;
}

export function formatPokemonName(name: string): string {
    return name.replace(/-/g, " ");
}

export function normalizeStat(value: number): number {
    // Max stat is theoretically 255 but usually lower. 150 is a good baseline for graphs.
    // However, sticking to 255 for "true" normalization.
    return (value / 255) * 100; // Returns percentage
}
