import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UserCircle } from "lucide-react";
import { UploadFileBlock } from "@/components/UploadFileBlock";
import { AdminFilesBlock } from "@/components/AdminFilesBlock";
import { AdminSearchBar } from "@/components/AdminSearchBar";
import { AdminUsersBlock } from "@/components/AdminUsersBlock";
import { AdminSharedLinksBlock } from "@/components/AdminSharedLinksBlock";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import TypeWriterEffect from "@/utils/typingText";

import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router";
export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { auth, logout } = useAuth();

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search functionality across all blocks
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container mx-auto p-4">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1
            className="text-4xl font-bold text-gray-900"
            style={{ fontFamily: "'Playfair Display', cursive" }}
          >
            {" "}
            Admin Dashboard
          </h1>
          <div className="flex gap-5">
            <Link to="/change-password">
              <Button variant="outline" size="sm">
                <UserCircle className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <div className="space-y-6">
        <div className="py-4 flex flex-wrap items-center gap-4 md:flex-none md:justify-between">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="text-xl text-gray-500 italic w-full "
          >
            Hello {auth.user.email}, <TypeWriterEffect />
          </motion.p>
          <div className="w-full md:w-auto">
            <AdminSearchBar onSearch={handleSearch} />
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <UploadFileBlock />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AdminUsersBlock searchQuery={searchQuery} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AdminFilesBlock searchQuery={searchQuery} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AdminSharedLinksBlock searchQuery={searchQuery} />
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
