import InteractiveHome from "@components/InteractiveHome";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane, FaCopy } from 'react-icons/fa';
import Link from "next/link";

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
        {/* change copy icon to 'CA' */}
        <button className="text-white text-3xl">
          <span className="text-white text-3xl hover:text-blue-500 hover:scale-110 transition-all duration-200">CA</span>
        </button>
      </div>
      <InteractiveHome />
    </div>
  );
}
