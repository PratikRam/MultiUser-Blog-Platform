import React from 'react'
import Navbar from '@/src/components/navbar'
import Footer from '@/src/components/footer'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="min-h-screen">
            <Navbar />
            {children}
            <Footer />
        </main>
    )
}

export default layout