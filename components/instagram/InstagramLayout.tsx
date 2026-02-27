import React from 'react';

export function InstagramLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background/50 flex justify-center py-6 px-4">
            <div className="w-full max-w-4xl bg-background rounded-3xl border border-border overflow-hidden shadow-2xl glass flex flex-col md:flex-row">
                {/* Main Content Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center">
                            <InstagramIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold font-sans tracking-tight">Instagram Studio</h1>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}
