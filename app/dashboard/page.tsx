"use client";

import React from 'react'
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, Auth } from "firebase/auth";
import app from '../../components/firebase';

export default function Dashboard() {

    const router = useRouter();

    useEffect(() => {
        const auth: Auth = getAuth(app);
        const isUserAuthenticated = auth.currentUser !== null; // Check if user is authenticated
    
        if (!isUserAuthenticated) {
          router.push('/'); // Redirect to login page if not authenticated
        }
      }, []);

  return (
    <h1>Dashboard</h1>
  )
}
