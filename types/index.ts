export interface Category {
    id: string;
    name: string;
    icon: string;
    subcategories: Subcategory[];
}

export interface Subcategory {
    id: string;
    name: string;
    icon: string;
    skills: Skill[];
}

export interface Skill {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    description: string;
    prompt: string;
}

export interface UserDetails {
    name: string;
    email: string;
    company: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

