import { ComponentType } from 'react';
import { LucideProps } from 'lucide-react';

// Unified Category Interface
export interface Category {
    id: string;
    name: string;
    icon: ComponentType<LucideProps> | string; // Allows both React components and string paths
    subcategories: Subcategory[]; // Link to Subcategory array
}

// Subcategory Interface
export interface Subcategory {
    id: string;
    name: string;
    icon: string; // Assuming Subcategory icons are string paths
    skills: Skill[]; // Array of skills
}

// Skill Interface
export interface Skill {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    description: string;
    prompt: string;
}

// User Details Interface
export interface UserDetails {
    name: string;
    email: string;
    company: string;
}

// Chat Message Interface
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}
