import {Link} from 'react-router'
import { Button } from "@/components/ui/button"
import { UserCircle } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', cursive" }}>Dashboard</h1>
        <Link to="/change-password">
          <Button variant="outline" size="sm">
            <UserCircle className="mr-2 h-4 w-4" />
            Change Password
          </Button>
        </Link>
      </div>
    </header>
  )
}

