import { Link } from 'react-router-dom'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-white border-t-2 border-primary/40'>
      <div className='w-full px-4 py-6 md:flex md:items-center md:justify-between lg:px-8'>
        <div className='grid grid-cols-3 md:flex justify-center md:space-x-6 space-x-4 md:order-2 sm:text-sm text-xs'>
          <Link
            to='/privacy-policy'
            className='text-gray-500 hover:text-gray-600 text-center'
          >
            Privacy Policy
          </Link>
          <Link
            to='/terms-of-service'
            className='text-gray-500 hover:text-gray-600 text-center'
          >
            Terms of Service
          </Link>
          <Link
            to='/contact'
            className='text-gray-500 hover:text-gray-600 text-center'
          >
            Contact
          </Link>
        </div>
        <div className='mt-4 md:order-1 md:mt-0'>
          <p className='text-center text-sm text-gray-500'>
            &copy; {currentYear} Cybele Fleet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
