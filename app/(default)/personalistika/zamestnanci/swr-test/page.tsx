
import { Suspense } from "react"
import { User2 } from "@/components/employees/swr-employee"


// export default async function UsersPage({ params }: { params: { id: string }}) {
export default async function UsersPage() {
    // const { id } = params

  return (
    <div  className="w-full p-10">
        <Suspense fallback={<p>Loading API Route Data...</p>}>
            <User2 id={"11d6cb3f-24cc-4ba1-b166-867e0906aaa7"}/>
        </Suspense>

 
    </div>


  )
}