export interface PokemonType {
    slot: number;
    type: {
        name: string;
        url: string;
    };
}

export interface PokemonStat {
    base_stat: number;
    effort: number;
    stat: {
        name: string;
        url: string;
    };
}

export interface PokemonSprite {
    front_default: string;
    front_shiny: string;
    other: {
        "official-artwork": {
            front_default: string;
            front_shiny: string;
        };
        home: {
            front_default: string;
            front_shiny: string;
        };
        showdown: {
            front_default: string;
            front_shiny: string;
        };
    };
}

export interface Pokemon {
    id: number;
    name: string;
    height: number;
    weight: number;
    types: PokemonType[];
    stats: PokemonStat[];
    sprites: PokemonSprite;
    abilities?: { ability: { name: string; url: string }; is_hidden: boolean }[];
    moves?: { move: { name: string; url: string } }[];
    // Battle Configuration (user-selected)
    selectedAbility?: string | null;
    selectedMoves?: (string | null)[];
}

export interface PokemonLite {
    name: string;
    url: string;
    id?: number; // Extracted
    image?: string; // Generated
}

export interface EvolutionChainLink {
    species: {
        name: string;
        url: string;
    };
    evolves_to: EvolutionChainLink[];
    is_baby: boolean;
    evolution_details: {
        min_level: number;
        trigger: {
            name: string;
            url: string;
        };
        item: {
            name: string;
            url: string;
        } | null;
    }[];
}

export interface EvolutionChainResponse {
    chain: EvolutionChainLink;
    id: number;
}
