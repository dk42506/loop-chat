import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import app from '../components/firebase';

const auth = getAuth(app);
const db = getFirestore(app);

export default function Navbar() {

  const [username, setUsername] = useState<string | null>(null);
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
                setUsername(userDoc.data().username);
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
    const currentUserId = auth.currentUser?.uid;

    // Ensure the current user has a valid user ID
    if (!currentUserId) {
        console.error("Current user does not have a valid user ID");
        return;
    }

    // Ensure the user doesn't create a chat with themselves
    if (selectedUser === currentUserId) {
        console.error("You cannot create a chat with yourself");
        return;
    }

    // Check if a chat with these participants already exists
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, 
                    where(`participants.${currentUserId}`, '==', true),
                    where(`participants.${selectedUser}`, '==', true));

    const existingChat = await getDocs(q);

    if (!existingChat.empty) {
        console.error("A chat between these users already exists.");
        return;
    }

    // Define chat participants
    const participants: Record<string, boolean> = {
        [currentUserId]: true,  // current user
        [selectedUser]: true    // clicked user
    };

    // Add new chat to Firestore database
    addDoc(chatsRef, {
        participants: participants,
        messages: []  // initialize with an empty messages array
    }).then(() => {
        console.log("Chat created successfully");
    }).catch((error) => {
        console.error("Error creating chat:", error);
    });
  }

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
    <div className="bg-blue5 flex justify-between items-center p-4 relative">
      {/* Left Section (Search Bar) */}
      <div className="flex items-center relative search-bar">
        {/* Search Bar */}
        <input
          type="text"
          className="px-3 py-2 border rounded-lg text-blue5 bg-blue3 mr-2"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
        />

        {/* Display search results */}
        {searchResults.length > 0 && (
          <ul
            ref={searchResultsRef}
            className="absolute w-40 bg-blue3 border border-gray-200 rounded-lg shadow-lg"
          >
            {searchResults.map((result, index) => (
              <li key={index} 
              className="py-2 px-4 hover:bg-blue2 hover:text-white cursor-pointer"
              onClick={() => handleNewChat(result)}
              >
                {result}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right Section (Username & Sign Out Button) */}
      <div className="flex items-center">
          <span className="mr-6 text-lg font-bold text-white">{username}</span>
          {/* Sign Out Button */}
          <button
            className="bg-blue2 text-white px-4 py-2 rounded-lg hover:bg-opacity-70"
            onClick={() => {
              signOut(auth).then(() => {
                // Sign-out successful.
              }).catch((error) => {
                // An error happened.
              });
            }}
          >
            Sign Out
          </button>
      </div>
    </div>
  );
};