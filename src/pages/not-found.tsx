"use client"

import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center px-4">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <h2 className="text-3xl font-bold tracking-tight mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-6 max-w-md">The page you are looking for doesn't exist or has been moved.</p>
      <Button onClick={() => navigate("/")}>Go to Dashboard</Button>
    </div>
  )
}
