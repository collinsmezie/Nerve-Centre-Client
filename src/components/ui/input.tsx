import * as React from 'react'

import { cn } from '@/lib/utils'
import { FieldError } from 'react-hook-form'
interface InputProps extends React.ComponentProps<'input'> {
  error?: FieldError
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className='relative'>
        <input
          autoComplete='off'
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-4 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-sm focus-visible:outline-none', // focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            error ? 'border-red-500' : '',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className='text-sm text-red-500 mt-2'>{error.message}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
