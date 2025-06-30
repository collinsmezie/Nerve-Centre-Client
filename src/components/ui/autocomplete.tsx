import { CommandGroup, CommandItem, CommandList, CommandInput } from './command'
import { Command as CommandPrimitive } from 'cmdk'
import {
  useState,
  useRef,
  useCallback,
  type KeyboardEvent,
  useEffect
} from 'react'

import { Skeleton } from './skeleton'

import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FieldError } from 'react-hook-form'

export type Option = Record<'value' | 'label', string> & Record<string, string>

type AutoCompleteProps = {
  id: string
  options: Option[]
  emptyMessage?: string
  value?: string
  onValueChange?: (value: string) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  error?: FieldError | undefined
}

export const AutoComplete = ({
  id,
  options,
  placeholder,
  emptyMessage,
  value,
  onValueChange,
  disabled,
  isLoading = false,
  className,
  error
}: AutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setOpen] = useState(false)
  const [selected, setSelected] = useState<Option | undefined>(() => {
    // Find the option that matches the provided value
    if (value) {
      return options.find((option) => option.value === value)
    }
    return undefined
  })
  const [inputValue, setInputValue] = useState<string>(() => {
    // Set input value to the label of the matching option or empty string
    if (value) {
      const matchingOption = options.find((option) => option.value === value)
      return matchingOption?.label || ''
    }
    return ''
  })

  // Update internal state when value prop changes
  useEffect(() => {
    if (!value) {
      setSelected(undefined)
      setInputValue('')
    } else {
      const matchingOption = options.find((option) => option.value === value)
      setSelected(matchingOption)
      setInputValue(matchingOption?.label || '')
    }
  }, [value, options])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current
      if (!input) {
        return
      }

      // Keep the options displayed when the user is typing
      if (!isOpen) {
        setOpen(true)
      }

      // This is not a default behaviour of the <input /> field
      if (event.key === 'Enter' && input.value !== '') {
        const optionToSelect = options.find(
          (option) => option.label === input.value
        )
        if (optionToSelect) {
          setSelected(optionToSelect)
          onValueChange?.(optionToSelect.value)
        }
      }

      if (event.key === 'Escape') {
        input.blur()
      }
    },
    [isOpen, options, onValueChange]
  )

  const handleBlur = useCallback(() => {
    setOpen(false)
    setInputValue(selected?.label || '')
  }, [selected])

  const handleSelectOption = useCallback(
    (selectedOption: Option) => {
      setInputValue(selectedOption.label)
      setSelected(selectedOption)
      onValueChange?.(selectedOption.value)

      // This is a hack to prevent the input from being focused after the user selects an option
      // We can call this hack: "The next tick"
      setTimeout(() => {
        inputRef?.current?.blur()
      }, 0)
    },
    [onValueChange]
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setInputValue('')
      setSelected(undefined)
      onValueChange?.('')

      // Focus the input after clearing
      setTimeout(() => {
        inputRef?.current?.focus()
      }, 0)
    },
    [onValueChange]
  )

  return (
    <CommandPrimitive onKeyDown={handleKeyDown} id={id}>
      <div className='relative'>
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={isLoading ? undefined : setInputValue}
          onBlur={handleBlur}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-sm focus-visible:outline-none',
            error ? 'border-red-500' : '',
            className
          )}
        />
        <button
          type='button'
          className='absolute right-3 top-1/2 -translate-y-1/2'
          onClick={(e) => {
            if (selected) {
              handleClear(e)
            } else {
              setOpen(!isOpen)
              inputRef.current?.focus()
            }
          }}
        >
          {selected ? (
            <X className='h-4 w-4 hover:opacity-100 opacity-70' />
          ) : (
            <ChevronDown className='h-4 w-4 opacity-50' />
          )}
        </button>
      </div>
      {error && <p className='text-sm text-red-500 mt-2'>{error.message}</p>}
      <div className='relative'>
        <div
          className={cn(
            'animate-in fade-in-0 zoom-in-95 absolute top-0 z-10 w-full rounded-xl bg-white outline-none',
            isOpen ? 'block' : 'hidden'
          )}
        >
          <CommandList className='rounded-lg ring-1 ring-slate-200 mt-1'>
            {isLoading ? (
              <CommandPrimitive.Loading>
                <div className='p-1'>
                  <Skeleton className='h-8 w-full' />
                </div>
              </CommandPrimitive.Loading>
            ) : null}
            {options.length > 0 && !isLoading ? (
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selected?.value === option.value
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}
                      onSelect={() => handleSelectOption(option)}
                      className={cn(
                        'flex w-full cursor-pointer items-center gap-2',
                        !isSelected ? 'pl-8' : null
                      )}
                    >
                      {isSelected ? <Check className='w-4' /> : null}
                      {option.label}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ) : null}
            {!isLoading ? (
              <CommandPrimitive.Empty className='select-none rounded-sm px-2 py-3 text-center text-sm'>
                {emptyMessage || 'No results found'}
              </CommandPrimitive.Empty>
            ) : null}
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  )
}
