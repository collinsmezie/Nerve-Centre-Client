import * as React from 'react'
import { createContext, useContext, useReducer, useEffect } from 'react'

// Types
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type ToastVariant =
  | 'default'
  | 'success'
  | 'info'
  | 'warning'
  | 'destructive'

export interface ToastProps {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  open?: boolean
  duration?: number // Duration in milliseconds
  onOpenChange?: (open: boolean) => void
  variant?: ToastVariant
  position?: ToastPosition
}

export type ToastActionElement = React.ReactElement

export type ToasterToast = Required<
  Pick<ToastProps, 'id' | 'duration' | 'position'>
> &
  Omit<ToastProps, 'id' | 'duration' | 'position'> & {
    createdAt: number
    pausedAt?: number
  }

// Constants with defaults that can be overridden
const DEFAULT_CONFIG = {
  TOAST_LIMIT: 5,
  TOAST_REMOVE_DELAY: 3000, // 3 seconds
  DEFAULT_POSITION: 'top-center' as ToastPosition
}

export interface ToastConfig {
  limit?: number
  defaultDuration?: number
  defaultPosition?: ToastPosition
}

// Action types
const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  PAUSE_TOAST: 'PAUSE_TOAST',
  RESUME_TOAST: 'RESUME_TOAST'
} as const

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType['ADD_TOAST']
      toast: ToasterToast
    }
  | {
      type: ActionType['UPDATE_TOAST']
      toast: Partial<ToasterToast> & { id: string }
    }
  | {
      type: ActionType['DISMISS_TOAST']
      toastId?: string
    }
  | {
      type: ActionType['REMOVE_TOAST']
      toastId?: string
    }
  | {
      type: ActionType['PAUSE_TOAST']
      toastId: string
      pausedAt: number
    }
  | {
      type: ActionType['RESUME_TOAST']
      toastId: string
      resumedAt: number
    }

interface State {
  toasts: ToasterToast[]
  config: {
    limit: number
    defaultDuration: number
    defaultPosition: ToastPosition
  }
}

// Define the shape of context
export interface ToastContextType {
  state: State
  dispatch: React.Dispatch<Action>
  toast: (props: Omit<ToastProps, 'id'>) => {
    id: string
    dismiss: () => void
    update: (props: Partial<ToastProps>) => void
  }
  dismiss: (toastId?: string) => void
  pauseToast: (toastId: string) => void
  resumeToast: (toastId: string) => void
}

// Create a context for toast state
export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
)

// ID generation with more uniqueness
function genId() {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Separate service for managing toast removal timeouts
class ToastTimeoutService {
  private timeouts = new Map<string, ReturnType<typeof setTimeout>>()

  add(toastId: string, callback: () => void, delay: number) {
    this.remove(toastId) // Clear any existing timeout
    const timeout = setTimeout(callback, delay)
    this.timeouts.set(toastId, timeout)
    return timeout
  }

  remove(toastId: string) {
    if (this.timeouts.has(toastId)) {
      clearTimeout(this.timeouts.get(toastId)!)
      this.timeouts.delete(toastId)
      return true
    }
    return false
  }

  clear() {
    this.timeouts.forEach((timeout) => clearTimeout(timeout))
    this.timeouts.clear()
  }
}

const toastTimeoutService = new ToastTimeoutService()

// Pure reducer function without side effects
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, state.config.limit)
      }

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        )
      }

    case 'DISMISS_TOAST': {
      const { toastId } = action

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false
              }
            : t
        )
      }
    }

    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: []
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      }

    case 'PAUSE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId ? { ...t, pausedAt: action.pausedAt } : t
        )
      }

    case 'RESUME_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) => {
          if (t.id !== action.toastId || t.pausedAt === undefined) {
            return t
          }

          // Calculate remaining duration by taking into account paused time
          const elapsedBeforePause = t.pausedAt - t.createdAt
          const remainingDuration = t.duration - elapsedBeforePause

          return {
            ...t,
            pausedAt: undefined,
            // Update createdAt to account for the pause duration
            createdAt: action.resumedAt - elapsedBeforePause
          }
        })
      }

    default:
      return state
  }
}

