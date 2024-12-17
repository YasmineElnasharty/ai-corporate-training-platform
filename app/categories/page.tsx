'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout';
import { useStore } from '@/lib/store';
import { Category } from '@/types';
import {
    Car,
    Building2,
    Diamond,
    Hotel,
    Store,
    Utensils,
    Truck,
    Heart,
    Landmark,
    Factory,
} from 'lucide-react';

// Define categories with the proper Category type
const categories: Category[] = [
    { id: 'auto', name: 'Auto', icon: Car, subcategories: [] },
    { id: 'finance', name: 'Finance', icon: Building2, subcategories: [] },
    { id: 'luxury', name: 'Luxury', icon: Diamond, subcategories: [] },
    { id: 'hospitality', name: 'Hospitality', icon: Hotel, subcategories: [] },
    { id: 'retail', name: 'Retail', icon: Store, subcategories: [] },
    { id: 'restaurants', name: 'Restaurants', icon: Utensils, subcategories: [] },
    { id: 'logistics', name: 'Logistics', icon: Truck, subcategories: [] },
    { id: 'health', name: 'Health', icon: Heart, subcategories: [] },
    { id: 'government', name: 'Government', icon: Landmark, subcategories: [] },
    { id: 'industrial', name: 'Industrial', icon: Factory, subcategories: [] },
];

export default function CategoriesPage() {
    const router = useRouter();
    const setSelectedCategory = useStore((state) => state.setSelectedCategory);

    // Debugging: Check if the setSelectedCategory works
    const handleCategorySelect = (category: Category) => {
        console.log('Selected Category:', category); // Debugging: Log selected category
        setSelectedCategory(category);

        // Navigate to the subcategories page
        router.push('/subcategories');
    };

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
                    Choose a category
                </motion.h1>

                {/* Categories Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                >
                    {categories.map((category, index) => {
                        const Icon = category.icon; // Icon component
                        return (
                            <motion.button
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCategorySelect(category)}
                                className="flex flex-col items-center justify-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all"
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-3">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>

                                {/* Category Name */}
                                <span className="text-sm font-medium text-green-800">
                                    {category.name}
                                </span>
                            </motion.button>
                        );
                    })}
                </motion.div>
            </div>
        </Layout>
    );
}
