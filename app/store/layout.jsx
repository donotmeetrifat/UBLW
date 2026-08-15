import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "UK Brand Lover - Store Dashboard",
    description: "UK Brand Lover Store Owner Panel",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
