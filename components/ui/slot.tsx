import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const SlotComponent = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & { asChild?: boolean }>(
    ({ asChild, ...props }, ref) => {
        if (asChild) {
            return <Slot {...props} />
        }
        return <div {...props} />
    }
)
SlotComponent.displayName = "Slot"

export { Slot }
