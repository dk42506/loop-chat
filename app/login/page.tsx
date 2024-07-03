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
  const [showLoginForm, setShowLoginForm] = useState(true);
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

    if (username.length > 16) {
      setCreateAccountError("Username cannot be more than 16 characters.");
      return;
    }

    if (password.length < 8) {
      setCreateAccountError("Password must be at least 8 characters long.");
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
    <div className="bg-grey1 text-black min-h-screen flex flex-col items-center justify-center space-y-8">
      <AnimatePresence>
        {showLoginForm && (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="p-10 text-center mb-6"
          >
            <h1 className="text-6xl font-semibold mb-4">Log In</h1>
            <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-xl">
              <div className="mb-6">
                <input
                  type="email"
                  className="w-full px-4 py-3 border-b border-gray-200 bg-transparent rounded-none text-blue5 text-xl"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <input
                  type="password"
                  className="w-full px-4 py-3 border-b border-gray-200 bg-transparent rounded-none text-blue5 text-xl"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {loginError && <p className="text-red-500 text-lg">{loginError}</p>}
              <motion.button
                type="submit"
                className="w-full bg-blue5 text-white px-4 py-2 rounded-lg hover:bg-vibrant2"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleSignIn}
              >
                Log In
              </motion.button>
            </form>
            <p className="text-lg mt-4">
              Don't have an account? <a className="text-blue5 hover:underline cursor-pointer" onClick={handleDontHaveAccount}>Create Account</a>
            </p>
          </motion.div>
        )}
        {showCreateAccountForm && (
          <motion.div
            key="create-account-form"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="p-10 text-center mb-6"
          >
            <h1 className="text-6xl font-semibold mb-4">Create Your Account</h1>
            <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-xl">
              <div className="mb-6">
                <input
                  type="email"
                  className="w-full px-4 py-3 border-b border-gray-200 bg-transparent rounded-none text-blue5 text-xl"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <input
                  type="password"
                  className="w-full px-4 py-3 border-b border-gray-200 bg-transparent rounded-none text-blue5 text-xl"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="mb-6">
                <input
                  type="text"
                  className="w-full px-4 py-3 border-b border-gray-200 bg-transparent rounded-none text-blue5 text-xl"
                  placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              {createAccountError && <p className="text-red-500 text-lg">{createAccountError}</p>}
              <motion.button
                type="submit"
                className="w-full bg-blue5 text-white px-4 py-2 rounded-lg hover:bg-vibrant2"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCreateAccount}
              >
                Create Account
              </motion.button>
            </form>
            <p className="text-lg mt-4">
              Already have an account? <a className="text-blue5 hover:underline cursor-pointer" onClick={handleGetStarted}>Log In</a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
