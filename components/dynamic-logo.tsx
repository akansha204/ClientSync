"use client";

import Image from "next/image";
import { useTheme } from "@/contexts/theme-context";

interface DynamicLogoProps {
    width?: number;
    height?: number;
    className?: string;
    alt?: string;
    forceTheme?: 'light' | 'dark'; // Force a specific theme instead of using actual theme
}

export function DynamicLogo({
    width = 32,
    height = 32,
    className = "w-8 h-8",
    alt = "ClientSync Logo",
    forceTheme
}: DynamicLogoProps) {
    const { theme } = useTheme();

    const effectiveTheme = forceTheme || theme;
    const logoSrc = effectiveTheme === 'dark' ? '/white logo.png' : '/black logo.png';

    return (
        <Image
            src={logoSrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
        />
    );
}
