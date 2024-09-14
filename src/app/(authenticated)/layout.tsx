import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
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
  return <AdminPanelLayout>{children}</AdminPanelLayout>;
}
