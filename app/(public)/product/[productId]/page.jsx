import prisma, { isDatabaseConfigured } from '@/lib/prisma';
import { getSiteUrl, SITE_METADATA } from '@/lib/siteConfig';
import ProductClient from '@/components/ProductClient';

async function getProduct(productId) {
    if (!productId) return null;
    try {
        if (isDatabaseConfigured()) {
            const product = await prisma.product.findUnique({
                where: { id: productId },
                include: {
                    ratings: {
                        select: { rating: true, comment: true, createdAt: true }
                    }
                }
            });
            if (product) return product;
        }
    } catch (e) {
        console.error('[ProductPage] Error querying product from database:', e);
    }
    return null;
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const productId = resolvedParams?.productId;
    const siteUrl = getSiteUrl();
    const product = await getProduct(productId);

    if (!product) {
        return {
            title: 'Authentic UK Beauty Product | UK Brand LOVER',
            description: SITE_METADATA.shortDescription,
        };
    }

    const title = `${product.name} — 100% Authentic UK Import | UK Brand LOVER Bangladesh`;
    const cleanDesc = (product.whyYouWillLoveIt || product.description || '').replace(/\s+/g, ' ').trim().slice(0, 150);
    const description = `Buy authentic ${product.name} imported from London with original UK store purchase receipts. Price: ৳${product.price}. ${cleanDesc}`;
    const mainImage = Array.isArray(product.images) && product.images[0] ? product.images[0] : `${siteUrl}/images/web-logo.png`;
    const canonicalUrl = `${siteUrl}/product/${product.id}`;

    return {
        title,
        description,
        keywords: [
            product.name,
            `${product.name} Bangladesh`,
            `${product.name} price in BD`,
            `${product.name} Dhaka`,
            `${product.brand || 'UK'} Bangladesh`,
            'authentic UK skincare Bangladesh',
            'original UK cosmetics with receipts',
            product.category || 'Skincare'
        ],
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: `${product.name} | UK Brand LOVER Bangladesh`,
            description: `100% Authentic UK Imported. Price: ৳${product.price} BDT with original UK store receipt.`,
            url: canonicalUrl,
            siteName: SITE_METADATA.name,
            locale: 'en_BD',
            type: 'website',
            images: [
                {
                    url: mainImage,
                    width: 800,
                    height: 800,
                    alt: product.name,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.name} | UK Brand LOVER`,
            description: `100% Authentic UK Imported. Price: ৳${product.price} BDT with original UK store receipt.`,
            images: [mainImage],
        },
    };
}

export default async function ProductPage({ params }) {
    const resolvedParams = await params;
    const productId = resolvedParams?.productId;
    const siteUrl = getSiteUrl();
    const product = await getProduct(productId);

    let productSchema = null;
    if (product) {
        const canonicalUrl = `${siteUrl}/product/${product.id}`;
        const images = Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : [`${siteUrl}/images/web-logo.png`];
        
        const ratingCount = product.ratings?.length || 0;
        const avgRating = ratingCount > 0
            ? (product.ratings.reduce((acc, r) => acc + (r.rating || 0), 0) / ratingCount).toFixed(1)
            : "5.0";

        productSchema = {
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `${canonicalUrl}#product`,
            "name": product.name,
            "image": images,
            "description": product.description || `${product.name} - 100% Authentic UK Imported skincare with verified batch codes and original UK store purchase receipts.`,
            "category": product.category || "Skincare",
            "brand": {
                "@type": "Brand",
                "name": product.brand || "UK Import"
            },
            "offers": {
                "@type": "Offer",
                "url": canonicalUrl,
                "priceCurrency": "BDT",
                "price": String(product.price),
                "priceValidUntil": "2027-12-31",
                "itemCondition": "https://schema.org/NewCondition",
                "availability": product.inStock && (product.stockCount > 0 || product.stockCount === undefined)
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                "seller": {
                    "@type": "Organization",
                    "name": SITE_METADATA.name,
                    "url": siteUrl
                },
                "shippingDetails": {
                    "@type": "OfferShippingDetails",
                    "shippingRate": {
                        "@type": "MonetaryAmount",
                        "value": "80",
                        "currency": "BDT"
                    },
                    "shippingDestination": {
                        "@type": "DefinedRegion",
                        "addressCountry": "BD"
                    },
                    "deliveryTime": {
                        "@type": "ShippingDeliveryTime",
                        "handlingTime": {
                            "@type": "QuantitativeValue",
                            "minValue": 0,
                            "maxValue": 1,
                            "unitCode": "d"
                        },
                        "transitTime": {
                            "@type": "QuantitativeValue",
                            "minValue": 1,
                            "maxValue": 3,
                            "unitCode": "d"
                        }
                    }
                },
                "hasMerchantReturnPolicy": {
                    "@type": "MerchantReturnPolicy",
                    "applicableCountry": "BD",
                    "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                    "merchantReturnDays": 7,
                    "returnMethod": "https://schema.org/ReturnByMail"
                }
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": avgRating,
                "reviewCount": String(Math.max(ratingCount, 1))
            }
        };
    }

    return (
        <>
            {productSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
                />
            )}
            <ProductClient productId={productId} initialProduct={product} />
        </>
    );
}
