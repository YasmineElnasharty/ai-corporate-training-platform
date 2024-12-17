'use client'; // Mark this as a Client Component

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function Header() {
    const router = useRouter();

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
            <div className="container mx-auto flex items-center justify-between py-3 px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <Image src="/logo1.png" alt="Logo" width={120} height={40} priority />
                    <span className="ml-2 text-lg font-bold text-[#5aba47]">
                        AI Corporate Training Platform
                    </span>
                </Link>

                {/* Navigation Arrow */}
                <button
                    onClick={() => router.back()} // Add onClick handler here
                    className="text-[#5aba47] hover:text-green-700 transition text-lg font-semibold"
                >
                    ← Back
                </button>
            </div>
        </header>
    );
}
