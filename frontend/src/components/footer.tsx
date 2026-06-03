const Footer = () => {
    return (
        <footer className="w-full border-t border-border/40 bg-background/50 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Eng.Journal. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-foreground transition-colors duration-200">
                            Privacy
                        </a>
                        <a href="#" className="hover:text-foreground transition-colors duration-200">
                            Terms
                        </a>
                        <a href="#" className="hover:text-foreground transition-colors duration-200">
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer