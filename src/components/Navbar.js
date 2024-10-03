'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTelegramPlane } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";


function Navbar() {
    const pathname = usePathname();

    return (
        <div>
            <nav className="fixed top-0 left-0 right-0 z-20 pt-3">
                <div className="flex items-center justify-between py-2 mx-auto nav-container xl:max-w-[80%]">
                    <div className="flex items-center text-3xl">
                        <p>$RORO</p>
                    </div>
                    <div className="items-center hidden gap-20 md:flex text-3xl">
                        <div className="flex gap-6 lg:gap-20">
                            <Link href="/" className={`text-md font-bold link-neon hover:text-shadow-[0_0_8px_rgba(0,255,255,0.8)] ${pathname === '/merch' ? 'text-indigo-500' : ''}`}>
                                Merch
                            </Link>
                            <Link href="/" className={`text-md font-bold link-neon hover:text-shadow-[0_0_8px_rgba(0,255,255,0.8)] ${pathname === '/' ? 'text-indigo-500' : ''}`}>
                                Home
                            </Link>
                            <Link href="/claim" className={`text-md font-bold link-neon hover:text-shadow-[0_0_8px_rgba(0,255,255,0.8)] ${pathname === '/claim' ? 'text-indigo-500' : ''}`}>
                                Claim
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-3xl">
                        <a
                            href="https://x.com/roronsol"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-md font-bold link-neon hover:text-shadow-[0_0_8px_rgba(0,255,255,0.8)]"
                        >
                            <FaXTwitter />
                        </a>
                        <a
                            href="https://t.me/RoroLandPortal"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-md font-bold link-neon hover:text-shadow-[0_0_8px_rgba(0,255,255,0.8)]"
                        >
                            <FaTelegramPlane />
                        </a>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;
