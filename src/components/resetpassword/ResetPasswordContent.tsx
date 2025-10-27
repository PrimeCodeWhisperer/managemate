import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from 'react'
import ResetPasswordForm from '@/components/resetpassword/ResetPasswordForm'

export default function ResetPasswordContent() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}