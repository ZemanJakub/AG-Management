import Image from 'next/image'

interface EmployeeId {
  id: string
}

export default function  InternalContent (id:EmployeeId) {

  return (
   
      <div className="flex flex-col xl:flex-row xl:space-x-16">
      {/* Main content */}
      <div className="flex-1 space-y-5 mb-8 xl:mb-0">
        {/* About Me */}
        <div>
          <h2 className="text-slate-800 dark:text-slate-100 font-semibold mb-2">Personalistika</h2>
          <div className="text-sm space-y-2">
          </div>
        </div>
        </div>
    </div>
  )
}

