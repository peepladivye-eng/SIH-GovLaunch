import * as React from "react"
import { cn } from "../../lib/utils"

const TabsContext = React.createContext({ active: '', setActive: () => {} })

const Tabs = React.forwardRef(({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
  const [internal, setInternal] = React.useState(defaultValue || '')
  const active   = value !== undefined ? value : internal
  const setActive = (v) => { setInternal(v); onValueChange?.(v) }
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-xl bg-white border border-[#E3E7F0] p-1 shadow-sm",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { active, setActive } = React.useContext(TabsContext)
  const isActive = active === value
  return (
    <button
      ref={ref}
      onClick={() => setActive(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-200/50"
          : "text-[#5B6478] hover:text-[#0B0F19] hover:bg-gray-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { active } = React.useContext(TabsContext)
  if (active !== value) return null
  return (
    <div
      ref={ref}
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
