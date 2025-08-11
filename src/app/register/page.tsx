import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SubmitButton } from '@/components/login/submit-button'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default function RegisterPage({ searchParams }: { searchParams: { message?: string } }) {

  const signUp = async (formData: FormData) => {
    "use server";

    const supabase = createClient();

    const username = formData.get("username") as string;
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      return redirect("/register?message=Could not create user");
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        role: 'employee',
      });

    if (profileError) {
      return redirect("/register?message=Could not create profile");
    }

    return redirect("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new employee account</CardDescription>
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
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" placeholder="Enter a username" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" name="first_name" placeholder="Enter your first name" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" name="last_name" placeholder="Enter your last name" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="Enter your email" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="Create a password" required />
              </div>
            </div>
            <SubmitButton formAction={signUp} pendingText="Signing Up...">Register</SubmitButton>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">Login here</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
