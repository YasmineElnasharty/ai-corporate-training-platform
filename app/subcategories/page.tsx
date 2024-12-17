'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout';
import { useStore } from '@/lib/store';
import { Subcategory } from '@/types'; // Import the updated Subcategory type
import {
    Users,
    UserCog,
    HeadsetIcon as HeadSet,
    Briefcase,
    Palette,
    UserPlus,
    Eye,
    UserCheck,
} from 'lucide-react';

const subcategories: Subcategory[] = [
    { id: 'sales', name: 'Sales Associate', icon: Users, skills: [] },
    { id: 'manager', name: 'Store Manager', icon: UserCog, skills: [] },
    { id: 'customer-service', name: 'Customer Service', icon: HeadSet, skills: [] },
    { id: 'operations', name: 'Operations Manager', icon: Briefcase, skills: [] },
    { id: 'beauty', name: 'Beauty Consultant', icon: Palette, skills: [] },
    { id: 'assistant', name: 'Assistant Manager', icon: UserPlus, skills: [] },
    { id: 'merchandiser', name: 'Visual Merchandiser', icon: Eye, skills: [] },
    { id: 'advisor', name: 'Client Advisor', icon: UserCheck, skills: [] },
];

export default function SubcategoriesPage() {
    const router = useRouter();
    const selectedCategory = useStore((state) => state.selectedCategory);
    const setSelectedSubcategory = useStore((state) => state.setSelectedSubcategory);

    // Redirect to '/categories' if no category is selected
    useEffect(() => {
        if (!selectedCategory) {
            router.push('/categories');
        }
    }, [selectedCategory, router]);

    // Handle subcategory selection
    const handleSubcategorySelect = (subcategory: Subcategory) => {
        setSelectedSubcategory(subcategory);
        router.push(`/skills`);
    };

    // Render nothing until redirection is completed
    if (!selectedCategory) {
        return null;
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Page Title */}
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold text-center mb-8 text-green-800"
                >
                    Choose a subcategory
                </motion.h1>

                {/* Subcategories Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                    {subcategories.map((subcategory, index) => {
                        const Icon = subcategory.icon as React.ComponentType<React.SVGProps<SVGSVGElement>>;
                        return (
                            <motion.button
                                key={subcategory.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSubcategorySelect(subcategory)}
                                className="flex flex-col items-center justify-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all"
                            >
                                {/* Subcategory Icon */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-3">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>

                                {/* Subcategory Name */}
                                <span className="text-sm font-medium text-center text-green-800">
                                    {subcategory.name}
                                </span>
                            </motion.button>
                        );
                    })}
                </motion.div>
            </div>
        </Layout>
    );
}
