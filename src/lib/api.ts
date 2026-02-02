const BASE_URL = "https://pokeapi.co/api/v2";

export interface PokemonListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: { name: string; url: string }[];
}

export async function getPokemonList(limit = 20, offset = 0): Promise<PokemonListResponse> {
    const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
        throw new Error("Failed to fetch pokemon list");
    }
    return response.json();
}

export async function getAllPokemonLite(): Promise<{ name: string; url: string }[]> {
    const response = await fetch(`${BASE_URL}/pokemon?limit=10000`);
    if (!response.ok) {
        throw new Error("Failed to fetch all pokemon");
    }
    const data = await response.json();
    return data.results;
}

export async function getPokemonDetails(nameOrId: string | number): Promise<any> {
    const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch details for ${nameOrId}`);
    }
    return response.json();
}

export async function getPokemonSpecies(nameOrId: string | number): Promise<any> {
    const response = await fetch(`${BASE_URL}/pokemon-species/${nameOrId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch species for ${nameOrId}`);
    }
    return response.json();
}

export async function getEvolutionChain(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch evolution chain");
    }
    return response.json();
}

export async function getTypeList(): Promise<any> {
    const response = await fetch(`${BASE_URL}/type`);
    if (!response.ok) {
        throw new Error("Failed to fetch types");
    }
    return response.json();
}

export async function getPokemonByType(type: string): Promise<{ name: string; url: string }[]> {
    const response = await fetch(`${BASE_URL}/type/${type}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch type ${type}`);
    }
    const data = await response.json();
    return data.pokemon.map((p: any) => p.pokemon);
}
