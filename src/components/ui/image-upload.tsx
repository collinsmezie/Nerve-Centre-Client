import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload } from 'lucide-react'
import { Button } from './button'

interface ImageUploadProps {
  type: 'front' | 'back' | 'photo'
  imageUrl?: string
  onImageSelect: (file: File) => void
  onImageClear: () => void
  error?: string
}

export function ImageUpload({
  type,
  imageUrl,
  onImageSelect,
  onImageClear,
  error
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(imageUrl || null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
        onImageSelect(file)
      }
    },
    [onImageSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    multiple: false
  })

  const handleClear = () => {
    setPreview(null)
    onImageClear()
  }

  return (
    <div className='space-y-2'>
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary/50'
        } ${error ? 'border-red-500' : ''}`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className='relative aspect-[16/9] w-full'>
            <img
              src={preview}
              alt={`${type === 'photo' ? 'Profile' : 'License'} ${type}`}
              className='object-contain rounded-md'
            />
            <Button
              type='button'
              variant='destructive'
              size='icon'
              className='absolute top-2 right-2 h-8 w-8'
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        ) : (
          <div className='py-8'>
            <Upload className='mx-auto h-12 w-12 text-gray-400' />
            <p className='mt-2 text-sm text-gray-600'>
              {isDragActive
                ? 'Drop the image here'
                : 'Drag and drop an image, or click to select'}
            </p>
            <p className='text-xs text-gray-500 mt-1'>PNG or JPEG up to 10MB</p>
          </div>
        )}
      </div>
      {error && <p className='text-sm text-red-500'>{error}</p>}
    </div>
  )
}
