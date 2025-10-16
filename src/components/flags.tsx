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
                <span className='relative'>
                    <span className='absolute bg-white mix-blend-hue h-4 z-1 right-0' style={{width: (100 - percent)*24/100}}/>
                    <Component className='w-6 relative'/>
                </span>
            </TooltipTrigger>
            <TooltipContent arrowPadding={12}>
                {title}
                <TooltipArrow />
            </TooltipContent>
        </Tooltip>
    )
}