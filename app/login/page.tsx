"use client";

import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import app from '../../components/firebase';
import { useRouter } from 'next/navigation';

const variants = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 }, 
  hidden: { opacity: 0, x: -100 }, 
  visible: { opacity: 1, x: 0 },
};

const auth = getAuth(app);
const db = getFirestore(app);

export default function Login() {

  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showCreateAccountForm, setShowCreateAccountForm] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [createAccountError, setCreateAccountError] = useState('');

  const handleGetStarted = () => {
    setShowCreateAccountForm(false);
    setShowLoginForm(true);
    setEmail("")
    setPassword("")
    const user = auth.currentUser;

    if (user) {
      router.push('/dashboard');
    } else {
      setShowCreateAccountForm(false);
      setShowLoginForm(true);
      setEmail('');
      setPassword('');
    }   
  };

  const handleDontHaveAccount = () => {
    setShowLoginForm(false);
    setShowCreateAccountForm(true);
    setEmail("")
    setPassword("")
  };

  const checkUsernameExists = async (username: string) => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };
  
  const handleCreateAccount = async () => {
    if (!username || !email || !password) {
      setCreateAccountError("Please complete all fields.");
      return;
    }
  
    const usernameExists = await checkUsernameExists(username);
  
    if (usernameExists) {
      setCreateAccountError('Username already exists.');
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Wait for the auth state to be updated
      await new Promise<void>(resolve => {
        const unsubscribe = auth.onAuthStateChanged(authUser => {
          if (authUser) {
            unsubscribe();
            resolve();
          }
        });
      });

      if (!auth.currentUser) {
        await signInWithEmailAndPassword(auth, email, password);
      }
  
      // Create a Firestore document with the user's UID as its name
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        username: username,
        uid: user.uid,
      });
  
      router.push('/dashboard');
      setEmail('');
      setPassword('');
      setUsername('');
      setCreateAccountError('');
    } catch (error) {
      const castedError = error as { code?: string; message?: string };
      if (castedError.code === 'auth/email-already-in-use') {
        setCreateAccountError('Account with this email already exists.');
      } else {
        console.error('Error creating account: ', castedError.message);
      }
    }
  };

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      router.push('/dashboard');
      setEmail("")
      setPassword("")
      setUsername("")
      setLoginError("");
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      setLoginError("Incorrect Username or Password");
    });
  };
  
  return (
    <div className="bg-grey1 text-black min-h-screen flex items-center justify-center">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        className={`p-10 bg-white rounded-lg shadow-lg ${showLoginForm || showCreateAccountForm ? 'hidden' : ''}`}
      >
        <h1 className="text-3xl font-mono mb-4">Welcome to Loop</h1>
        <p className="text-lg mb-8">Connect and chat with people effortlessly.</p>
        <motion.button
          onClick={handleGetStarted}  
          className="slide-btn slide-btn-vibrant3 bg-grey2 text-black px-4 py-2 rounded-lg hover:bg-opacity-70"
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
            <form onSubmit={(e) => e.preventDefault()}>
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
              {loginError && <p className="text-red-500">{loginError}</p>}
              <motion.button
                type="submit"
                className="slide-btn slide-btn-vibrant2 bg-grey2 text-black px-4 py-2 rounded-lg hover:bg-opacity-70"
                onClick={handleSignIn}
                whileHover={{ scale: 1.05 }}
              >
                Log In
            </motion.button>
            </form>
            <p className="mt-4 text-blue5">
              Don&apos;t have an account?{' '}
              <a className="text-blue-500 hover:underline cursor-pointer" onClick={handleDontHaveAccount}>
                Create Account
              </a>
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
            <form onSubmit={(e) => e.preventDefault()}>
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
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              {createAccountError && <p className="text-red-500">{createAccountError}</p>}
              <motion.button
                type="submit"
                className="slide-btn slide-btn-vibrant1 bg-grey2 text-black px-4 py-2 rounded-lg hover:bg-opacity-70"
                onClick={handleCreateAccount}
                whileHover={{ scale: 1.05 }}
              >
                Create Account
              </motion.button>
            </form>
            <p className="mt-4 text-black">
              Already have an account?{' '}
              <a className="text-blue-500 hover:underline cursor-pointer" onClick={handleGetStarted}>
                Log In
              </a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
