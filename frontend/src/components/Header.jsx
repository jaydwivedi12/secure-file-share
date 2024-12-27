import {Link} from 'react-router'
import { Button } from "@/components/ui/button"
import { UserCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext';


export function Header() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', cursive" }}>Dashboard</h1>
        <div className='flex gap-5'>
        <Link to="/change-password">
          <Button variant="outline" size="sm">
            <UserCircle className="mr-2 h-4 w-4" />
            Change Password
          </Button>
        </Link>
          <Button variant="destructive" size="sm" onClick={handleLogout} >
            Logout
          </Button>
        </div>
        
      </div>
    </header>
  )
}

