"use client"

import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center px-4">
      <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
      <p className="text-gray-500 mb-6 max-w-md">
        You don't have permission to access this page. Please contact your administrator if you believe this is an
        error.
      </p>
      <Button onClick={() => navigate("/")}>Go to Dashboard</Button>
    </div>
  )
}
