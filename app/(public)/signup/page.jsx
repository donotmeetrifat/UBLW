import React, { Suspense } from 'react'
import AuthSection from '@/components/AuthSection'

export const metadata = {
    title: 'Create Account | UK Brand Lover',
    description: 'Create an account to join UK Brand Lover VIP Club for 100% authentic UK imported beauty in Bangladesh.'
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FAF6FA]" />}>
            <AuthSection initialMode="signup" />
        </Suspense>
    )
}

