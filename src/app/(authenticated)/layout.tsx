import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { SupabaseDataProvider } from "@/contexts/SupabaseContext";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DemoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase=createClient();
  const { data: { session } } = await supabase.auth.getSession()
    if(!session){
        redirect('login')
    }
  return(
  <SupabaseDataProvider>
      <AdminPanelLayout>{children}</AdminPanelLayout>
  </SupabaseDataProvider>
  );
}
