import type { Links } from "@/types/cv";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import { CgMenu } from "react-icons/cg";
import { Button } from "./ui/button";
import useMenu from "@/hooks/use-menu";

interface FooterProps {
    links: Links,
}
export default function Footer({links}: FooterProps) {
    const menuButtons = useMenu(links)
    return (
        <div className="flex justify-end sm:hidden fixed right-0 bottom-0 z-100 w-full bg-background p-1">
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="data-[state=open]:bg-muted"><CgMenu size={24} /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuArrow className="fill-popover" width={20} height={10}/>	
                    {menuButtons.map(button => <DropdownMenuItem>{button}</DropdownMenuItem>)} 
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}