import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store/store'
import { syncFromHash } from '@/store/slices/navigationSlice'
import { setUser, logout, setInitialized } from '@/store/slices/authSlice'
import { useLazyGetMeQuery } from '@/store/api/authApi'

import { Navbar } from '@/components/layout/Navbar'
import { NotificationToast } from '@/components/common/NotificationToast'

import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { TestsCatalogPage } from '@/features/tests/TestsCatalogPage'
import { TestEditorPage } from '@/features/tests/TestEditorPage'
import { TakeTestPage } from '@/features/taking/TakeTestPage'
import { ResultDetailPage } from '@/features/results/ResultDetailPage'
import { MyTestsPage } from '@/features/tests/MyTestsPage'
import { MyResultsPage } from '@/features/results/MyResultsPage'
import { ProfilePage } from '@/features/auth/ProfilePage'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'

export const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { currentView } = useSelector((state: RootState) => state.navigation)
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth)

  const [triggerGetMe] = useLazyGetMeQuery()

  // Sync route on hash change
  useEffect(() => {
    const handleHashChange = () => {
      dispatch(syncFromHash(window.location.hash))
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [dispatch])

  // Restore authenticated user session on mount
  useEffect(() => {
    if (token) {
      triggerGetMe()
        .unwrap()
        .then((user) => {
          dispatch(setUser(user))
        })
        .catch(() => {
          // Token is expired or invalid
          dispatch(logout())
        })
        .finally(() => {
          dispatch(setInitialized())
        })
    } else {
      dispatch(setInitialized())
    }
  }, [token, triggerGetMe, dispatch])

  // Protected route guard
  const requiresAuth = [
    'create-test',
    'edit-test',
    'take-test',
    'result',
    'my-tests',
    'my-results',
    'profile',
  ].includes(currentView)

  const renderContent = () => {
    if (requiresAuth && !isAuthenticated) {
      return <LoginPage />
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardPage />
      case 'tests':
        return <TestsCatalogPage />
      case 'create-test':
      case 'edit-test':
        return <TestEditorPage />
      case 'take-test':
        return <TakeTestPage />
      case 'result':
        return <ResultDetailPage />
      case 'my-tests':
        return <MyTestsPage />
      case 'my-results':
        return <MyResultsPage />
      case 'profile':
        return <ProfilePage />
      case 'login':
        return <LoginPage />
      case 'register':
        return <RegisterPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 pb-16">{renderContent()}</main>

      <footer className="border-t border-border bg-card/50 py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 QuizCraft. All rights reserved. Web Platform for Creating & Taking Tests.</p>
          <div className="flex items-center gap-4">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>React + TypeScript</span>
            <span>•</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>

      <NotificationToast />
    </div>
  )
}

export default App
