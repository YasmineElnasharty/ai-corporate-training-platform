'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Input from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store'; // Use Zustand store to save user details

export default function LandingPage() {
  const router = useRouter();
  const setUserDetails = useStore((state) => state.setUserDetails); // Zustand method to save user details

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission behavior

    const formData = new FormData(e.currentTarget);
    const userDetails = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
    };

    // Save user details in the store
    setUserDetails(userDetails);

    // Navigate to the categories page
    router.push('/categories');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-white">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 relative">
        {/* Green Decorative Effects */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.1, opacity: 0.4 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute top-10 left-10 w-32 h-32 bg-green-200 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.4 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', delay: 0.3 }}
          className="absolute bottom-10 right-10 w-48 h-48 bg-[#5aba47] rounded-full blur-3xl"
        />

        {/* Main Form */}
        <div className="text-center z-10">
          {/* Animated Title */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-[#5aba47] mb-2"
          >
            AI Corporate Training Platform
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-green-600 mb-6"
          >
            Elevate your skills with AI-powered training
          </motion.p>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto bg-white shadow-xl p-6 rounded-lg">
            <div className="text-left">
              <label className="block text-green-800 font-medium mb-1">Name</label>
              <Input
                name="name"
                type="text"
                placeholder="Enter your name"
                className="w-full border-[#5aba47] focus:ring-[#5aba47] focus:border-[#5aba47]"
                required
              />
            </div>

            <div className="text-left">
              <label className="block text-green-800 font-medium mb-1">Email</label>
              <Input
                name="email"
                type="email"
                placeholder="Enter your email"
                className="w-full border-[#5aba47] focus:ring-[#5aba47] focus:border-[#5aba47]"
                required
              />
            </div>

            <div className="text-left">
              <label className="block text-green-800 font-medium mb-1">Company</label>
              <Input
                name="company"
                type="text"
                placeholder="Enter your company name"
                className="w-full border-[#5aba47] focus:ring-[#5aba47] focus:border-[#5aba47]"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <Button
                type="submit"
                className="w-full bg-[#5aba47] hover:bg-green-600 text-white font-semibold py-2 rounded-md transition duration-300"
              >
                Get Started
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
