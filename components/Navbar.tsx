import React from 'react';
import { getAuth, signOut } from "firebase/auth";
import app from '../components/firebase';

const auth = getAuth(app);

export default function Navbar() {
  return (
    <div className="bg-blue5 flex justify-between items-center p-4">
      {/* Left Section (Search Bar) */}
      <div className="flex items-center">
        {/* Search Bar */}
        <input
          type="text"
          className="px-3 py-2 border rounded-lg text-blue5 bg-blue3 mr-2"
          placeholder="Search..."
        />
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