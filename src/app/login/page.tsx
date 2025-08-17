import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SubmitButton } from '@/components/login/submit-button'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'


export default function LoginPage({ searchParams }: { searchParams: { email?: string; message?: string } }) {

  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();


    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    const data= (await supabase.auth.getUser()).data
    const user= await supabase.from("profiles").select("*").eq("id",data.user?.id).single()

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }
    if(user.data.role==="admin" && user.data.role!==""){
      return redirect("/dashboard");
    }
    if (user.data.role==="pending") {
      return redirect("/complete-profile");
    }
    await supabase.auth.signOut()
    return redirect("/")

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          {searchParams.message && (
            <div
              className="mb-4 rounded border border-red-300 bg-red-100 p-2 text-red-700"
              role="alert"
            >
              {searchParams.message}
            </div>
          )}
          <form>
            <div className="grid w-full items-center gap-4 pb-3">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  defaultValue={searchParams.email || ""}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            <SubmitButton
                formAction={signIn}
                pendingText="Signing In..."
            >Submit</SubmitButton>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            {`Don't have an account?`}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}