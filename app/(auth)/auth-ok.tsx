import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import animationData from '@/public/lottie/ok.json';

export default function AuthOk() {
  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 md:left-1/4 md:-translate-x-1/2 bottom-16 md:bottom-24">
       
        <Lottie 
          animationData={animationData} 
          loop={true} 
          autoplay={true}
          style={{ width: 96, height: 96 }}
        />
    </div>
  );
}
