import InteractiveHome from "@components/InteractiveHome";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from 'react-icons/fa';
import Link from "next/link";
import dynamic from "next/dynamic";

const CopyContractAddress = dynamic(() => import("@/components/CopyContractAddress"), { ssr: false });

export default function Home() {
  return (
    <div className="relative">
      <div className="absolute flex top-10 right-20 space-x-10 z-20">
        <Link href='https://x.com/RoronETH' target="blank">
          <FaXTwitter className="text-white text-3xl hover:text-blue-500 hover:scale-110 transition-all duration-200" />
        </Link>
        <Link href='https://t.me/RorolandETH' target="blank">
          <FaTelegramPlane className="text-white text-3xl hover:text-blue-500 hover:scale-110 transition-all duration-200" />
        </Link>
        <CopyContractAddress />
      </div>
      <InteractiveHome />
    </div>
  );
}
