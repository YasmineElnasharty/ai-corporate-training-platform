'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout } from '@/components/layout'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mic, MicOff } from 'lucide-react'

export default function ChatPage() {
    const selectedSkill = useStore((state) => state.selectedSkill)
    const chatHistory = useStore((state) => state.chatHistory)
    const addChatMessage = useStore((state) => state.addChatMessage)
    const [isRecording, setIsRecording] = useState(false)
    const [transcript, setTranscript] = useState('')
    const mediaRecorder = useRef<MediaRecorder | null>(null)
    const chunks = useRef<Blob[]>([])
    const chatContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!selectedSkill) return

        // Initialize chat with the skill's prompt
        addChatMessage({
            role: 'assistant',
            content: selectedSkill.prompt,
            timestamp: Date.now()
        })
    }, [selectedSkill, addChatMessage])

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [chatHistory])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaRecorder.current = new MediaRecorder(stream)
            chunks.current = []

            mediaRecorder.current.ondataavailable = (e) => {
                chunks.current.push(e.data)
            }

            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(chunks.current, { type: 'audio/wav' })
                await processAudio(audioBlob)
            }

            mediaRecorder.current.start()
            setIsRecording(true)
        } catch (error) {
            console.error('Error accessing microphone:', error)
        }
    }

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop()
            setIsRecording(false)
        }
    }

    const processAudio = async (audioBlob: Blob) => {
        const formData = new FormData()
        formData.append('audio', audioBlob)

        try {
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()
            setTranscript(data.text)

            // Add user message to chat
            addChatMessage({
                role: 'user',
                content: data.text,
                timestamp: Date.now()
            })

            // Get AI response
            const aiResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: data.text,
                    skillPrompt: selectedSkill?.prompt
                })
            })

            const aiData = await aiResponse.json()

            // Add AI response to chat
            addChatMessage({
                role: 'assistant',
                content: aiData.message,
                timestamp: Date.now()
            })

            // Convert AI response to speech
            const audioResponse = await fetch('/api/speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: aiData.message
                })
            })

            const audioBlob = await audioResponse.blob()
            const audioUrl = URL.createObjectURL(audioBlob)
            const audio = new Audio(audioUrl)
            audio.play()
        } catch (error) {
            console.error('Error processing audio:', error)
        }
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="space-y-8">
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
                            {selectedSkill?.name} Training
                        </h2>
                    </motion.div>

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
    )
}