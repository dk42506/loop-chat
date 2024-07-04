"use client";

import Message from '@/components/Message';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PrivateRoute from '../../components/PrivateRoute';

export default function Dashboard() {
    return (
        <PrivateRoute>
            {/*<Message />*/}
            
        </PrivateRoute>
    );    
}    