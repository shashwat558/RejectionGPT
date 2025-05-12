"use client"
import { useAuth } from "@/stores/useAuth";
import Login from "./login/page";



export default function Home() {
    const {user} = useAuth()
    
   
  return (
    <div className="w-screen h-screen flex justify-center items-center text-4xl" >
      Hi,  {user?.email}
      
    </div>
  );
}
