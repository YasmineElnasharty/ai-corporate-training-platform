import Header from '@/components/Header'; // Import the new Header component
import { motion } from 'framer-motion';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-white text-green-900">
            {/* Header Component */}
            <Header />

            {/* Page Content */}
            <main className="pt-20 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
