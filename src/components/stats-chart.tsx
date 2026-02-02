'use client'

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts'
import { PokemonStat } from "@/types/pokemon"

interface StatsChartProps {
    stats: PokemonStat[]
}

const STAT_LABELS: Record<string, string> = {
    "hp": "HP",
    "attack": "Atk",
    "defense": "Def",
    "special-attack": "SpA",
    "special-defense": "SpD",
    "speed": "Spd",
}

export function StatsChart({ stats }: StatsChartProps) {
    // Normalize data for chart
    const data = stats.map(s => ({
        subject: STAT_LABELS[s.stat.name] || s.stat.name,
        A: s.base_stat,
        fullMark: 255, // Theoretical Max
    }))

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "hsl(var(--foreground))", fontSize: 12, fontWeight: "bold" }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar
                        name="Stats"
                        dataKey="A"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.4}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                        itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                        cursor={false}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    )
}
