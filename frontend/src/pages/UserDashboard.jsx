import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { UploadFileBlock } from '@/components/UploadFileBlock'
import { YourFilesBlock } from '@/components/YourFilesBlock'
import { PublicShareBlock } from '@/components/PublicShareBlock'
import { SharedWithYouBlock } from '@/components/SharedWithYouBlock'

import { useAuth } from '@/contexts/AuthContext'
import  TypeWriterEffect  from '@/utils/typingText'


export default function UserDashboard() {
  const { auth } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-baseline space-x-4 mb-16">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="text-xl text-gray-500 italic"
          >
            Hello {auth.user.email}, <TypeWriterEffect />
          </motion.p>
        </div>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.2 }}
        >
          <UploadFileBlock />
          <YourFilesBlock />
          <PublicShareBlock />
          <SharedWithYouBlock />
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}

