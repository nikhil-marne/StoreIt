import MobileNavigation from "@/components/MobileNavigation"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import { getCurrentUser } from "@/lib/actions/user.action"
import { redirect } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"

type layoutProps = {
    children: React.ReactNode
}

const layout = async ( {children} : layoutProps ) => {
    const currentUser = await getCurrentUser();
    if(!currentUser) return redirect("/sign-in");
  return (
    <main className="flex h-screen">
      <Sidebar {...currentUser}/>
      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation {...currentUser} />
        <Header userId={currentUser.$id} accountId={currentUser.accountId} />
        <div className="main-content">{children}</div>
      </section>
      <Toaster />
    </main>
  )
}

export default layout
