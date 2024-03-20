"use client";

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import PrivateRoute from '../../components/PrivateRoute';
import { getFirestore, collection, query, where, onSnapshot, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from '../../components/firebase';
import { motion } from 'framer-motion';

interface Message {
    text: string;
    sender: string;
}

export default function Dashboard() {
    const [chats, setChats] = useState<string[]>([]);
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState<string>('');
    const messageContainerRef = useRef<HTMLDivElement>(null); // Move useRef inside the component
    const [isChatOpen, setIsChatOpen] = useState(false);

    const toggleChat = () => setIsChatOpen(!isChatOpen);

    const auth = getAuth(app);
    const db = getFirestore(app);

    const adjustScrollToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        adjustScrollToBottom();
    }, [messages, activeChatUser]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                fetchUsername();
            } else {
                resetState();
            }
        });

        return () => unsubscribe();
    }, [auth]);

    const resetState = () => {
        setChats([]);
        setCurrentUsername(null);
        setActiveChatUser(null);
        setMessages([]);
    };

    const fetchUsername = async () => {
        if (auth.currentUser) {
            const userRef = collection(db, 'users');
            const q = query(userRef, where('uid', '==', auth.currentUser.uid));
            const querySnapshot = await getDocs(q);
            const fetchedUsername = querySnapshot.docs[0]?.data().username as string | undefined;
            setCurrentUsername(fetchedUsername || null);
        }
    };

    useEffect(() => {
        if (!currentUsername) return;
    
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', currentUsername), orderBy('lastUpdated', 'desc'));
    
        const unsubscribe = onSnapshot(q, snapshot => {
            const chatUsers = snapshot.docs.map(doc => ({
                username: doc.data().participants.find((username: string) => username !== currentUsername),
                lastUpdated: doc.data().lastUpdated?.toDate(),
            })).filter(user => user.username); // filter out undefined values
    
            setChats(chatUsers.map(user => user.username));
        });
    
        return () => unsubscribe();
    }, [currentUsername, db]);

    useEffect(() => {
        if (!currentUsername || !activeChatUser) return;

        const fetchMessages = async () => {
            const chatsRef = collection(db, 'chats');
            const q = query(chatsRef, where('participants', 'in', [[currentUsername, activeChatUser], [activeChatUser, currentUsername]]));

            const unsubscribe = onSnapshot(q, snapshot => {
                snapshot.forEach(doc => {
                    const messages = doc.data().messages as Message[];
                    setMessages(messages || []);
                });
            });

            return () => unsubscribe();
        };

        fetchMessages();
    }, [currentUsername, activeChatUser]);

    const sendMessage = async () => {
        if (!messageInput.trim()) return;
    
        const updatedMessages = [...messages, { text: messageInput, sender: currentUsername! }];
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'in', [[currentUsername, activeChatUser], [activeChatUser, currentUsername]]));
    
        getDocs(q).then(snapshot => {
            snapshot.forEach(async docSnapshot => {
                await updateDoc(doc(db, 'chats', docSnapshot.id), { 
                    messages: updatedMessages,
                    lastUpdated: new Date() // update the timestamp
                });
            });
        });
    
        setMessageInput('');
    };


    return (
        <PrivateRoute>
            <div className="flex flex-col min-h-screen bg-white text-black">
                <Navbar />
    
                <div className="flex flex-1 overflow-hidden">
                    {/* Arrow button for toggling chat panel visibility, only visible in mobile */}
                    <div 
                        className={`fixed left-0 top-1/2 z-30 transform -translate-y-1/2 cursor-pointer p-2 bg-gray-200 pt-10 pb-10 ${isChatOpen ? 'bg-opacity-80' : 'bg-opacity-50'} rounded-r md:hidden`}
                        onClick={toggleChat}
                        style={{ transition: 'transform 0.3s, background-color 0.3s' }}
                    >
                        <svg
                            className={`h-6 w-6 text-gray-600 transform ${isChatOpen ? 'rotate-180' : 'rotate-0'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            style={{ transition: 'transform 0.3s' }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
    
                    {/* Chat panel */}
                    <div className={`chat-panel transition-transform ${isChatOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-20 w-full max-w-xs bg-white shadow-lg overflow-y-auto md:static md:translate-x-0 md:max-w-full md:w-1/4 lg:w-1/5`}>
                        <ul className="space-y-2 p-4">
                            {chats.map((chatUser, index) => (
                                <li key={index} 
                                    onClick={() => {
                                        setActiveChatUser(chatUser);
                                        setIsChatOpen(false); // Close the panel when a chat is selected
                                    }}
                                    className={`border-b border-gray-300 text-lg p-4 flex justify-between items-center cursor-pointer transition-colors duration-300 ${chatUser === activeChatUser ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>
                                    {chatUser}
                                </li>
                            ))}
                        </ul>
                    </div>
    
                    {/* Main content area */}
                    <div className="flex-1 flex flex-col p-4">
                        <div className="flex flex-col flex-grow relative">
                            <div ref={messageContainerRef} className="overflow-y-auto custom-scroll absolute inset-0 pb-20">
                                {messages.map((message, index) => (
                                    <div key={index} className={`mb-2 ${message.sender === currentUsername ? 'text-right' : 'text-left'}`}>
                                        <div className={`inline-block px-4 py-2 rounded-lg ${message.sender === currentUsername ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
    
                            <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t">
                                <div className="flex items-center">
                                    <input 
                                        type="text" 
                                        className="flex-grow bg-gray-100 px-3 py-2 border rounded-lg mr-2" 
                                        placeholder="Type your message..." 
                                        value={messageInput}
                                        onChange={e => setMessageInput(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && sendMessage()} 
                                    />
                                    <motion.button
                                        onClick={sendMessage}
                                        className="bg-grey2 px-4 py-2 rounded-lg hover:bg-blue-600"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        Send
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PrivateRoute>
    );    
}    