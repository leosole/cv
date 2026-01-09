import { GB, DE, ES, BR, type FlagComponent } from 'country-flag-icons/react/3x2'
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { useState } from 'react'

export default function Flag({percent, country, title}: {percent: number, country: string, title?: string}) {
    const [open, setOpen] = useState(false)
    let Component: FlagComponent
    switch (country) {
        case "GB":
            Component = GB
            break
        case "DE":
            Component = DE
            break
        case "ES":
            Component = ES
            break
        default:
            Component = BR
    }
    return (
        <Tooltip onOpenChange={() => setOpen(p => !p)} open={open}>
            <TooltipTrigger onClick={() => setOpen(p => !p)}>
                <span className='w-6 relative inline-block'>
                    <Component className='w-6 relative'/>
                    <span
                        className='absolute inset-y-0 right-0 bg-white mix-blend-hue h-full z-10 pointer-events-none'
                        style={{width: `${100 - percent}%`}}
                    />
                </span>
            </TooltipTrigger>
            <TooltipContent arrowPadding={12}>
                {title}
                <TooltipArrow />
            </TooltipContent>
        </Tooltip>
    )
}