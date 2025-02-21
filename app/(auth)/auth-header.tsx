import Logo from '@/public/icons/icon-128x128.png';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AuthHeader() {
  return (
    <div>
      <motion.div
        initial={{ rotateZ: 0, x:-200,scale: 0  }}
        animate={{x:0, rotateZ: [0,720],scale: 1  }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="flex items-center justify-center h-32 mx-auto sm:px-6 lg:px-8 mb-12 md:mb-0 md:hidden"
      >
        <Image src={Logo} alt="Logo" width={96} height={96} quality={100} />
      </motion.div>
    </div>
  );
}
