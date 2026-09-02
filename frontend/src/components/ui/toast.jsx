import * as React from "react"
import { cn } from "../../lib/utils"

const ToastContext = React.createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([])

  const addToast = React.useCallback((message, variant = 'default') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={cn(
              "rounded-md border px-4 py-3 text-sm shadow-lg animate-in slide-in-from-bottom-5",
              toast.variant === 'destructive'
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-[var(--color-border)] bg-white text-gray-900"
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const addToast = React.useContext(ToastContext)
  return { toast: (msg) => addToast?.(typeof msg === 'string' ? msg : msg.description || msg.title, msg.variant) }
}
