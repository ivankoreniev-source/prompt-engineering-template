import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store/store'
import { removeToast } from '@/store/slices/uiSlice'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

export const NotificationToast: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const toasts = useSelector((state: RootState) => state.ui.toasts)

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((t) =>
      setTimeout(() => {
        dispatch(removeToast(t.id))
      }, 4000),
    )
    return () => {
      timers.forEach(clearTimeout)
    }
  }, [toasts, dispatch])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success'
        const isError = toast.type === 'error'

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-100'
                : isError
                  ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-100'
                  : 'bg-background border-border text-foreground'
            }`}
          >
            {isSuccess && (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            )}
            {isError && (
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            {!isSuccess && !isError && (
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            )}

            <div className="flex-1 text-sm font-medium">{toast.text}</div>

            <button
              onClick={() => dispatch(removeToast(toast.id))}
              className="text-muted-foreground hover:text-foreground shrink-0 rounded-sm p-0.5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

