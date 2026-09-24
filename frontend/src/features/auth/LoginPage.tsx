import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store/store'
import { setCredentials } from '@/store/slices/authSlice'
import { navigate } from '@/store/slices/navigationSlice'
import { addToast } from '@/store/slices/uiSlice'
import { useLoginMutation } from '@/store/api/authApi'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, LogIn } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [loginTrigger, { isLoading }] = useLoginMutation()

  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!usernameOrEmail.trim() || !password) {
      setError('Please provide both username/email and password')
      return
    }

    try {
      const response = await loginTrigger({
        username_or_email: usernameOrEmail.trim(),
        password,
      }).unwrap()

      dispatch(setCredentials(response))
      dispatch(addToast({ type: 'success', text: `Welcome back, ${response.user.username}!` }))
      dispatch(navigate({ view: 'dashboard' }))
    } catch (err: any) {
      const message =
        err?.data?.detail || 'Failed to login. Please check your credentials.'
      setError(message)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LogIn className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Log in to QuizCraft</CardTitle>
          <CardDescription>
            Enter your credentials to access your tests and results
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="identifier">Username or Email</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="alice or alice@example.com"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => dispatch(navigate({ view: 'register' }))}
                className="font-medium text-primary hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

