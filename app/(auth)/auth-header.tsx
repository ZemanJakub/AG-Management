import Logo from '@/public/icons/favicon-96x96.png'
import Image from 'next/image'

export default function AuthHeader() {
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between h-16 px-4 mt-4 sm:px-6 lg:px-8">
        <Image src={Logo} alt="Logo" />

      </div>
    </div>
  )
}
