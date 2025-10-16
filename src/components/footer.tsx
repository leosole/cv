import type { Links } from "@/types/cv";
import { ArrowWithBorder, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/button";
import useMenu from "@/hooks/use-menu";
import MenuIcon from "@/svgs/menu-icon";
import { useState } from "react";

interface FooterProps {
    links: Links,
}
export default function Footer({links}: FooterProps) {
    const menuButtons = useMenu(links)
    const [menuState, setMenuState] = useState(false)
    function handleOpenChange() {
        setMenuState(!menuState)
    }
    return (
        <div className="flex justify-end sm:hidden fixed right-0 bottom-0 z-100 w-full p-6">
            <DropdownMenu modal={false} onOpenChange={handleOpenChange}>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="data-[state=open]:bg-muted drop-shadow-lg dark:drop-shadow-lg/60 w-14 h-14 rounded-full">
                        <MenuIcon state={menuState} className="w-7! h-7!"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="border">
                    <DropdownMenuArrow className="fill-popover" width={20} height={10} asChild>
                        <ArrowWithBorder />
                    </DropdownMenuArrow>	
                    {menuButtons.map(button => <DropdownMenuItem onSelect={e => e.preventDefault()}>{button}</DropdownMenuItem>)} 
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}