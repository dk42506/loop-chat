'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Video from '@/components/Video';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#f7f7f7' }}>
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 shadow-md" style={{ backgroundColor: '#ffffff' }}>
        <div className="flex items-center">
          <img src="/images/favicon.svg" alt="Loop Chat Logo" className="h-8 mr-2" />
          <span className="text-xl font-bold text-black">Loop Chat</span>
        </div>
        <motion.button
          onClick={() => router.push('/login')}  
          className="slide-btn slide-btn-vibrant2 bg-grey2 text-black px-4 py-2 rounded-lg hover:bg-opacity-70"
          whileHover={{ scale: 1.05 }}
        >
          Get Started
        </motion.button>
      </nav>

      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center bg-white">
        <div className="text-center p-10">
          <img src="/images/logo.svg" alt="Loop Chat" className="mx-auto h-auto" />
          <h1 className="text-4xl font-bold text-black mt-5 mb-3">Connect Effortlessly</h1>
          <p className="text-lg text-grey3">Create an account, search for users, and start chatting!</p>
        </div>
      </div>

      {/* Product Info Section */}
      <div className="px-4 py-16 text-center lg:text-left">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

          {/* Text Section */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold text-black mb-4">Loop Chat</h2>
            <p className="text-grey-600 text-lg">
              Loop Chat offers a clear window into the core design of major corporate messaging apps. It's crafted to showcase the essential framework that powers these platforms, providing a straightforward, insightful look at how they operate.
            </p>
          </div>

          {/* Image/Video Section */}
          <div className="lg:w-1/2 flex justify-center">
            <Video />
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-vibrant1 text-center p-10">
        <h2 className="text-3xl font-bold text-white mb-6">Get Started with Loop Chat Today</h2>
        <motion.button
          onClick={() => router.push('/login')}  
          className="slide-btn slide-btn-vibrant2 bg-grey1 text-black px-4 py-2 rounded-lg hover:bg-opacity-70"
          whileHover={{ scale: 1.05 }}
        >
          Get Started
        </motion.button>
      </div>

      {/* Footer */}
      <footer className="text-center p-4" style={{ backgroundColor: '#ededed' }}>
        <span className="text-sm text-grey3">&copy; {new Date().getFullYear()} Loop Chat. All rights reserved.</span>
      </footer>
    </div>
  );
};