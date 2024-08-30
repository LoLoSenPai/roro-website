import InteractiveHome from "@components/InteractiveHome";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from 'react-icons/fa';
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <InteractiveHome />
      <div className="flex justify-end mt-10 mb-4 mr-10 md:mr-20 space-x-10">
        <Link href='' target="blank">
          <FaXTwitter className="text-white text-3xl"/>
        </Link>
        <Link href='' target="blank">
          <FaTelegramPlane className="text-white text-3xl"/>
        </Link>
      </div>
    </div>
  );
}
