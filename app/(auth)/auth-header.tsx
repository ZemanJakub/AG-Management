import Logo from '@/public/icons/icon-128x128.png';
import Image from 'next/image';

export default function AuthHeader() {
  return (
    <div>
      <div className="flex items-center justify-center h-32 mx-auto sm:px-6 lg:px-8 mt-10">
        <Image src={Logo} alt="Logo" width={128} height={128} />
      </div>
    </div>
  );
}
