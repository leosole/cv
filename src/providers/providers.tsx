import { StrictMode } from "react"
import ThemeProvider from "./theme-provider"

export default function Providers({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <StrictMode>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </StrictMode>
    )
}