'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
    const router = useRouter();

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
            <div className="container mx-auto flex items-center justify-between py-3 px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    {/* Check if the logo.svg exists in the public folder */}
                    <Image
                        src="/logo.svg" // Make sure logo.svg is placed in /public
                        alt="AI Corporate Training Logo"
                        width={120}
                        height={40}
                        priority
                        className="h-auto w-auto" // Ensures the image is responsive
                    />
                    <span className="ml-2 text-lg font-bold text-[#5aba47]">
                        AI Corporate Training Platform
                    </span>
                </Link>

                {/* Navigation Arrow */}
                <button
                    onClick={() => router.back()}
                    aria-label="Go back to the previous page"
                    className="text-[#5aba47] hover:text-green-700 transition duration-300 text-lg font-semibold focus:outline-none"
                >
                    ← Back
                </button>
            </div>
        </header>
    );
}
