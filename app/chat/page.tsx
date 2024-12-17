'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff } from 'lucide-react';

export default function ChatPage() {
    const selectedSkill = useStore((state) => state.selectedSkill);
    const chatHistory = useStore((state) => state.chatHistory);
    const addChatMessage = useStore((state) => state.addChatMessage);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const chunks = useRef<Blob[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Initialize the chat with the selected skill's prompt
    useEffect(() => {
        if (!selectedSkill) return;

        addChatMessage({
            role: 'assistant',
            content: selectedSkill.prompt || "Welcome to your AI Training!",
            timestamp: Date.now(),
        });
    }, [selectedSkill, addChatMessage]);

    // Scroll to the bottom when chat history updates
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    // Start recording audio
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            chunks.current = [];

            mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);

            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(chunks.current, { type: 'audio/wav' });
                await processAudio(audioBlob);
            };

            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Failed to access the microphone.');
        }
    };

    // Stop recording audio
    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
        }
    };

    // Process recorded audio and get AI response
    const processAudio = async (audioBlob: Blob) => {
        try {
            // Handle missing API key or endpoints gracefully
            if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
                console.warn('API key is missing. Cannot process audio.');
                alert('Feature temporarily unavailable. Please configure API access.');
                return;
            }

            const formData = new FormData();
            formData.append('audio', audioBlob);

            // Transcribe audio
            const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Failed to transcribe audio.');
            const data = await response.json();
            const userMessage = data.text || 'Unable to process audio.';

            addChatMessage({ role: 'user', content: userMessage, timestamp: Date.now() });

            // Fetch AI response
            const aiResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, skillPrompt: selectedSkill?.prompt }),
            });

            if (!aiResponse.ok) throw new Error('Failed to get AI response.');
            const aiData = await aiResponse.json();

            addChatMessage({ role: 'assistant', content: aiData.message, timestamp: Date.now() });

            // Optional: Play audio response
            const audioResponse = await fetch('/api/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: aiData.message }),
            });

            const audioBlobResponse = await audioResponse.blob();
            const audioUrl = URL.createObjectURL(audioBlobResponse);
            new Audio(audioUrl).play();
        } catch (error) {
            console.error('Error processing audio or fetching response:', error);
            alert('Feature temporarily unavailable. Please try again later.');
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="space-y-8">
                    {/* Avatar and Skill Title */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center space-y-4"
                    >
                        <div className="w-64 h-64 rounded-full overflow-hidden bg-white border-4 border-green-500 shadow-lg">
                            <video
                                src="https://www.media.io/video/face-animator-ai.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-2xl font-semibold text-green-800">
                            {selectedSkill?.name || "Skill Training"}
                        </h2>
                    </motion.div>

                    {/* Chat History */}
                    <Card
                        className="bg-white shadow-lg rounded-xl p-4 h-[40vh] overflow-y-auto"
                        ref={chatContainerRef}
                    >
                        <AnimatePresence>
                            {chatHistory.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                        } mb-4`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                                                : 'bg-gray-100 text-green-800'
                                            }`}
                                    >
                                        {message.content}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </Card>

                    {/* Record Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex justify-center"
                    >
                        <Button
                            size="lg"
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`rounded-full w-20 h-20 ${isRecording
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'
                                }`}
                        >
                            {isRecording ? (
                                <MicOff className="w-8 h-8 text-white" />
                            ) : (
                                <Mic className="w-8 h-8 text-white" />
                            )}
                        </Button>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}
