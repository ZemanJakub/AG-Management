import Image from "next/image";
import AuthBg from "@/public/images/pc-guy.png";

export default function AuthImage() {
  return (
    <div className="relative h-full w-full ">
      <Image
        src={AuthBg}
        alt="authpic"
        fill
        className="object-cover object-center"
        priority
      />
    </div>
  );
}
