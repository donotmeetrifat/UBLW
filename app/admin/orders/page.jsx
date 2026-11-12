import StoreOrders from "@/app/store/orders/page"

export const metadata = {
    title: "Customer Orders & Courier Dispatch - UK Brand Lover Admin",
    description: "Manage customer orders, track Steadfast courier manifests, and invoice dispatches",
}

export default function AdminOrdersPage() {
    return <StoreOrders />
}
