'use client';
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, MicOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function ChatPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('');
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [status, setStatus] = useState<'initial' | 'listening' | 'processing' | 'responding' | 'idle'>('initial');

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Typing effect for the assistant’s displayed message
  useEffect(() => {
    let index = 0;
    let interval: NodeJS.Timeout;
    if (assistantMessage) {
      setDisplayedMessage('');
      interval = setInterval(() => {
        setDisplayedMessage((prev) => prev + assistantMessage.charAt(index));
        index++;
        if (index >= assistantMessage.length) {
          clearInterval(interval);
        }
      }, 50); // typing speed
    } else {
      setDisplayedMessage('');
    }
    return () => clearInterval(interval);
  }, [assistantMessage]);

  // Speak message returns a promise that resolves when audio finishes playing
  const speakMessage = (message: string) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        setStatus('responding');
        const speechResponse = await fetch('/api/speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message }),
        });

        if (!speechResponse.ok) throw new Error('Failed to synthesize speech.');

        const audioBlobResponse = await speechResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlobResponse);
        const audio = new Audio(audioUrl);

        setAssistantMessage(message);

        // Play video only when speaking
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch((err) => console.error('Video play failed:', err));
        }

        audio.onended = () => {
          setStatus('idle');
          // Pause video right after speech ends
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
          resolve();
        };

        audio.play().catch((err) => {
          console.error('Audio play failed:', err);
          // If audio can't play, pause video as well
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
          setStatus('idle');
          reject(err);
        });
      } catch (err) {
        console.error(err);
        setStatus('idle');
        reject(err);
      }
    });
  };

  // Start recording audio or handle initial interaction
  const startRecording = async () => {
    try {
      // If this is the initial state, the first click triggers the initial message
      if (status === 'initial') {
        const initialMessage = "Pardon me, but you seem to be trusting the same sales line upon me again. It would be delightful if you convey what makes these new arrivals unique. Don't rush. Be creative.";
        await speakMessage(initialMessage);
        // After the initial message finishes, status becomes 'idle'.
        // User can click again to start recording for real.
        return;
      }

      // For subsequent clicks (not initial), we start recording:
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setStatus('listening');

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
      setStatus('idle');
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setStatus('processing');
    }
  };

  // Process recorded audio and get AI response
  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      // Transcribe audio
      const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to transcribe audio.');
      const data = await response.json();
      const userMessage = data.text || 'Unable to process audio.';

      // Fetch AI response
      setStatus('responding');
      const aiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      if (!aiResponse.ok) throw new Error('Failed to get AI response.');
      const aiData = await aiResponse.json();

      // Speak and show the assistant response
      await speakMessage(aiData.message);
    } catch (error) {
      console.error('Error processing audio or fetching response:', error);
      alert('Feature temporarily unavailable. Please try again later.');
      setStatus('idle');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Background decorative elements */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-50 via-white to-white"></div>
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
        className="flex flex-col items-center space-y-6 z-10"
      >
        <div className="relative w-80 h-80 rounded-full overflow-hidden bg-white border-4 border-green-500 shadow-lg">
          <video
            ref={videoRef}
            src="https://www.media.io/video/face-animator-ai.mp4"
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-green-300 opacity-50 animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          ></motion.div>
        </div>

        {/* Assistant Message Display (typing effect) */}
        {displayedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative max-w-md px-6 py-4 rounded-xl shadow-lg"
            style={{
              background: 'linear-gradient(to bottom right, #c7f5d6, #f0fdf4)', // greenish gradient
            }}
          >
            {/* Optional "tail" to give a speech bubble feel */}
            <div
              className="absolute -bottom-2 left-10 w-5 h-5 bg-white transform rotate-45 border border-green-300"
              style={{ background: 'linear-gradient(to bottom right, #c7f5d6, #f0fdf4)' }}
            ></div>

            <p className="text-green-900 font-semibold text-lg leading-relaxed text-center">
              {displayedMessage}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Status and Record Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center space-y-4 mt-10 z-10"
      >
        {/* Status Messages */}
        {status === 'listening' && (
          <div className="text-gray-700 font-medium">Listening...</div>
        )}
        {status === 'processing' && (
          <div className="text-gray-700 font-medium">Processing...</div>
        )}
        {status === 'responding' && (
          <div className="text-gray-700 font-medium">Responding...</div>
        )}

        {/* Record Button */}
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={status === 'processing' || status === 'responding'}
          className={`inline-flex items-center justify-center rounded-full text-lg font-semibold text-white transition-all duration-300 w-20 h-20 ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700'
              : status === 'processing' || status === 'responding'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700'
          }`}
        >
          {isRecording ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </button>
      </motion.div>
    </div>
  );
}
