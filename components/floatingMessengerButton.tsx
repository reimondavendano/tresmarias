// components/FloatingMessengerButton.tsx
'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookMessenger } from '@fortawesome/free-brands-svg-icons'; // Import the specific icon

export function FloatingMessengerButton() {
  const messengerUrl = "https://web.facebook.com/profile.php?id=100064024891300";

  return (
    <a
      href={messengerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 
                 bg-blue-600 text-white           
                 p-4 rounded-full shadow-lg        
                 hover:bg-blue-700 transition-colors duration-300
                 flex items-center justify-center
                 w-14 h-14 md:w-16 md:h-16"        
      aria-label="Chat with us on Messenger"
    >
      {/* Use the FontAwesomeIcon component */}
      <FontAwesomeIcon 
        icon={faFacebookMessenger} 
        className="text-white opacity-75 hover:opacity-100 transition-opacity duration-300"
        style={{ fontSize: '2.5rem' }} // Adjust size as needed
      />
    </a>
  );
}