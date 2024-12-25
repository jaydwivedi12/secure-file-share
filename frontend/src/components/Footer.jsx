import {Link} from 'react-router'
import { Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white shadow-sm mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center items-center">
        <p className="text-sm text-gray-500">
          Created by Jay Dwivedi
          <Link to="https://github.com/jaydwivedi12/" className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800">
            <Github className="h-4 w-4 mr-1" />
            GitHub
          </Link>
        </p>
      </div>
    </footer>
  )
}

