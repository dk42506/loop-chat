"use client";

import React from 'react'
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, Auth } from "firebase/auth";
import app from '../../components/firebase';

export default function Dashboard() {
  return (
    <h1>Dashboard</h1>
  )
}
