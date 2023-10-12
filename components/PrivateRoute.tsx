import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth'; // Import the necessary Firebase auth functions
import app from '../components/firebase';
import { getAuth } from "firebase/auth";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const auth = getAuth(app);
  
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
          setUser(authUser);
        } else {
          router.push('/'); // Redirect to the landing page if not authenticated
        }
      });
  
      return () => unsubscribe();
    }, []);
  
    useEffect(() => {
      if (user) {
        // If the user is signed in, prevent them from accessing the landing page and redirect to the dashboard
        router.push('/dashboard');
      }
    }, [user]);
  
    if (!user) {
      // You can add a loading spinner or message here while checking authentication state
      return(
        <div className="flex justify-center items-center h-screen">
          <div className="space-x-2 animate-bounce200">
            <div className="w-12 h-12 bg-vibrant1 rounded-full"></div>
          </div>
          <div className="space-x-2 animate-bounce">
            <div className="w-12 h-12 bg-vibrant2 rounded-full"></div>
          </div>
          <div className="space-x-2 animate-bounce400">
            <div className="w-12 h-12 bg-vibrant3 rounded-full"></div>
          </div>
        </div>
      )
    }
  
    return <>{children}</>;
  };
  
  export default PrivateRoute;