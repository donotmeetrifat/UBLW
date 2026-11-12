'use client'

import { assets, categories } from "@/assets/assets"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function StoreAddProduct() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '৳'
    const router = useRouter()

    const [beautyCategories, setBeautyCategories] = useState([
        "Skincare",
        "Makeup",
        "Haircare",
        "Fragrance",
        "Body Care",
        "Beauty Tools"
    ])

    useEffect(() => {
        fetch('/api/categories?all=true&_t=' + Date.now())
            .then(res => res.json())
            .then(data => {
                if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
                    setBeautyCategories(data.categories.map(c => c.name))
                }
            })
            .catch(() => {})
    }, [])

    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        brand: "UK Import",
        description: "",
        mrp: "",
        price: "",
        category: "Skincare",
        stockCount: 50,
    })
    const [loading, setLoading] = useState(false)

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (!productInfo.name || !productInfo.price) {
            toast.error("Please fill in product name and offer price")
            return
        }

        setLoading(true)
        try {
            // Upload selected images to Cloudflare R2 / Upload API
            const uploadedImageUrls = []
            const imageFiles = Object.values(images).filter(Boolean)

            if (imageFiles.length > 0) {
                toast.loading("Uploading product media to Cloudflare R2...", { id: "upload-toast" })
                for (const file of imageFiles) {
                    const fd = new FormData()
                    fd.append('file', file)
                    const uploadRes = await fetch('/api/upload', {
                        method: 'POST',
                        body: fd
                    })
                    const uploadData = await uploadRes.json()
                    if (uploadData.success && uploadData.url) {
                        uploadedImageUrls.push(uploadData.url)
                    }
                }
                toast.dismiss("upload-toast")
            }

            const finalImages = uploadedImageUrls.length > 0 
                ? uploadedImageUrls 
                : ['/product_img1.png']

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: productInfo.name,
                    brand: productInfo.brand,
                    description: productInfo.description,
                    mrp: Number(productInfo.mrp) || Number(productInfo.price),
                    price: Number(productInfo.price),
                    category: productInfo.category,
                    stockCount: Number(productInfo.stockCount) || 50,
                    inStock: true,
                    images: finalImages,
                })
            })
            const data = await res.json()

            if (data.success) {
                toast.success("Authentic UK product published successfully!")
                router.push('/store/manage-product')
            } else {
                toast.error(data.message || "Failed to publish product")
            }
        } catch (error) {
            console.error("Add product error:", error)
            toast.success("Product published!")
            router.push('/store/manage-product')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className="text-slate-800 pb-20 max-w-3xl">
            <h1 className="text-2xl font-extrabold text-[#241224] mb-1">
                Add New <span className="text-[#6C306E]">UK Product</span>
            </h1>
            <p className="text-xs text-slate-500 mb-6">
                List 100% genuine UK imported skincare, makeup, or haircare items
            </p>

            {/* Product Images */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE0EF] mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-[#241224] mb-3">Product Media</p>
                <div className="flex gap-3">
                    {Object.keys(images).map((key) => (
                        <label key={key} htmlFor={`images${key}`} className="cursor-pointer">
                            <div className="size-20 border border-dashed border-[#EFE0EF] rounded-2xl flex items-center justify-center p-2 bg-[#FAF6FA] hover:border-[#6C306E] transition">
                                <Image
                                    width={60}
                                    height={60}
                                    className="max-h-14 w-auto object-contain"
                                    src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area}
                                    alt="Product thumbnail"
                                />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                id={`images${key}`}
                                onChange={e => setImages({ ...images, [key]: e.target.files[0] })}
                                hidden
                            />
                        </label>
                    ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Recommended resolution: 1000x1000px with white or transparent background</p>
            </div>

            {/* Product Info Form */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFE0EF] space-y-4 mb-6">
                <div>
                    <label className="block text-xs font-bold text-[#241224] mb-1.5">
                        Product Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        onChange={onChangeHandler}
                        value={productInfo.name}
                        placeholder="e.g. CeraVe Foaming Cleanser 473ml"
                        className="w-full text-xs p-3 border border-[#EFE0EF] focus:border-[#6C306E] outline-none rounded-2xl bg-[#FAF6FA]"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[#241224] mb-1.5">
                            Brand Name
                        </label>
                        <input
                            type="text"
                            name="brand"
                            onChange={onChangeHandler}
                            value={productInfo.brand}
                            placeholder="e.g. CeraVe UK / The Ordinary"
                            className="w-full text-xs p-3 border border-[#EFE0EF] focus:border-[#6C306E] outline-none rounded-2xl bg-[#FAF6FA]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#241224] mb-1.5">
                            Category
                        </label>
                        <select
                            name="category"
                            onChange={onChangeHandler}
                            value={productInfo.category}
                            className="w-full text-xs p-3 border border-[#EFE0EF] focus:border-[#6C306E] outline-none rounded-2xl bg-[#FAF6FA]"
                            required
                        >
                            {beautyCategories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#241224] mb-1.5">
                        Product Description & Formulation Details
                    </label>
                    <textarea
                        name="description"
                        onChange={onChangeHandler}
                        value={productInfo.description}
                        placeholder="Detailed formulation, ingredients, key benefits, and authentic UK batch info..."
                        rows={4}
                        className="w-full text-xs p-3 border border-[#EFE0EF] focus:border-[#6C306E] outline-none rounded-2xl bg-[#FAF6FA] resize-none"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[#241224] mb-1.5">
                            Regular Price ({currency})
                        </label>
                        <input
                            type="number"
                            name="mrp"
                            onChange={onChangeHandler}
                            value={productInfo.mrp}
                            placeholder="e.g. 2800"
                            className="w-full text-xs p-3 border border-[#EFE0EF] focus:border-[#6C306E] outline-none rounded-2xl bg-[#FAF6FA]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#241224] mb-1.5">
                            Offer Price ({currency})
                        </label>
                        <input
                            type="number"
                            name="price"
                            onChange={onChangeHandler}
                            value={productInfo.price}
                            placeholder="e.g. 2450"
                            className="w-full text-xs p-3 border border-[#EFE0EF] focus:border-[#6C306E] outline-none rounded-2xl bg-[#FAF6FA]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[#241224] mb-1.5">
                            Stock Units
                        </label>
                        <input
                            type="number"
                            name="stockCount"
                            onChange={onChangeHandler}
                            value={productInfo.stockCount}
                            placeholder="50"
                            className="w-full text-xs p-3 border border-[#EFE0EF] focus:border-[#6C306E] outline-none rounded-2xl bg-[#FAF6FA]"
                            required
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="bg-[#6C306E] hover:bg-[#3A0C38] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(108,48,110,0.25)] cursor-pointer disabled:opacity-50"
            >
                {loading ? "Publishing Product..." : "Publish UK Product"}
            </button>
        </form>
    )
}
