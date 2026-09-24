import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store/store'
import { setCredentials } from '@/store/slices/authSlice'
import { navigate } from '@/store/slices/navigationSlice'
import { addToast } from '@/store/slices/uiSlice'
import { useRegisterMutation } from '@/store/api/authApi'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, UserPlus } from 'lucide-react'

export const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [registerTrigger, { isLoading }] = useRegisterMutation()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirm) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      const response = await registerTrigger({
        username: username.trim(),
        email: email.trim(),
        password,
        password_confirm: passwordConfirm,
      }).unwrap()

      dispatch(setCredentials(response))
      dispatch(
        addToast({
          type: 'success',
          text: `Account created! Welcome, ${response.user.username}`,
        }),
      )
      dispatch(navigate({ view: 'dashboard' }))
    } catch (err: any) {
      const message =
        err?.data?.detail || 'Registration failed. Please check your details.'
      setError(message)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserPlus className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an Account
          </CardTitle>
          <CardDescription>
            Join QuizCraft to create and take interactive tests
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
              <Label htmlFor="reg-username">Username</Label>
              <Input
                id="reg-username"
                type="text"
                placeholder="e.g. alex_smith"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">
                Letters, numbers, and underscores (3-30 chars).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email Address</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-confirm">Confirm Password</Label>
              <Input
                id="reg-confirm"
                type="password"
                placeholder="Repeat password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
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
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => dispatch(navigate({ view: 'login' }))}
                className="font-medium text-primary hover:underline cursor-pointer"
              >
                Log in
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

