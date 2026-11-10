import React, { Suspense } from 'react'
import AuthSection from '@/components/AuthSection'

export const metadata = {
    title: 'Sign In | UK Brand Lover',
    description: 'Sign in to access your UK Brand Lover account, view your shopping bag, and track orders across Bangladesh.'
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FAF6FA]" />}>
            <AuthSection initialMode="signin" />
        </Suspense>
    )
}
