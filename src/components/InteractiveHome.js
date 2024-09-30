"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function InteractiveHome() {
    const [hoveredElement, setHoveredElement] = useState(null);

    const handleMouseMove = (event) => {
        const { offsetX, offsetY, target } = event.nativeEvent;
        const width = target.clientWidth;
        const height = target.clientHeight;

        if (offsetX > width * 0.8 && offsetX < width * 1 && offsetY > height * 0.3 && offsetY < height * 0.7) {
            setHoveredElement('casino');
        } else if (offsetX > width * 0.4 && offsetX < width * 0.6 && offsetY > height * 0.2 && offsetY < height * 0.5) {
            setHoveredElement('merch');
        } else if (offsetX > width * 0.57 && offsetX < width * 0.77 && offsetY > height * 0.35 && offsetY < height * 0.85) {
            setHoveredElement('roroland');
        } else {
            setHoveredElement(null);
        }
    };

    return (
        <div className="relative" onMouseMove={handleMouseMove}>
            <div className="relative w-full h-auto">
                <img src="/assets/smoke.gif" alt="background" className="w-full h-auto object-contain" />

                <img
                    src={hoveredElement === 'casino' ? '/assets/casino-light.png' : '/assets/casino.png'}
                    alt="Casino"
                    className="absolute inset-0 w-full h-auto object-contain"
                />

                <img
                    src={hoveredElement === 'merch' ? '/assets/merch-light.png' : '/assets/merch.png'}
                    alt="Merch"
                    className="absolute inset-0 w-full h-auto object-contain"
                />

                <img
                    src={hoveredElement === 'roroland' ? '/assets/roroland-light.png' : '/assets/roroland.png'}
                    alt="RoroLand"
                    className="absolute inset-0 w-full h-auto object-contain"
                />

                {hoveredElement === 'roroland' && (
                    <Link href="/claim" className="absolute inset-0 w-full h-full" />
                )}

                {hoveredElement === 'merch' && (
                    <Link href="https://shop.roroland.xyz/" target='blank' className="absolute inset-0 w-full h-full" />
                )}
            </div>
        </div>
    );
}
