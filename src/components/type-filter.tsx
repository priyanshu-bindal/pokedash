'use client'

import { useQuery } from "@tanstack/react-query"
import { getTypeList } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface TypeFilterProps {
    selectedType: string | null
    onSelectType: (type: string | null) => void
}

export function TypeFilter({ selectedType, onSelectType }: TypeFilterProps) {
    const { data: typeList } = useQuery({
        queryKey: ['typeList'],
        queryFn: getTypeList
    })

    // Common types to show first or just show all.
    // API returns 20 types including 'shadow' and 'unknown'.
    const types = typeList?.results || []

    return (
        <ScrollArea className="w-full whitespace-nowrap rounded-md border p-4 bg-muted/20">
            <div className="flex w-max space-x-4 p-1">
                <Badge
                    variant={selectedType === null ? "default" : "outline"}
                    className="cursor-pointer text-sm py-1 px-3"
                    onClick={() => onSelectType(null)}
                >
                    All
                </Badge>
                {types.map((type: any) => (
                    <Badge
                        key={type.name}
                        variant={selectedType === type.name ? "default" : "outline"}
                        className={cn(
                            "cursor-pointer text-sm py-1 px-3 capitalize",
                            selectedType === type.name && "ring-2 ring-primary ring-offset-2"
                        )}
                        onClick={() => onSelectType(type.name === selectedType ? null : type.name)}
                    >
                        {type.name}
                    </Badge>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}
