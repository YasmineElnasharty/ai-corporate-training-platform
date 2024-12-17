'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Layout } from '@/components/layout'
import { useStore } from '@/lib/store'
import { Smile, Anchor, PresentationIcon as PresentationChart, ShieldCheck, Zap, TrendingUp } from 'lucide-react'

const skills = [
    {
        id: 'welcoming',
        name: 'Welcoming',
        icon: Smile,
        description: 'Learn to create a warm, inviting atmosphere for customers.',
        prompt: 'You are an expert in customer welcoming techniques. Provide friendly and professional guidance on greeting and making customers feel welcome.'
    },
    {
        id: 'hooks',
        name: 'Hooks',
        icon: Anchor,
        description: 'Master the art of engaging customers from the start.',
        prompt: 'You are a specialist in sales hooks and opening lines. Offer creative and effective ways to initiate customer interactions and spark interest.'
    },
    {
        id: 'product-presentation',
        name: 'Product Presentation',
        icon: PresentationChart,
        description: 'Develop skills to showcase products effectively.',
        prompt: 'You are a product presentation expert. Provide strategies for highlighting product features, benefits, and value propositions to customers.'
    },
    {
        id: 'objection-handling',
        name: 'Handling Objections',
        icon: ShieldCheck,
        description: 'Learn techniques to address customer concerns smoothly.',
        prompt: 'You are an expert in handling sales objections. Offer tactics and scripts for addressing common customer concerns and objections effectively.'
    },
    {
        id: 'closing-techniques',
        name: 'Closing Techniques',
        icon: Zap,
        description: 'Improve your ability to close sales successfully.',
        prompt: 'You are a sales closing specialist. Provide various techniques and approaches for successfully closing sales and securing customer commitments.'
    },
    {
        id: 'upselling',
        name: 'Upselling Techniques',
        icon: TrendingUp,
        description: 'Enhance your skills in suggesting additional products.',
        prompt: 'You are an upselling and cross-selling expert. Offer strategies for suggesting complementary products and upgrades to increase sales value.'
    },
]

export default function SkillsPage() {
    const router = useRouter()
    const selectedSubcategory = useStore((state) => state.selectedSubcategory)
    const setSelectedSkill = useStore((state) => state.setSelectedSkill)

    const handleSkillSelect = (skill: any) => {
        setSelectedSkill(skill)
        router.push(`/chat`)
    }

    if (!selectedSubcategory) {
        router.push('/subcategories')
        return null
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl font-bold text-center mb-8 text-green-800"
                >
                    Choose the skill you want to train
                </motion.h1>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {skills.map((skill, index) => {
                        const Icon = skill.icon
                        return (
                            <motion.button
                                key={skill.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSkillSelect(skill)}
                                className="flex flex-col items-center justify-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all"
                            >
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4">
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-green-800 mb-2">{skill.name}</h3>
                                <p className="text-sm text-center text-green-600">{skill.description}</p>
                            </motion.button>
                        )
                    })}
                </motion.div>
            </div>
        </Layout>
    )
}