"use client"

import { useEffect, useState, useMemo } from "react"
import { createPortal } from "react-dom"
import { Shield, ShieldAlert, ShieldCheck, X, Info } from "lucide-react"
import { Pokemon } from "@/types/pokemon"
import { TYPE_CHART, ALL_TYPES } from "@/lib/types" // Ensure this path is correct
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface TypeCoverageProps {
    team: Pokemon[]
    isOpen: boolean
    onClose: () => void
}

export function TypeCoverage({ team, isOpen, onClose }: TypeCoverageProps) {
    const [stats, setStats] = useState<Record<string, any>>({})
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return;

        // DEBUGGING: Check your console to see what 'team' actually looks like
        console.log("Current Team Data:", team);

        const newStats: Record<string, { weak: number; resistant: number; immune: number }> = {};

        ALL_TYPES.forEach((attackingType) => {
            let weak = 0;
            let resistant = 0;
            let immune = 0;

            team.forEach((pokemon: Pokemon) => {
                // SAFETY CHECK: Ensure types exist and handle both String ("fire") and Object ({ type: { name: "fire" } }) formats
                if (!pokemon.types) return;

                const pTypes = pokemon.types.map((t: any) => {
                    if (typeof t === 'string') return t.toLowerCase();
                    if (t.type && t.type.name) return t.type.name.toLowerCase();
                    return '';
                }).filter(Boolean); // Remove empty strings

                // Skip if no valid types found
                if (pTypes.length === 0) return;

                let multiplier = 1;

                pTypes.forEach((defendingType: string) => {
                    // Normalize keys to lowercase to match TYPE_CHART
                    const atkKey = attackingType.toLowerCase();
                    const defKey = defendingType.toLowerCase();

                    // Safe access to the chart
                    if (TYPE_CHART[atkKey] && TYPE_CHART[atkKey][defKey] !== undefined) {
                        multiplier *= TYPE_CHART[atkKey][defKey];
                    }
                });

                if (multiplier > 1) weak++;
                if (multiplier < 1 && multiplier > 0) resistant++;
                if (multiplier === 0) immune++;
            });

            newStats[attackingType] = { weak, resistant, immune };
        });

        setStats(newStats);
    }, [team, mounted]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-5xl bg-background rounded-xl border shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-background/95 backdrop-blur">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            Team Defense Analysis
                            <Badge variant="secondary" className="ml-2 font-mono text-sm">
                                {team.length} Pokémon
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            See how well your team defends against each type.
                        </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6">
                    {team.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Add Pokémon to your team to see type analysis.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {ALL_TYPES.map((type) => {
                                const data = stats[type] || { weak: 0, resistant: 0, immune: 0 };
                                const isThreat = data.weak > 0;
                                const netScore = data.resistant + data.immune - data.weak;

                                return (
                                    <div key={type} className="border rounded-lg p-3 bg-card text-card-foreground shadow-sm overflow-hidden border-l-4" style={{
                                        borderLeftColor: netScore < 0 ? 'hsl(var(--destructive))' : netScore > 0 ? 'hsl(142, 76%, 36%)' : 'hsl(var(--muted))'
                                    }}>
                                        <h4 className="font-bold capitalize mb-2 flex items-center justify-between gap-2">
                                            <span className={netScore < 0 ? "text-destructive" : ""}>{type}</span>
                                            {netScore < 0 && <ShieldAlert className="w-4 h-4 text-destructive" />}
                                            {netScore > 0 && <ShieldCheck className="w-4 h-4 text-green-600" />}
                                        </h4>
                                        <div className="space-y-1 text-sm">
                                            <div className={`flex justify-between p-1 rounded ${data.weak > 0 ? 'bg-destructive/10 text-destructive font-medium' : 'text-muted-foreground'}`}>
                                                <span className="flex items-center gap-1">Weak</span>
                                                <span>{data.weak}</span>
                                            </div>
                                            <div className={`flex justify-between p-1 rounded ${data.resistant > 0 ? 'bg-green-500/10 text-green-600 font-medium' : 'text-muted-foreground'}`}>
                                                <span className="flex items-center gap-1">Resistant</span>
                                                <span>{data.resistant}</span>
                                            </div>
                                            <div className={`flex justify-between p-1 rounded ${data.immune > 0 ? 'bg-blue-500/10 text-blue-500 font-medium' : 'text-muted-foreground'}`}>
                                                <span className="flex items-center gap-1">Immune</span>
                                                <span>{data.immune}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}
