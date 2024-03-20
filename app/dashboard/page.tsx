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

    const auth = getAuth(app);
    const db = getFirestore(app);

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
                    <div className="hidden md:block md:w-1/4 lg:w-1/5 p-4 overflow-y-auto shadow-md">
                        <ul className="space-y-2">
                            {chats.map((chatUser, index) => (
                                <li key={index} onClick={() => setActiveChatUser(chatUser)}
                                    className={`border-b border-black text-lg pt-4 pb-4 pl-2 pr-2 flex justify-between items-center cursor-pointer transition duration-300 transform ${chatUser === activeChatUser ? 'bg-vibrant1' : 'hover:bg-grey2'}`}>
                                    {chatUser}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex-1 flex flex-col p-4">
                        <div className="flex flex-col flex-grow relative">
                            <div className="overflow-y-auto custom-scroll absolute inset-0 pb-20">
                                {messages.map((message, index) => (
                                    <div key={index} className={`mb-2 ${message.sender === currentUsername ? 'text-right' : 'text-left'}`}>
                                        <div className={`inline-block px-4 py-2 rounded-lg ${message.sender === currentUsername ? 'bg-vibrant2 rounded-br-none' : 'bg-grey1 rounded-bl-none'}`}>
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t">
                                <div className="flex items-center">
                                    <input type="text" className="flex-grow bg-grey1 px-3 py-2 border rounded-lg mr-2"
                                        placeholder="Type your message..." value={messageInput}
                                        onChange={e => setMessageInput(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && sendMessage()} />
                                    <motion.button whileHover={{ scale: 1.05 }} onClick={sendMessage}
                                                className="bg-vibrant3 text-white px-4 py-2 rounded-lg hover:bg-opacity-80">
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