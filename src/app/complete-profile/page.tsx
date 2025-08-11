import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/login/submit-button";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { handleLogout } from "@/utils/api";

export default function CompleteProfilePage() {

  const updateProfile = async (formData: FormData) => {
    "use server";

    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirect("/login");
    }

    await supabase.from("profiles").upsert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      email: user.email,
      role: "employee",
    });

    await supabase.auth.updateUser({
      password:password
    })
    await supabase.auth.signOut()
    return redirect("/get-app");
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Complete Profile</CardTitle>
          <CardDescription>Enter your details to finish setup</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4 pb-3">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" name="first_name" placeholder="Enter your first name" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" name="last_name" placeholder="Enter your last name" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">New password</Label>
                <Input id="password" name="password" type="password" placeholder="Enter your new password" required />
              </div>
            </div>
            <SubmitButton formAction={updateProfile} pendingText="Saving...">
              Save
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
