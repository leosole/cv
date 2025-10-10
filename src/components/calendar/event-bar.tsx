import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface EventBarProps {
    ref?: React.Ref<HTMLDivElement>;
    className?: string;
}
export default function EventBar({ref, className}: EventBarProps) {
    const {isDark} = useTheme();
    return (
        <div ref={ref} className={cn(`w-1 h-full bg-blue-500 rounded-full`, className)} />
    );
}
