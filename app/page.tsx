"use client"
import ResumeUploaderHome from "@/components/ResumeUploaderHome";
import { useAuth } from "@/stores/useAuth";




export default function Home() {
    const {user} = useAuth()
    
   
  return (
    <div className="" >
      <ResumeUploaderHome />
      
    </div>
  );
}
