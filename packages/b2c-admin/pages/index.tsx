import React from 'react';

const ManagerSite = () => {
    return (
        <div className="flex flex-col items-center gap-8 rounded-xl border-4 p-6">
            <div className="text-2xl font-semibold text-rose-600">
                Welcome to The Perfume CMS
            </div>
            <div className="text-center">
                <div className="text-xl ">Unleash Your Fragrance Vision</div>
                <div>
                    Create captivating online perfume stores with our intuitive
                    CMS.
                </div>
            </div>
            <div>
                <span className="rounded-md border border-rose-500 bg-rose-500 px-4 py-2 font-medium uppercase text-white">
                    Let&apos;s Start
                </span>
            </div>
        </div>
    );
};

export default ManagerSite;
