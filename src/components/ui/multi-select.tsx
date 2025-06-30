'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Command, CommandGroup, CommandItem } from '@/components/ui/command'
import { Command as CommandPrimitive } from 'cmdk'
import { cn } from '@/lib/utils'

export type Option = {
  label: string
  value: string
}

interface MultiSelectProps {
  id: string
  options: Option[]
  value: Option[]
  onChange: (value: Option[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  id,
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  className
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState('')

  const handleUnselect = (option: Option) => {
    onChange(value.filter((item) => item.value !== option.value))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current
    if (input) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (input.value === '' && value.length > 0) {
          onChange(value.slice(0, -1))
        }
      }
      if (e.key === 'Escape') {
        input.blur()
      }
    }
  }

  const selectables = options.filter(
    (option) => !value.some((item) => item.value === option.value)
  )

  return (
    <Command
      id={id}
      onKeyDown={handleKeyDown}
      className={cn('overflow-visible bg-transparent', className)}
    >
      <div className='group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'>
        <div className='flex flex-wrap gap-1'>
          {value.map((option) => (
            <Badge
              key={option.value}
              variant='secondary'
              className='rounded-sm'
            >
              {option.label}
              <button
                className='ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUnselect(option)
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={() => handleUnselect(option)}
              >
                <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={value.length === 0 ? placeholder : ''}
            className='ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground'
          />
        </div>
      </div>
      <div className='relative mt-2'>
        {open && selectables.length > 0 ? (
          <div className='absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in'>
            <CommandGroup className='h-full overflow-auto'>
              {selectables.map((option) => (
                <CommandItem
                  key={option.value}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onSelect={() => {
                    setInputValue('')
                    onChange([...value, option])
                  }}
                  className={'cursor-pointer'}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ) : null}
      </div>
    </Command>
  )
}
