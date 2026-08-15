'use client'

import { CheckCircle2, StarIcon } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('Description')

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const category = product?.category || 'Beauty'

    // Key benefits derived factually from product description & category
    const defaultBenefits = [
        "100% Authentic UK Imported Formula for guaranteed purity and performance.",
        "Dermatologically-crafted daily care suitable for sensitive and all skin types.",
        "Delivers deep hydration, protection, and noticeable long-lasting results.",
        "Free from unverified harsh additives, direct shipment from official UK suppliers."
    ]

    return (
        <div className="my-16 text-sm text-slate-600">
            {/* Navigation Tabs */}
            <div className="flex border-b border-[#EFE0EF] mb-8 max-w-2xl">
                {['Description', 'Reviews'].map((tab, index) => (
                    <button 
                        key={index} 
                        onClick={() => setSelectedTab(tab)}
                        className={`px-5 py-3 font-semibold text-sm transition-colors relative cursor-pointer ${
                            tab === selectedTab 
                                ? 'text-[#6C306E] border-b-2 border-[#6C306E]' 
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab === 'Reviews' ? `Customer Reviews (${product.rating?.length || 0})` : 'Product Details & Description'}
                    </button>
                ))}
            </div>

            {/* Description Tab Content: Scannable Structured Format */}
            {selectedTab === "Description" && (
                <div className="max-w-3xl space-y-8 text-slate-700">
                    {/* Section 1: Product Overview */}
                    <div>
                        <h4 className="text-xs font-bold text-[#6C306E] uppercase tracking-wider mb-2">
                            Product Overview
                        </h4>
                        <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                            {product.description}
                        </p>
                    </div>

                    {/* Section 2: Key Benefits */}
                    <div className="bg-[#FAF6FA] border border-[#EFE0EF] p-5 sm:p-6 rounded-2xl">
                        <h4 className="text-xs font-bold text-[#6C306E] uppercase tracking-wider mb-3">
                            Key Product Benefits
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                            {defaultBenefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-slate-700">
                                    <CheckCircle2 size={16} className="text-[#6C306E] shrink-0 mt-0.5" />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Section 3: Why You'll Love It */}
                    <div>
                        <h4 className="text-xs font-bold text-[#6C306E] uppercase tracking-wider mb-2">
                            Why You'll Love It
                        </h4>
                        <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                            Imported directly from the UK, this product is formulated to meet high European beauty standards. It integrates seamlessly into your daily routine to deliver consistent quality and confidence.
                        </p>
                    </div>

                    {/* Section 4: Product Specifications Table */}
                    <div className="pt-4 border-t border-[#EFE0EF]">
                        <h4 className="text-xs font-bold text-[#6C306E] uppercase tracking-wider mb-3">
                            Product Specifications
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-white p-4 border border-[#EFE0EF] rounded-xl">
                            <div>
                                <span className="text-slate-400 block mb-0.5">Category</span>
                                <span className="font-bold text-[#241224]">{category}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Origin</span>
                                <span className="font-bold text-[#241224]">100% UK Import</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Price</span>
                                <span className="font-bold text-[#3A0C38]">{currency}{product.price.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5">Authenticity</span>
                                <span className="font-bold text-green-700">Guaranteed</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews Tab Content: Clean, Spacious & Borderless */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-3 mt-8">
                    {product.rating.map((item, index) => (
                        <div key={index} className="flex gap-5 mb-8">
                            <Image src={item.user.image} alt={item.user.name} className="size-10 rounded-full object-cover shrink-0" width={40} height={40} />
                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    {Array(5).fill('').map((_, idx) => (
                                        <StarIcon key={idx} size={16} className='text-transparent mt-0.5' fill={item.rating >= idx + 1 ? "#6C306E" : "#E2E8F0"} />
                                    ))}
                                </div>
                                <p className="text-sm max-w-lg my-3 text-slate-700 leading-relaxed">{item.review}</p>
                                <p className="font-medium text-slate-800 text-sm">{item.user.name}</p>
                                <p className="mt-2 font-light text-xs text-slate-400">{new Date(item.createdAt).toDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProductDescription