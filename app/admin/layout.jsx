import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "UK Brand Lover - Admin Dashboard",
    description: "UK Brand Lover Admin Panel",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
