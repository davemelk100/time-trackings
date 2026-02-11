"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [passcode, setPasscode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Clear any existing session when the login page loads
  useEffect(() => {
    fetch("/api/auth", { method: "DELETE" })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn(passcode)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      if (result.role === "admin") {
        router.push("/")
      } else if (result.clientId) {
        router.push(`/client/${result.clientId}`)
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
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
