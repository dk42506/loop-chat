import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import app from '../components/firebase';

const auth = getAuth(app);
const db = getFirestore(app);

export default function Navbar() {

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const searchResultsRef = useRef<HTMLUListElement | null>(null);

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
              <li key={index} className="py-2 px-4 hover:bg-blue2 hover:text-white cursor-pointer">
                {result}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right Section (Sign Out Button) */}
      <div>
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