// Provider component for the toast system
export const ToastProvider = ({
  children,
  config = {}
}: {
  children: React.ReactNode
  config?: ToastConfig
}) => {
  const initialState: State = {
    toasts: [],
    config: {
      limit: config.limit ?? DEFAULT_CONFIG.TOAST_LIMIT,
      defaultDuration:
        config.defaultDuration ?? DEFAULT_CONFIG.TOAST_REMOVE_DELAY,
      defaultPosition: config.defaultPosition ?? DEFAULT_CONFIG.DEFAULT_POSITION
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  // Clean up timeouts when the provider unmounts
  useEffect(() => {
    return () => {
      toastTimeoutService.clear()
    }
  }, [])

  // Handle toast lifecycle (dismiss after duration)
  useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.open && !toast.pausedAt) {
        toastTimeoutService.add(
          toast.id,
          () => {
            dispatch({ type: 'DISMISS_TOAST', toastId: toast.id })

            // Add delay before removing from DOM
            setTimeout(() => {
              dispatch({ type: 'REMOVE_TOAST', toastId: toast.id })
            }, 300) // Transition duration
          },
          toast.duration
        )
      }
    })
  }, [state.toasts])

  // Toast functions with proper type safety
  const toast = ({
    title,
    description,
    action,
    variant = 'default',
    duration,
    position,
    ...props
  }: Omit<ToastProps, 'id'>) => {
    const id = genId()
    const actualDuration = duration ?? state.config.defaultDuration
    const actualPosition = position ?? state.config.defaultPosition

    const update = (props: Partial<ToastProps>) =>
      dispatch({
        type: 'UPDATE_TOAST',
        toast: { ...props, id }
      })

    const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id })

    dispatch({
      type: 'ADD_TOAST',
      toast: {
        id,
        title,
        description,
        action,
        variant,
        duration: actualDuration,
        position: actualPosition,
        createdAt: Date.now(),
        open: true,
        onOpenChange: (open) => {
          if (!open) dismiss()
          props.onOpenChange?.(open)
        },
        ...props
      }
    })

    return {
      id,
      dismiss,
      update
    }
  }

  const dismiss = (toastId?: string) => {
    dispatch({ type: 'DISMISS_TOAST', toastId })

    // If we have a specific toastId, schedule its removal
    if (toastId) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', toastId })
      }, 300) // Allow for exit animation
    } else {
      // If dismissing all, schedule removal of all
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST' })
      }, 300)
    }
  }

  const pauseToast = (toastId: string) => {
    // Remove timeout
    toastTimeoutService.remove(toastId)

    // Update state
    dispatch({
      type: 'PAUSE_TOAST',
      toastId,
      pausedAt: Date.now()
    })
  }

  const resumeToast = (toastId: string) => {
    dispatch({
      type: 'RESUME_TOAST',
      toastId,
      resumedAt: Date.now()
    })
  }

  const contextValue: ToastContextType = {
    state,
    dispatch,
    toast,
    dismiss,
    pauseToast,
    resumeToast
  }

  return React.createElement(
    ToastContext.Provider,
    { value: contextValue },
    children
  )
}

// Hook for consuming the toast context
export const useToast = () => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return {
    toasts: context.state.toasts,
    toast: context.toast,
    dismiss: context.dismiss,
    pauseToast: context.pauseToast,
    resumeToast: context.resumeToast
  }
}

// Persist toast state to localStorage if needed
export const createPersistentToast = (storageKey = 'toast-state') => {
  // Function to save state to localStorage
  const saveState = (state: Pick<State, 'toasts'>) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save toast state to localStorage:', error)
    }
  }

  // Modified useToast hook with persistence
  const usePersistentToast = () => {
    const toast = useToast()

    // Save toasts when they change
    useEffect(() => {
      saveState({ toasts: toast.toasts })
    }, [toast.toasts])

    return toast
  }

  return { usePersistentToast }
}

// Type for global toast handler
type ToastHandler = ReturnType<typeof useToast>

// Simple API for creating toasts outside of React components
// This can be useful for things like API responses or other non-React code
let toastHandler: ToastHandler | null = null

export const setToastHandler = (handler: ToastHandler) => {
  toastHandler = handler
}

export const toast = (props: Omit<ToastProps, 'id'>) => {
  if (!toastHandler) {
    console.warn(
      'Toast handler not set. Call setToastHandler with a valid toast handler first.'
    )
    return { id: '', dismiss: () => {}, update: () => {} }
  }
  return toastHandler.toast(props)
}

export const dismissToast = (toastId?: string) => {
  if (!toastHandler) {
    console.warn(
      'Toast handler not set. Call setToastHandler with a valid toast handler first.'
    )
    return
  }
  toastHandler.dismiss(toastId)
}
