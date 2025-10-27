'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Extract token from URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')

    if (!accessToken || type !== 'recovery') {
      router.push('/login?message=Invalid or expired reset link')
      return
    }

    // Set the session with the access token
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: hashParams.get('refresh_token') || ''
    }).then(({ data, error }) => {
      if (error || !data.user) {
        router.push('/login?message=Invalid or expired reset link')
      } else {
        setValidating(false)
        // Clean up the URL hash for security
        window.history.replaceState(null, '', window.location.pathname)
      }
    })
  }, [router, supabase.auth])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (!password || !confirmPassword) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      setError('Failed to reset password. Please try again.')
      setLoading(false)
      return
    }

    // Sign out after successful password reset
    await supabase.auth.signOut()
    router.push('/login?message=Password reset successful. Please login with your new password.')
  }

  // Show message from searchParams if present
  const message = searchParams.get('message')

  if (validating) {
    return <div className="text-center py-4">Validating reset link...</div>
  }

  return (
    <>
      {(error || message) && (
        <div
          className="mb-4 rounded border border-red-300 bg-red-100 p-2 text-red-700"
          role="alert"
        >
          {error || message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid w-full items-center gap-4 pb-3">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter new password"
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="Confirm new password"
              required
              minLength={6}
              disabled={loading}
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </>
  )
}