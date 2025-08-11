import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { SupabaseDataProvider, useSupabaseData } from "@/contexts/SupabaseContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { getUser } from "@/utils/api";

export default async function DemoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase=createClient();
  const { data: { session } } = await supabase.auth.getSession()
  const user=(await supabase.auth.getUser()).data.user
    if(!session){
        redirect('login')
    }
    if(user){
      console.log("User",user)
    }
  return(
  <SupabaseDataProvider>
    <SettingsProvider>
      <AdminPanelLayout>{children}</AdminPanelLayout>
      <Toaster/>
    </SettingsProvider>
  </SupabaseDataProvider>
  );
}
