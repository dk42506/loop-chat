'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

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
        <button
          className="bg-vibrant1 text-white px-4 py-2 rounded-md hover:bg-vibrant2 transition-colors"
          onClick={() => router.push('/login')}
        >
          Log In
        </button>
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
      <div className="px-4 py-16 text-center">
        <div className="flex flex-wrap justify-center gap-10 mt-20">
          <div className="max-w-md">
            <img src="path/to/your/image.jpg" alt="Feature" className="w-full h-auto mb-4" />
            <h3 className="text-2xl font-bold text-black">Instant Messaging</h3>
            <p className="text-grey3">Send messages in real-time to anyone, anywhere, without any delay.</p>
          </div>

          <div className="max-w-md">
            <img src="path/to/your/video-thumbnail.jpg" alt="Feature" className="w-full h-auto mb-4" />
            <video controls className="w-full">
              <source src="path/to/your/video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <h3 className="text-2xl font-bold text-black">Live Video Calls</h3>
            <p className="text-grey3">Connect face-to-face with friends and family using live video calls.</p>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-vibrant3 text-center p-10">
        <h2 className="text-3xl font-bold text-white mb-6">Get Started with Loop Chat Today</h2>
        <button
          className="bg-white text-vibrant2 px-8 py-3 rounded-lg font-bold transition-colors hover:bg-grey2"
          onClick={() => router.push('/login')}
        >
          Sign Up Now
        </button>
      </div>

      {/* Footer */}
      <footer className="text-center p-4" style={{ backgroundColor: '#ededed' }}>
        <span className="text-sm text-grey3">&copy; {new Date().getFullYear()} Loop Chat. All rights reserved.</span>
      </footer>
    </div>
  );
};