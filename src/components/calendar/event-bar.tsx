import { useTheme } from "@/hooks/use-theme";
import { getRandomTailwindColorClass } from "@/lib/colors";
import { cn } from "@/lib/utils";

export default function EventBar() {
    const {isDark} = useTheme();
    const color = getRandomTailwindColorClass("bg", isDark);
    return (
        <div className={cn(`w-1 h-full bg-blue-500 rounded-full`)} />
    );
}
