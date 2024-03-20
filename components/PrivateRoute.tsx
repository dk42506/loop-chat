import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import app from '../components/firebase';
import { getAuth } from "firebase/auth";

const auth = getAuth(app);

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]); // Include router in the dependency array

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  
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