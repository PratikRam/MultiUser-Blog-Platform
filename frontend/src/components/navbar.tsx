"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Home, LayoutDashboard, User, Menu, X } from "lucide-react"

const Navbar = () => {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const navLinks = [
        { href: "/feed", label: "Home", icon: Home },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/profile", label: "Profile", icon: User },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo / Brand */}
                    <div className="flex items-center">
                        <Link href="/feed" className="flex items-center space-x-2.5 group">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary">
                                Eng<span className="text-blue-500">.Journal</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? "bg-secondary text-secondary-foreground font-semibold shadow-xs"
                                            : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{link.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                          type="button"
                          className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-secondary/60 hover:text-foreground focus:outline-hidden"
                          aria-controls="mobile-menu"
                          aria-expanded={isMobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6 transition-transform duration-200 rotate-90" />
                            ) : (
                                <Menu className="h-6 w-6 transition-transform duration-200" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-b border-border/40 bg-background/95 backdrop-blur-md transition-all duration-300" id="mobile-menu">
                    <div className="space-y-1 px-4 py-3">
                        {navLinks.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-150 ${
                                        isActive
                                            ? "bg-secondary text-secondary-foreground font-semibold"
                                            : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{link.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar