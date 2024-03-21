"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

interface ChatUser {
    username: string;
    unreadCount: number;
}

export default function Dashboard() {
    const [chats, setChats] = useState<ChatUser[]>([]);
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [activeChatUser, setActiveChatUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState<string>('');
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const auth = getAuth(app);
    const db = getFirestore(app);

    // Adjusting scroll to bottom functionality
    const adjustScrollToBottom = useCallback(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, []);

    // Fetching username functionality
    const fetchUsername = useCallback(async () => {
        if (auth.currentUser) {
            const userRef = collection(db, 'users');
            const q = query(userRef, where('uid', '==', auth.currentUser.uid));
            const querySnapshot = await getDocs(q);
            const fetchedUsername = querySnapshot.docs[0]?.data().username as string | undefined;
            setCurrentUsername(fetchedUsername || null);
        }
    }, [auth.currentUser, db]);

    // Adjust scroll when messages or active chat user changes
    useEffect(() => {
        adjustScrollToBottom();
    }, [messages, activeChatUser, adjustScrollToBottom]);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                fetchUsername();
            } else {
                setCurrentUsername(null);
                setChats([]);
                setActiveChatUser(null);
                setMessages([]);
            }
        });

        return () => unsubscribe();
    }, [auth, fetchUsername]);

    // Fetch chats
    useEffect(() => {
        if (!currentUsername) return;
        
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', currentUsername), orderBy('lastUpdated', 'desc'));
        
        const unsubscribe = onSnapshot(q, snapshot => {
            const chatUsers = snapshot.docs.map(doc => {
                const data = doc.data();
                const unreadMessages = data.unreadMessages || {}; // Ensure unreadMessages is an object
                const unreadCount = unreadMessages[currentUsername] || 0; // Safely access the unreadCount
    
                return {
                    username: data.participants.find((username: string) => username !== currentUsername) || 'Unknown User',
                    unreadCount: unreadCount,
                };
            });
    
            setChats(chatUsers);
        });
    
        return () => unsubscribe();
    }, [currentUsername, db]);

    // Fetch messages
    useEffect(() => {
        if (!currentUsername || !activeChatUser) return;

        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'in', [[currentUsername, activeChatUser], [activeChatUser, currentUsername]]));

        const unsubscribe = onSnapshot(q, snapshot => {
            snapshot.forEach(doc => {
                const messages = doc.data().messages as Message[];
                setMessages(messages || []);
            });
        });

        return () => unsubscribe();
    }, [currentUsername, activeChatUser, db]);

    // Send message
    const sendMessage = async () => {
        if (!messageInput.trim()) return;
    
        const updatedMessages = [...messages, { text: messageInput, sender: currentUsername! }];
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'in', [[currentUsername, activeChatUser], [activeChatUser, currentUsername]]));
    
        getDocs(q).then(snapshot => {
            snapshot.forEach(async docSnapshot => {
                const chatDoc = docSnapshot.data();
                const unreadUpdates = { ...chatDoc.unreadMessages };
    
                if (activeChatUser) {
                    unreadUpdates[activeChatUser] = (unreadUpdates[activeChatUser] || 0) + 1;
                }
    
                await updateDoc(doc(db, 'chats', docSnapshot.id), {
                    messages: updatedMessages,
                    unreadMessages: unreadUpdates,
                    lastUpdated: new Date()
                });
            });
        });
    
        setMessageInput('');
    };

    // Toggle chat functionality
    const toggleChat = () => setIsChatOpen(!isChatOpen);

    const handleNewChatCreated = (chatUser: string) => {
        setActiveChatUser(chatUser);
        setIsChatOpen(true);
    };

    const handleChatSelection = async (selectedUser: string) => {
        setActiveChatUser(selectedUser); // Set the active chat user state
    
        // Fetch and update the chat document to reset the unread count for the current user
        const chatsRef = collection(db, 'chats');
        const q = query(chatsRef, where('participants', 'array-contains', currentUsername), orderBy('lastUpdated', 'desc'));
    
        const chatDocs = await getDocs(q);
        chatDocs.forEach(async (docSnapshot) => {
            const chatData = docSnapshot.data();
            // Assuming the structure has an `unreadMessages` field where keys are usernames
            if (chatData.participants.includes(selectedUser)) { // Check if the selected user is part of the chat
                const unreadMessages = chatData.unreadMessages || {};
                unreadMessages[currentUsername!] = 0; // Reset unread count for the current user
    
                await updateDoc(doc(db, 'chats', docSnapshot.id), {
                    unreadMessages: unreadMessages
                });
            }
        });
    };

    return (
        <PrivateRoute>
            <div className="flex flex-col min-h-screen bg-white text-black">
                <Navbar onChatCreated={handleNewChatCreated} />

                <div className="flex flex-1 overflow-hidden">
                    {/* Chat panel */}
                    <div className={`chat-panel transition-transform ${isChatOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-20 w-full max-w-xs bg-white shadow-lg overflow-y-auto md:static md:translate-x-0 md:max-w-full md:w-1/4 lg:w-1/5`}>
                    <ul className="space-y-2 p-4">
                        {chats.map((chat, index) => (
                            <li key={index} 
                                onClick={() => {
                                    handleChatSelection(chat.username),
                                    setIsChatOpen(false);
                                }}
                                className={`border-b border-gray-300 text-lg p-4 flex justify-between items-center cursor-pointer transition-colors duration-300 ${chat.username === activeChatUser ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>
                                {chat.username}
                                {chat.unreadCount > 0 && (
                                    <span className="ml-2 h-2 w-2 bg-blue-500 rounded-full"></span> // This represents the unread indicator
                                )}
                            </li>
                        ))}
                    </ul>
                    </div>
    
                    {/* Main content area */}
                    <div className="flex-1 flex flex-col">
                        {/* Conditionally render the active chat user's username in mobile view */}
                        {!isChatOpen && activeChatUser && (
                            <div className="block md:hidden text-center py-2">
                                <strong>{activeChatUser}</strong>
                            </div>
                        )}
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

                            {/* Chat toggle button positioned above the sendMessage bar */}
                            <div className="absolute bottom-24 left-2 md:hidden">
                                <button 
                                    onClick={toggleChat} 
                                    className="p-2 bg-gray-200 rounded-full shadow-lg"
                                    style={{ transition: 'background-color 0.3s' }}
                                >
                                    <svg
                                        className={`h-6 w-6 transform ${isChatOpen ? 'rotate-180' : 'rotate-0'}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
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