import { useState, useCallback, createContext, useContext } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth-context"

// Shared state for the demo guard dialog
const DemoGuardContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

export function DemoGuardProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <DemoGuardContext.Provider value={{ open, setOpen }}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Demo Mode</AlertDialogTitle>
            <AlertDialogDescription>
              No edits allowed in this view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DemoGuardContext.Provider>
  )
}

export function useDemoGuard() {
  const { isDemo } = useAuth()
  const ctx = useContext(DemoGuardContext)

  const guardAction = useCallback(
    <T extends (...args: unknown[]) => unknown>(callback: T): T => {
      if (!isDemo) return callback
      return ((...args: unknown[]) => {
        ctx?.setOpen(true)
      }) as unknown as T
    },
    [isDemo, ctx],
  )

  return { isDemo, guardAction }
}
