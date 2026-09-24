import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store/store'
import { logout, setUser } from '@/store/slices/authSlice'
import { navigate } from '@/store/slices/navigationSlice'
import { addToast } from '@/store/slices/uiSlice'
import { useGetMeQuery, useUpdateProfileMutation, useLogoutMutation } from '@/store/api/authApi'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Calendar, CheckCircle2, Lock, LogOut, Mail, User } from 'lucide-react'

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user: currentUser } = useSelector((state: RootState) => state.auth)
  const { data: freshUser, refetch } = useGetMeQuery()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
  const [logoutTrigger] = useLogoutMutation()

  const user = freshUser || currentUser

  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
      setBio(user.bio || '')
    }
  }, [user])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword) {
      if (!currentPassword) {
        setError('Current password is required to set a new password')
        return
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters')
        return
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match')
        return
      }
    }

    try {
      const updated = await updateProfile({
        email: email.trim(),
        bio: bio.trim(),
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
      }).unwrap()

      dispatch(setUser(updated))
      setSuccess('Profile updated successfully!')
      dispatch(addToast({ type: 'success', text: 'Profile updated!' }))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      refetch()
    } catch (err: any) {
      const message = err?.data?.detail || 'Failed to update profile'
      setError(message)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutTrigger().unwrap()
    } catch {
      // ignore
    }
    dispatch(logout())
    dispatch(navigate({ view: 'dashboard' }))
  }

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8 px-4">
      {/* Account Info Card */}
      <Card className="shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">{user.username}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-destructive hover:bg-destructive/10 gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Member since: {new Date(user.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile & Password Form */}
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Edit Profile & Security</CardTitle>
          <CardDescription>
            Update your public profile details or change your password
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdate}>
          <CardContent className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="prof-email">Email Address</Label>
              <Input
                id="prof-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prof-bio">Bio / About Me</Label>
              <Textarea
                id="prof-bio"
                placeholder="Tell others a bit about your interests or background..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground mb-3">
                <Lock className="h-4 w-4 text-primary" />
                Change Password (Optional)
              </h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prof-current-pwd">Current Password</Label>
                  <Input
                    id="prof-current-pwd"
                    type="password"
                    placeholder="Enter current password to change"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="prof-new-pwd">New Password</Label>
                    <Input
                      id="prof-new-pwd"
                      type="password"
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prof-confirm-pwd">Confirm New Password</Label>
                    <Input
                      id="prof-confirm-pwd"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="submit" disabled={isUpdating} className="font-semibold">
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

