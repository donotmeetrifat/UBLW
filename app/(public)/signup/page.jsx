import React, { Suspense } from 'react'
import AuthSection from '@/components/AuthSection'

export const metadata = {
    title: 'Join UK Brand Lover | Authentic British Beauty',
    description: 'Join the UK Brand Lover family for 100% authentic UK imported beauty, personalised skincare guidance, and fast delivery across Bangladesh.'
}

export default function SignUpPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FAF6FA]" />}>
            <AuthSection initialMode="signup" />
        </Suspense>
    )
}

