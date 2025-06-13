import {islogged} from "@/lib/actions"
import Link from "next/link"
export default function dashboard(){
/*
  if(!islogged()){
    <Link href={"Login"}></Link>
}
    */
    return (
        <main className="min-h-screen relative flex items-center justify-center p-4">
             <div className="relative z-10 w-full max-w-md rounded-lg bg-white/95 backdrop-blur-sm p-6 shadow-lg space-y-6">
               <div className="space-y-2 text-center">
               </div>
               <h1 id="texto" className="text-2xl font-semibold tracking-tight ">Deus não gosta burro</h1>
             </div>
           </main>
    )
}
