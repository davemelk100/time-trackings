import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { DemoGuardProvider } from "@/lib/use-demo-guard"
import { AppRouter } from "./router"

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <DemoGuardProvider>
            <AppRouter />
          </DemoGuardProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
