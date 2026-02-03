import React, { useEffect, useState } from 'react';

interface FlipCardProps {
    value: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const FlipCard: React.FC<FlipCardProps> = ({ value, size = 'lg' }) => {
    const [currValue, setCurrValue] = useState(value);
    const [prevValue, setPrevValue] = useState(value);
    const [isFlipping, setIsFlipping] = useState(false);

    useEffect(() => {
        if (value !== currValue) {
            setPrevValue(currValue);
            setCurrValue(value);
            setIsFlipping(true);
            
            const timer = setTimeout(() => {
                setIsFlipping(false);
            }, 600); // Duration of the animation
            return () => clearTimeout(timer);
        }
    }, [value, currValue]);

    // Size mappings
    const sizeClasses = {
        sm: 'w-24 h-32 text-6xl',
        md: 'w-40 h-56 text-8xl',
        lg: 'w-56 h-80 text-[10rem]',
        xl: 'w-64 h-96 text-[12rem] md:w-80 md:h-[30rem] md:text-[18rem]', // Massive for full screen
    };

    const containerClass = sizeClasses[size] || sizeClasses.lg;

    // Ring visuals
    const Rings = () => (
        <div className="absolute -top-4 left-0 w-full flex justify-center gap-6 z-40">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col items-center">
                    {/* The Metal Ring */}
                    <div className="w-4 h-8 bg-gradient-to-r from-gray-600 via-gray-300 to-gray-500 rounded-full shadow-md z-20"></div>
                </div>
            ))}
        </div>
    );

    const CardContent = ({ val, side }: { val: number, side: 'top' | 'bottom' }) => (
        <div className={`w-full h-full relative overflow-hidden bg-[#151515] flex justify-center ${side === 'top' ? 'items-end rounded-t-xl' : 'items-start rounded-b-xl'}`}>
             {/* Glossy overlay */}
             <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
             
             {/* Number - Adjusted for perfect split */}
            <div 
                className={`absolute font-bold font-mono tracking-tighter text-[#FFFF00] leading-none flex items-center justify-center w-full h-[200%] ${side === 'top' ? 'top-0 items-center' : 'bottom-0 items-center'}`}
            >
                {val}
            </div>

            {/* Holes for rings */}
            <div className={`absolute w-full flex justify-center gap-6 ${side === 'top' ? 'top-2' : '-top-2'}`}>
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-3 h-3 rounded-full bg-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"></div>
                ))}
            </div>
        </div>
    );

    return (
        <div className={`flip-card-container relative ${containerClass} perspective-1000 select-none`}>
            {/* Visual Rings sitting on top */}
            <Rings />

            <div className="relative w-full h-full rounded-xl shadow-2xl bg-black">
                {/* Background Static Cards */}
                <div className="absolute top-0 left-0 w-full h-full flex flex-col rounded-xl overflow-hidden">
                    {/* Top Half (Current) - Shows Top of Current */}
                    <div className="h-1/2 w-full relative border-b border-black/50">
                        <CardContent val={currValue} side="top" />
                    </div>
                     {/* Bottom Half (Current) - Shows Bottom of Current */}
                    <div className="h-1/2 w-full relative">
                        <CardContent val={isFlipping ? prevValue : currValue} side="bottom" />
                    </div>
                </div>

                {/* Flipping Cards Layer */}
                {isFlipping && (
                    <>
                        {/* Top half flipping down (Previous Value) */}
                        <div key={`top-${prevValue}`} className="absolute top-0 left-0 w-full h-1/2 rounded-t-xl overflow-hidden origin-bottom backface-hidden z-20 animate-flip-down border-b border-black/50">
                             <CardContent val={prevValue} side="top" />
                             {/* Darken as it flips down */}
                             <div className="absolute inset-0 bg-black/0 animate-[shading-down_0.6s_linear_forwards]"></div>
                        </div>

                        {/* Bottom half flipping down (Current Value) */}
                        <div key={`bottom-${currValue}`} className="absolute bottom-0 left-0 w-full h-1/2 rounded-b-xl overflow-hidden origin-top backface-hidden z-30 animate-flip-up">
                            <CardContent val={currValue} side="bottom" />
                             {/* Lighten as it flips up */}
                             <div className="absolute inset-0 bg-black/50 animate-[shading-up_0.6s_linear_forwards]"></div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FlipCard;
