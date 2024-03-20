import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import app from '../components/firebase';
import { motion, AnimatePresence } from 'framer-motion';

const auth = getAuth(app);
const db = getFirestore(app);

interface NavbarProps {
  onChatCreated: (username: string) => void;
}

export default function Navbar({ onChatCreated }: NavbarProps) {

  const [username, setUsername] = useState<string | null>(null);
  const [activeUserUsername, setActiveUserUsername] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const searchResultsRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      if (auth.currentUser) {
          const userRef = collection(db, 'users');
          const q = query(userRef, where('uid', '==', auth.currentUser.uid));
  
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
              // Assuming that the field containing the username in your document is 'username'
              const userDoc = querySnapshot.docs[0];
              const fetchedUsername = userDoc.data().username;
              setUsername(fetchedUsername);
  
              // Set the activeUserUsername as well
              setActiveUserUsername(fetchedUsername);
          }
      }
    };

    fetchUsername();

    // If you want to refetch the username when the user changes, 
    // you can add an auth state changed listener here and call fetchUsername.

  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    // Create a Firestore query to search for users
    const usersRef = collection(db, 'users'); // Replace 'users' with your Firestore collection name
    const q = query(usersRef, where('username', '>=', searchQuery));

    // Fetch the results
    getDocs(q)
      .then((querySnapshot) => {
        const results: string[] = [];
        querySnapshot.forEach((doc) => {
          results.push(doc.data().username);
        });

        const slicedResults = results.slice(0, 5);
        setSearchResults(slicedResults);
      })
      .catch((error) => {
        console.error('Error fetching search results:', error);
      });
  }, [searchQuery]);

  useEffect(() => {
    // Position the search results below the search bar
    if (searchResultsRef.current) {
      const searchBar = document.querySelector('.search-bar');
      if (searchBar) {
        const searchBarRect = searchBar.getBoundingClientRect();
        searchResultsRef.current.style.left = `${searchBarRect.left}px`;
        searchResultsRef.current.style.top = `${searchBarRect.bottom}px`;
      }
    }
  }, [searchResults]);

  const handleNewChat = async (selectedUser: string) => {
    const chatsRef = collection(db, 'chats');
    const currentUserId = auth.currentUser?.uid;
  
    if (!currentUserId || !activeUserUsername) {
      console.error("Current user does not have a valid user ID");
      return;
    }
  
    if (selectedUser === activeUserUsername) {
      console.error("You cannot create a chat with yourself");
      return;
    }
  
    // Define the participants and sort them to maintain consistency in how they're stored
    const participants = [activeUserUsername, selectedUser].sort();
  
    // Query to check if a chat with these participants already exists
    const chatQuery = query(chatsRef, where('participants', '==', participants));
  
    const querySnapshot = await getDocs(chatQuery);
  
    if (!querySnapshot.empty) {
      console.error("Chat between these users already exists");
      // You might want to handle this case differently, maybe alert the user or switch to the existing chat
      return;
    }
  
    const unreadMessages = { [activeUserUsername]: 0, [selectedUser]: 0 };
  
    addDoc(chatsRef, {
      participants: participants,
      messages: [],
      unreadMessages: unreadMessages,
      lastUpdated: new Date()
    }).then(() => {
      console.log("Chat created successfully");
      onChatCreated(selectedUser);
    }).catch((error) => {
      console.error("Error creating chat:", error);
    });
  };


  useEffect(() => {
    // Function to handle the click event
    function handleOutsideClick(event: MouseEvent) {
        if (searchResultsRef.current && event.target instanceof Node) {
            // Check if the clicked element is outside the search box and the results
            if (!searchResultsRef.current.contains(event.target) &&
                !document.querySelector('.search-bar')?.contains(event.target)) {
                setSearchResults([]);
            }
        }
    }

    // Add the event listener
    document.addEventListener('click', handleOutsideClick);

    // Clean up the listener when the component unmounts
    return () => {
        document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <div className="navbar bg-grey-100 flex justify-between items-center p-4 relative border-b border-black z-30">
      <div className="search-section flex items-center relative w-1/3"> {/* Adjust the width as needed */}
        <input
          type="text"
          className="search-input form-input px-4 py-2 w-full rounded-lg text-black border-gray-300 shadow-sm"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
  
        <AnimatePresence mode="wait">
          {searchResults.length > 0 && (
            <motion.ul
              ref={searchResultsRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="search-results absolute top-full mt-1 w-full bg-white shadow-lg z-40 rounded-md overflow-hidden" // Ensure this z-index is higher than the chat panel's
              // Tailwind classes for absolute positioning and styling
            >
              {searchResults.map((result, index) => (
                <motion.li 
                  key={index} 
                  className="py-2 px-4 hover:bg-blue-500 hover:text-white cursor-pointer transition ease-in-out duration-150"
                  onClick={() => handleNewChat(result)}
                  whileHover={{ scale: 1.05 }}
                >
                  {result}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Right Section (Username & Sign Out Button) */}
      <div className="user-section flex items-center justify-end w-full">
        <span className="username mr-6 text-lg font-bold text-black">{username}</span>
        <motion.button
          className="sign-out-button slide-btn slide-btn-vibrant1 bg-grey2 text-black px-4 py-2 rounded-lg hover:bg-opacity-70"
          whileHover={{ scale: 1.05 }}
          onClick={() => signOut(auth)}
        >
          Sign Out
        </motion.button>
      </div>
    </div>
  );
};