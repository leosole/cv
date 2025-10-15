import type { Links } from "@/types/cv";
import { ArrowWithBorder, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
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
        <div className="flex justify-end sm:hidden fixed right-0 bottom-0 z-100 w-full p-2">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild><Button variant="secondary" size="icon" className="data-[state=open]:bg-muted drop-shadow-lg dark:drop-shadow-lg/60"><CgMenu size={24} /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border">
                    <DropdownMenuArrow className="fill-popover" width={20} height={10} asChild>
                        <ArrowWithBorder />
                    </DropdownMenuArrow>	
                    {menuButtons.map(button => <DropdownMenuItem onSelect={e => e.preventDefault()}>{button}</DropdownMenuItem>)} 
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}