import { auth, UserButton } from "@clerk/nextjs";

import { MainNav } from "@/components/main-nav";
import StoreSwitcher from "@/components/store-switcher";
import { redirect } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase-config";
import { Store } from "@/types/types";
import { ThemeToggle } from "./theme-toggle";
const Navbar = async () => {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }
  
  const querySnapshot = await getDocs(
    query(
      collection(db, 'stores'),
      where('userId', '==', userId)
    ));
  const stores: Store[] = [];
  querySnapshot.forEach( (doc) => {
    const data = doc.data();
    stores.push({ 
      ...data, 
      id: doc.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as Store);
  });

  return(
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <StoreSwitcher items={stores}/>
        <MainNav className="mx-6"/>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </div>
  )
  
}

export default Navbar;