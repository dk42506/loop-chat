import React, { useState, useEffect, useRef } from 'react';

export default function Video() {

  return (
    <>
        <video className="w-full" autoPlay loop muted playsInline>
            <source src="videos/demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
    </>
  );
};