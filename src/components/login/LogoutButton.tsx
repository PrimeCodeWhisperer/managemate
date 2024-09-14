'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
export default function LogoutButton({isOpen}:{isOpen?:boolean}) {
  const router = useRouter()
  const supabase = createClient()
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      router.push('/') // Redirect to home page after logout
      router.refresh() // Refresh the current route

      //router.refresh() doesn't work, i try to fix it with this:

      //window.location.reload()
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