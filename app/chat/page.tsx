'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, MicOff } from 'lucide-react';

import { useRouter } from 'next/navigation';
import React from 'react';

export default function ChatPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Define the Button component for recording
  const Button = ({
    onClick,
    children,
    className,
    type = 'button',
  }: {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
  }) => (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full text-lg font-semibold text-white transition-all duration-300 ${className}`}
    >
      {children}
    </button>
  );

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

      // Fetch AI response
      const aiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!aiResponse.ok) throw new Error('Failed to get AI response.');
      const aiData = await aiResponse.json();

      // Play the assistant video
      if (videoRef.current) {
        videoRef.current.play().catch((err) => console.error('Video play failed:', err));
      }

      // Play audio response
      const audioResponse = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiData.message }),
      });
      const audioBlobResponse = await audioResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlobResponse);
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => console.error('Audio play failed:', err));

    } catch (error) {
      console.error('Error processing audio or fetching response:', error);
      alert('Feature temporarily unavailable. Please try again later.');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Subtle decorative elements */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Soft green gradient backdrop */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-50 via-white to-white"></div>
        
        {/* Floating decorative shapes */}
        <motion.div
          className="absolute w-48 h-48 bg-green-100 rounded-full top-10 left-10 filter blur-xl opacity-40"
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        <motion.div
          className="absolute w-32 h-32 bg-green-200 rounded-full bottom-20 right-20 filter blur-lg opacity-30"
          animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </motion.div>

      {/* Top navigation with Back button */}
      <div className="absolute top-4 left-4 flex items-center space-x-4">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back to Skills</span>
      </motion.button>
    
      </div>

      {/* Assistant Avatar */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-4 z-10"
      >
        <div className="relative w-64 h-64 rounded-full overflow-hidden bg-white border-4 border-green-500 shadow-lg">
          <video
            ref={videoRef}
            src="https://www.media.io/video/face-animator-ai.mp4"
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Add a subtle halo effect around the avatar */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-green-300 opacity-50 animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          ></motion.div>
        </div>
      </motion.div>

      {/* Record Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center mt-10 z-10"
      >
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-20 h-20 ${
            isRecording
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
  );
}
