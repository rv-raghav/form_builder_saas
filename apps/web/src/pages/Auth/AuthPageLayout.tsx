import React from 'react';
import GridShape from '../../components/common/GridShape';
import { Link } from 'react-router';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
            <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
                <div
                    className="items-center hidden w-full h-full lg:w-1/2 lg:grid"
                    style={{ backgroundColor: '#000' }}
                >
                    <div className="relative flex items-center justify-center z-1">
                        {/* <!-- ===== Common Grid Shape Start ===== --> */}
                        <GridShape />
                        <div className="flex flex-col items-center max-w-xs">
                            <Link to="/" className="block mb-4">
                                <img
                                    width={300}
                                    height={90}
                                    src="/assets/logo/logo-dark.svg"
                                    alt="Logo"
                                />
                            </Link>
                            <p className="text-center text-gray-400 dark:text-white/60">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe, quo.
                            </p>
                        </div>
                    </div>
                </div>

                {children}
            </div>
        </div>
    );
}
