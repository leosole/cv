import type { Links } from "@/types/cv";
import { ArrowWithBorder, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/button";
import useMenu from "@/hooks/use-menu";
import MenuIcon from "@/svgs/menu-icon";
import { useState, type AnimationEvent, type MouseEvent } from "react";
import Chat from "./chat/chat";

interface FooterProps {
    links: Links,
    onSkillsHighlighted: (skills: string[]) => void,
}
export default function Footer({links, onSkillsHighlighted}: FooterProps) {
    const menuButtons = useMenu(links)
    const [menuState, setMenuState] = useState(false)
    const [isMenuTransitioning, setIsMenuTransitioning] = useState(false)
    function handleOpenChange(open: boolean) {
        setMenuState(open)
        setIsMenuTransitioning(true)
    }
    function handleMenuAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
        if (
            event.target === event.currentTarget &&
            event.animationName === (menuState ? "menuUp" : "menuDown")
        ) {
            setIsMenuTransitioning(false)
        }
    }
    function handleMenuClickCapture(event: MouseEvent<HTMLDivElement>) {
        if (isMenuTransitioning) {
            event.preventDefault()
            event.stopPropagation()
        }
    }
    return (
        <div className="flex justify-end fixed right-0 bottom-0 z-100 p-6 flex-col gap-4 items-end">
            <div className="sm:hidden z-120">
                <DropdownMenu modal={false} onOpenChange={handleOpenChange}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="glass-gradient-border glass-surface glass-button bg-transparent data-[state=open]:bg-transparent drop-shadow-lg dark:drop-shadow-lg/60 w-14 h-14 rounded-full">
                            <MenuIcon state={menuState}/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="center"
                        side="top"
                        className="border origin-[var(--transform-origin-radix-dropdown)] data-[state=open]:animate-menu-up data-[state=closed]:animate-menu-down overflow-hidden z-300"
                        onAnimationEnd={handleMenuAnimationEnd}
                        onClickCapture={handleMenuClickCapture}
                    >
                        <DropdownMenuArrow className="fill-popover" width={20} height={10} asChild>
                            <ArrowWithBorder />
                        </DropdownMenuArrow>	
                        {menuButtons.map(button => <DropdownMenuItem onSelect={e => e.preventDefault()}>{button}</DropdownMenuItem>)} 
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Chat onSkillsHighlighted={onSkillsHighlighted} />
        </div>
    )
}
