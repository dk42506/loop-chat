"use client";

import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import app from '../components/firebase';
import { useRouter } from 'next/navigation';

const variants = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 }, 
  hidden: { opacity: 0, x: -100 }, 
  visible: { opacity: 1, x: 0 },
};

const auth = getAuth(app);


export default function Home() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showCreateAccountForm, setShowCreateAccountForm] = useState(false);

  const handleGetStarted = () => {
    setShowCreateAccountForm(false);
    setShowLoginForm(true);
  };

  const handleDontHaveAccount = () => {
    setShowLoginForm(false);
    setShowCreateAccountForm(true);
  };

  const handleCreateAccount = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Handle successful account creation
        console.log("Account created")
        const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        // Handle account creation error
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
        // ...
      });
  };
  
  return (
    <div className="bg-blue4 text-white min-h-screen flex items-center justify-center">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        className={`p-10 bg-blue3 rounded-lg shadow-lg ${showLoginForm || showCreateAccountForm ? 'hidden' : ''}`}
      >
        <h1 className="text-3xl font-mono mb-4">Welcome to Loop</h1>
        <p className="text-lg mb-8">Connect and chat with people effortlessly.</p>
        <motion.button
          onClick={handleGetStarted}  
          className="bg-blue2 text-white px-4 py-2 rounded-lg hover:bg-opacity-70"
          whileHover={{ scale: 1.05 }}
        >
          Get Started
        </motion.button>
      </motion.div>
      <AnimatePresence>
      {showLoginForm && (
          <motion.div
            key="login-form"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            className="p-10 bg-white rounded-lg shadow-lg"
          >
            <h1 className="text-3xl font-semibold mb-4 text-blue5">Log In</h1>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg text-blue5"
                  placeholder="Enter your email"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-lg text-blue5"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                className="bg-blue4 text-white px-4 py-2 rounded-lg hover:bg-opacity-70"
              >
                Log In
              </button>
            </form>
            <p className="mt-4 text-blue5">
              Don't have an account?{' '}
              <a className="text-blue3 hover:underline cursor-pointer" onClick={handleDontHaveAccount}>Create Account</a>
            </p>
          </motion.div>
        )}
        {showCreateAccountForm && (
          <motion.div
            key="create-account-form"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            className="p-10 bg-white rounded-lg shadow-lg"
          >
            <h1 className="text-3xl font-semibold mb-4 text-blue5">Create Account</h1>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg text-blue5"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-lg text-blue5"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                <input
                  type="username"
                  className="w-full px-3 py-2 border rounded-lg text-blue5"
                  placeholder="Enter your username"
                />
              </div>
              <button
                type="submit"
                className="bg-blue4 text-white px-4 py-2 rounded-lg hover:bg-opacity-70"
                onClick={handleCreateAccount}
              >
                Create Account
              </button>
            </form>
            <p className="mt-4 text-blue5">
              Already have an account?{' '}
              <a className="text-blue3 hover:underline cursor-pointer" onClick={handleGetStarted}>
                Log In
              </a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
