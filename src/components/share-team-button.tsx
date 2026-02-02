"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"
import { useTeamStore } from "@/store/useTeamStore"
import { toast } from "sonner"

export function ShareTeamButton() {
    const { team } = useTeamStore()
    const [isCopied, setIsCopied] = useState(false)

    const handleShare = async () => {
        if (team.length === 0) return

        const ids = team.map(p => p.id).join("-")
        const url = `${window.location.origin}/?team=${ids}`

        try {
            await navigator.clipboard.writeText(url)
            setIsCopied(true)
            toast.success("Link copied to clipboard!", {
                description: "Share this link to show off your team!"
            })

            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy:", err)
            toast.error("Failed to copy link.")
        }
    }

    return (
        <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            disabled={team.length === 0}
            className="gap-2"
        >
            {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {isCopied ? "Copied!" : "Share"}
        </Button>
    )
}
