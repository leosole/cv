import { GB, DE, ES, BR, type FlagComponent } from 'country-flag-icons/react/3x2'

export default function Flag({percent, country, title}: {percent: number, country: string, title?: string}) {
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
        <span className='flex' title={title}>
            <span className='relative'>
                <span className='absolute bg-white mix-blend-hue h-4 z-1 right-0' style={{width: (100 - percent)*24/100}}/>
                <Component className='w-6 relative'/>
            </span>
        </span>
    )
}