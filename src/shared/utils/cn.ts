/**
 * @file cn.ts
 * @description Tailwind CSS 클래스 합치기 및 중복 처리를 위한 유틸리티 함수
 * @usage
 * - 일반적인 클래스 결합: cn('px-2', 'py-1')
 * - 조건부 클래스 결합: cn('base-style', isActive && 'active-style')
 * - Tailwind-merge를 통한 클래스 충돌 방지 (예: p-4 p-2가 동시에 들어오면 p-2 적용)
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/*
    example usage:
    import { cn } from '@shared/utils/cn';

    const Button = ({ isActive }) => (
    <button className={cn(
        "px-4 py-2 rounded", 
        isActive ? "bg-blue-500" : "bg-gray-300"
    )}>
        클릭
    </button>
    );
*/