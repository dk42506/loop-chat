"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import PrivateRoute from '../../components/PrivateRoute';
import { getFirestore, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import app from '../../components/firebase';

export default function Dashboard() {
    const [chats, setChats] = useState<string[]>([]);
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);

    const auth = getAuth(app);
    const db = getFirestore(app);

    useEffect(() => {
        const fetchUsername = async () => {
            if (auth.currentUser) {
                const userRef = collection(db, 'users');
                const q = query(userRef, where('uid', '==', auth.currentUser.uid));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const fetchedUsername = querySnapshot.docs[0].data().username;
                    setCurrentUsername(fetchedUsername);
                }
            }
        };
        fetchUsername();
    }, []);

    useEffect(() => {
        if (!currentUsername) return;

        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', currentUsername));

        const unsubscribe = onSnapshot(q, snapshot => {
            const chatUsers: string[] = [];

            snapshot.forEach(doc => {
              const otherUser = doc.data().participants.find((username: string) => username !== currentUsername);

                if (otherUser) {
                    chatUsers.push(otherUser);
                }
            });

            setChats(chatUsers);
        });

        return () => unsubscribe();
    }, [currentUsername]);

  const messages = [
    { text: 'Hello!', sender: 'User1' },
    { text: 'Hi there!', sender: 'User2' },
    { text: 'This is a really long message that should wrap to the next line if it exceeds the maximum width.', sender: 'User1' },
    // Add more chat messages as needed
  ];
  return (
    <PrivateRoute>
      <div className="bg-blue4 text-white min-h-screen flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Chat Container */}
        <div className="flex-grow flex">
          {/* Previous Chats (Left Panel) */}
          <div className="bg-blue3 w-1/4 p-4">
            {/* Add your list of previous chats here */}
            <ul className="space-y-4">
                {chats.map((chatUser, index) => (
                    <li key={index} className="text-white text-lg border-t border-blue5 pt-4">{chatUser}</li>
                ))}
            </ul>

          </div>

          {/* Active Chat (Right Panel) */}
          <div className="flex-grow p-4 flex flex-col">
            {/* Chat Messages */}
            <div className="bg-blue4 rounded-lg p-4 h-full overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    message.sender === 'User1' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`bg-white text-blue5 rounded-lg px-4 py-2 ${
                      message.sender === 'User1'
                        ? 'rounded-tr-none mr-auto'
                        : 'rounded-tl-none ml-auto'
                    }`}
                    style={{ maxWidth: '60%', display: 'inline-block' }}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="mt-auto p-4 bg-blue4">
              <div className="flex items-center">
                <input
                  type="text"
                  className="flex-grow px-3 py-2 border rounded-lg text-white bg-blue5 mr-2"
                  placeholder="Type your message..."
                />
                <button
                  className="bg-blue2 text-white px-4 py-2 rounded-lg hover:bg-opacity-70"
                  onClick={() => {
                    // Handle sending messages
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  )
}
