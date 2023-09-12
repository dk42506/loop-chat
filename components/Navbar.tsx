import React from 'react';

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
            // Handle sign out action
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};