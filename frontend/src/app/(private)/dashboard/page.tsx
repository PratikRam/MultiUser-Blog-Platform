const dashboard = () => {
    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {/* Welcome Section */}
            <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-blue-950/20 dark:to-purple-950/20">
                <h2 className="mb-2 text-2xl font-bold text-foreground">
                    Welcome to Your Dashboard
                </h2>
                <p className="text-muted-foreground">
                    Here's what you can do today
                </p>
            </div>
        </main>
    );
};

export default dashboard;