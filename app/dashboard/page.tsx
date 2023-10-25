"use client";

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import PrivateRoute from '../../components/PrivateRoute';
import { getFirestore, collection, query, where, onSnapshot, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import app from '../../components/firebase';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const [chats, setChats] = useState<string[]>([]);
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState<string>('');
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    const auth = getAuth(app);
    const db = getFirestore(app);

    const lastMessageRef = useRef<HTMLDivElement | null>(null);

    const fetchUsername = async () => {
        if (auth.currentUser) {
            const userRef = collection(db, 'users');
            const q = query(userRef, where('uid', '==', auth.currentUser.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const fetchedUsername = querySnapshot.docs[0].data().username;
                setCurrentUsername(fetchedUsername);
                localStorage.setItem('currentUsername', fetchedUsername);  // save to localStorage
            }
        }
    };

    useEffect(() => {
        const savedUsername = localStorage.getItem('currentUsername');
        if (savedUsername) {
            setCurrentUsername(savedUsername);
        } else {
            fetchUsername();
        }
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

    useEffect(() => {
      if (!currentUsername || !activeChatUser) return;
  
      const chatsRef = collection(db, 'chats');
      const q1 = query(chatsRef, where('participants', '==', [currentUsername, activeChatUser]));
      const q2 = query(chatsRef, where('participants', '==', [activeChatUser, currentUsername]));
  
      const fetchMessages = async () => {
          const chatSnapshot1 = await getDocs(q1);
          const chatSnapshot2 = await getDocs(q2);
          
          if (!chatSnapshot1.empty) {
              setMessages(chatSnapshot1.docs[0].data().messages || []);
          } else if (!chatSnapshot2.empty) {
              setMessages(chatSnapshot2.docs[0].data().messages || []);
          }
      };
  
      fetchMessages();
  
      const unsubscribe1 = onSnapshot(q1, snapshot => {
          if (!snapshot.empty) {
              setMessages(snapshot.docs[0].data().messages || []);
          }
      });
  
      const unsubscribe2 = onSnapshot(q2, snapshot => {
          if (!snapshot.empty) {
              setMessages(snapshot.docs[0].data().messages || []);
          }
      });
  
      return () => {
          unsubscribe1();
          unsubscribe2();
      };
    }, [currentUsername, activeChatUser]);

    const sendMessage = async () => {
      if (!messageInput.trim()) return;
  
      const chatsRef = collection(db, 'chats');
      const q1 = query(chatsRef, where('participants', '==', [currentUsername, activeChatUser]));
      const q2 = query(chatsRef, where('participants', '==', [activeChatUser, currentUsername]));
  
      const chatSnapshot1 = await getDocs(q1);
      const chatSnapshot2 = await getDocs(q2);
  
      let chatDoc;
      if (!chatSnapshot1.empty) {
          chatDoc = chatSnapshot1.docs[0];
      } else if (!chatSnapshot2.empty) {
          chatDoc = chatSnapshot2.docs[0];
      } else {
          return;
      }
  
      const updatedMessages = [...chatDoc.data().messages, {
          text: messageInput,
          sender: currentUsername
      }];
  
      await updateDoc(doc(db, 'chats', chatDoc.id), { messages: updatedMessages });
  
      setMessageInput('');
    };

    useEffect(() => {
    if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
}, [messages]);


    return (
        <PrivateRoute>
            <div className="bg-white text-black min-h-screen flex flex-col">
                {/* Navbar */}
                <Navbar />
    
                {/* Chat Container */}
                <div className="flex-grow flex">
                    {/* Previous Chats (Left Panel) */}
                    <div className="bg-grey2 w-1/4 p-4 shadow-md">
                        <ul className="space-y-2">
                            {chats.map((chatUser, index) => (
                                <li 
                                    key={index} 
                                    className={`
                                        border-b border-black text-black text-lg pt-4 pb-4 pl-2 pr-2 flex justify-between items-center 
                                        cursor-pointer transition-all duration-300 transform
                                        ${chatUser === activeChatUser ? 'bg-vibrant3' : 'hover:bg-grey2 hover:shadow-lg slide-btn slide-btn-vibrant3'}
                                    `}
                                    onClick={() => setActiveChatUser(chatUser)}
                                >
                                    <span>{chatUser}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
    
                    {/* Active Chat (Right Panel) */}
                    <div className="flex-grow p-4 flex flex-col">
                        {/* Chat Messages */}
                        <div className="rounded-lg p-4 overflow-y-auto h-[55em]" ref={messagesContainerRef}>
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`mb-2 ${message.sender === currentUsername ? 'text-right' : 'text-left'}`}
                                >
                                    <div
                                        className={`bg-grey1 text-blue5 rounded-lg px-4 py-2 ${message.sender === currentUsername ? 'rounded-tr-none mr-auto' : 'rounded-tl-none ml-auto'}`}
                                        style={{ maxWidth: '60%', display: 'inline-block' }}
                                    >
                                        {message.text}
                                    </div>
                                </div>
                            ))}
                        </div>
    
                        {/* Chat Input */}
                        <div className="mt-4 p-4">
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    className="flex-grow bg-grey1 px-3 py-2 border rounded-lg text-black bg-grey1 mr-2"
                                    placeholder="Type your message..."
                                    value={messageInput}
                                    onChange={e => setMessageInput(e.target.value)}
                                    onKeyPress={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                />
                                <motion.button
                                    className="slide-btn slide-btn-vibrant2 bg-grey1 text-black px-4 py-2 rounded-lg hover:bg-opacity-70"
                                    whileHover={{ scale: 1.05 }}
                                    onClick={sendMessage}
                                >
                                    Send
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PrivateRoute>
    )    
}
