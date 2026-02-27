import React from 'react';

export function FacebookLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-[600px] h-full flex flex-col items-center justify-start p-6">
            <div className="w-full max-w-4xl bg-background rounded-3xl border border-border overflow-hidden shadow-2xl glass flex flex-col flex-1 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                {/* Main Content Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

export function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
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
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    );
}
