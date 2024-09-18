import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Home } from "lucide-react"
import Link from "next/link"

export default function PublishConfirmation() {
  return (
    <div className="flex min-h-svh items-center justify-center ">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <CardTitle className="text-2xl font-bold">Shifts Published Successfully</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600">
            You have successfully published the shifts.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/dashboard">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}