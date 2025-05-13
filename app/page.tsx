"use client"
import { useAuth } from "@/stores/useAuth";




export default function Home() {
    const {user} = useAuth()
    
   
  return (
    <div className="w-screen h-screen flex justify-center items-center text-4xl" >
      Hi,  {user?.email}
      
    </div>
  );
}
