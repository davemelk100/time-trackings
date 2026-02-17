import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const { signIn, signOut, passcodesReady } = useAuth()
  const navigate = useNavigate()
  const [passcode, setPasscode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Clear any existing session first
    signOut()

    const result = signIn(passcode)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      if (result.role === "admin") {
        navigate("/")
      } else if (result.clientId) {
        navigate(`/client/${result.clientId}`)
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign In</CardTitle>
          <p className="text-sm text-muted-foreground">
            Melkonian Industries LLC
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="passcode">Passcode</Label>
              <Input
                id="passcode"
                type="password"
                maxLength={5}
                autoComplete="off"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                onPaste={(e) => {
                  e.preventDefault()
                  const text = e.clipboardData.getData("text").trim().slice(0, 5)
                  setPasscode(text)
                }}
                placeholder="Enter 5-digit passcode"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" disabled={loading || !passcodesReady} className="w-full">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
