'use client'

import { createClient } from '@/utils/supabase/client'
import { redirect, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { clearCacheAndLogout } from '@/utils/localStorage'
export default function LogoutButton({isOpen}:{isOpen?:boolean}) {
  const router = useRouter()
  const supabase = createClient()
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to logout');
      }

      // Clear localStorage and redirect
      clearCacheAndLogout();

      redirect("/")
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
    }
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="w-full justify-center h-10 mt-5"
    >
      <span className={cn(isOpen === false ? "" : "mr-4")}>
        <LogOut size={18} />
      </span>
      <p
        className={cn(
          "whitespace-nowrap",
          isOpen === false ? "opacity-0 hidden" : "opacity-100"
        )}
      >
        Sign out
      </p>
    </Button>
  )
}