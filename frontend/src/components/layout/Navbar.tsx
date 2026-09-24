import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store/store'
import { logout } from '@/store/slices/authSlice'
import { navigate, type AppView } from '@/store/slices/navigationSlice'
import { useLogoutMutation } from '@/store/api/authApi'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  CheckCircle,
  FileQuestion,
  GraduationCap,
  Layers,
  LogOut,
  Menu,
  PlusCircle,
  User as UserIcon,
  X,
} from 'lucide-react'

export const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const currentView = useSelector(
    (state: RootState) => state.navigation.currentView,
  )
  const [logoutTrigger] = useLogoutMutation()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const handleNav = (view: AppView, param?: string | null) => {
    dispatch(navigate({ view, param }))
    setMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logoutTrigger().unwrap()
    } catch {
      // Ignore network errors on logout
    }
    dispatch(logout())
    dispatch(navigate({ view: 'dashboard' }))
    setMobileMenuOpen(false)
  }

  const linkClass = (view: AppView) =>
    `inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
      currentView === view
        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div
          onClick={() => handleNav('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Quiz<span className="text-primary">Craft</span>
            </span>
            <span className="ml-2 hidden text-xs font-medium text-muted-foreground md:inline-block">
              Test Platform
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => handleNav('dashboard')}
            className={linkClass('dashboard')}
          >
            <Layers className="h-4 w-4" />
            Dashboard
          </button>
          <button
            onClick={() => handleNav('tests')}
            className={linkClass('tests')}
          >
            <BookOpen className="h-4 w-4" />
            Explore Tests
          </button>
          {isAuthenticated && (
            <>
              <button
                onClick={() => handleNav('my-tests')}
                className={linkClass('my-tests')}
              >
                <FileQuestion className="h-4 w-4" />
                My Tests
              </button>
              <button
                onClick={() => handleNav('my-results')}
                className={linkClass('my-results')}
              >
                <CheckCircle className="h-4 w-4" />
                My Results
              </button>
            </>
          )}
        </nav>

        {/* Desktop User Action / Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleNav('create-test')}
                className="gap-1.5 shadow-xs"
              >
                <PlusCircle className="h-4 w-4" />
                Create Test
              </Button>
              <button
                onClick={() => handleNav('profile')}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer border ${
                  currentView === 'profile'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-foreground hover:bg-muted'
                }`}
                title="Profile & Settings"
              >
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-[120px] truncate">{user?.username}</span>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive gap-1"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNav('login')}
              >
                Log In
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleNav('register')}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 py-4 md:hidden space-y-2">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleNav('dashboard')}
              className={linkClass('dashboard')}
            >
              <Layers className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => handleNav('tests')}
              className={linkClass('tests')}
            >
              <BookOpen className="h-4 w-4" />
              Explore Tests
            </button>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNav('my-tests')}
                  className={linkClass('my-tests')}
                >
                  <FileQuestion className="h-4 w-4" />
                  My Tests
                </button>
                <button
                  onClick={() => handleNav('my-results')}
                  className={linkClass('my-results')}
                >
                  <CheckCircle className="h-4 w-4" />
                  My Results
                </button>
                <button
                  onClick={() => handleNav('create-test')}
                  className={linkClass('create-test')}
                >
                  <PlusCircle className="h-4 w-4" />
                  Create Test
                </button>
                <button
                  onClick={() => handleNav('profile')}
                  className={linkClass('profile')}
                >
                  <UserIcon className="h-4 w-4" />
                  Profile ({user?.username})
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => handleNav('login')}
                  className="w-full justify-center"
                >
                  Log In
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleNav('register')}
                  className="w-full justify-center"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

