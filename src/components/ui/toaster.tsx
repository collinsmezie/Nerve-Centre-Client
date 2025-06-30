import * as React from 'react'
import {
  useToast,
  ToastProps,
  ToastPosition,
  ToasterToast
} from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// Toast component that actually renders the toast UI
export const ToastComponent: React.FC<
  ToastProps & {
    children?: React.ReactNode
  }
> = ({
  id,
  title,
  description,
  action,
  open,
  variant,
  onOpenChange,
  children
}) => {
  const { pauseToast, resumeToast } = useToast()

  const handleMouseEnter = React.useCallback(() => {
    pauseToast(id)
  }, [id, pauseToast])

  const handleMouseLeave = React.useCallback(() => {
    resumeToast(id)
  }, [id, resumeToast])

  return (
    <div
      key={id}
      role='alert'
      aria-live='assertive'
      aria-atomic='true'
      data-state={open ? 'open' : 'closed'}
      data-variant={variant}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg',
        // Separate transition properties for better control
        'transition-all duration-300 ease-in-out',
        // Simplified animation classes
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:duration-300 data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-top-full',
        'data-[state=open]:duration-300 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-top-full',
        // Variant styling
        variant === 'destructive'
          ? 'group border-destructive bg-destructive text-destructive-foreground'
          : variant === 'success'
          ? 'group border-green-300 bg-green-300 text-foreground'
          : 'border-border bg-background text-foreground'
      )}
    >
      <div className='grid gap-1'>
        {title && <div className='text-sm font-semibold'>{title}</div>}
        {description && <div className='text-xs opacity-90'>{description}</div>}
      </div>
      {action && <div className='toast-action'>{action}</div>}
      <button
        className='absolute right-2 top-2 rounded-md p-1 text-inherit/50 sm:opacity-0 opacity-100 transition-all hover:text-foreground/80 focus:opacity-100 group-hover:opacity-100'
        onClick={() => onOpenChange?.(false)}
        type='button'
      >
        <span className='sr-only'>Close</span>
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='3'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='h-4 w-4'
        >
          <line x1='18' y1='6' x2='6' y2='18'></line>
          <line x1='6' y1='6' x2='18' y2='18'></line>
        </svg>
      </button>
      {children}
    </div>
  )
}

interface ToasterProps {
  position?: ToastPosition
  toastOptions?: Partial<ToastProps>
}

// Calculate position classes based on position value
const getPositionClasses = (position: ToastPosition): string => {
  const positions = {
    'top-left': 'top-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-0 right-0'
  }

  return positions[position] || positions['bottom-right']
}

// Toaster component to display all toasts
export const Toaster: React.FC<ToasterProps> = ({
  position = 'bottom-right',
  toastOptions
}) => {
  const { toasts, dismiss } = useToast()

  // Group toasts by position
  const toastsByPosition = toasts.reduce<Record<ToastPosition, ToasterToast[]>>(
    (acc, toast) => {
      const toastPosition = toast.position || position
      if (!acc[toastPosition]) {
        acc[toastPosition] = []
      }
      acc[toastPosition].push(toast)
      return acc
    },
    {} as Record<ToastPosition, ToasterToast[]>
  )

  return (
    <>
      {Object.entries(toastsByPosition).map(([pos, positionToasts]) => {
        const positionClass = getPositionClasses(pos as ToastPosition)

        return (
          <div
            key={pos}
            className={cn(
              'fixed z-[100] flex flex-col gap-2 p-4 w-full md:w-[420px]',
              positionClass,
              pos.startsWith('top') ? 'flex-col-reverse' : 'flex-col'
            )}
            aria-label='Notifications'
          >
            {positionToasts.map((toast) => (
              <ToastComponent
                key={toast.id}
                {...toast}
                {...toastOptions}
                onOpenChange={(open) => {
                  if (!open) dismiss(toast.id)
                  toast.onOpenChange?.(open)
                }}
              />
            ))}
          </div>
        )
      })}
    </>
  )
}

export default Toaster
