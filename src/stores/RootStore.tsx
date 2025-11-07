import { createContext, useContext } from "react";
import { AuthStore } from "./AuthStore";

interface RootStore {
    authStore: AuthStore;
}

// 1. Khởi tạo các store
const rootStore: RootStore = {
    authStore: new AuthStore(),
};

// 2. Tạo React Context
const RootStoreContext = createContext<RootStore | null>(null);

// 3. Tạo Provider Component (sẽ dùng trong App.tsx)
export const RootStoreProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <RootStoreContext.Provider value={rootStore}>
            {children}
            </RootStoreContext.Provider>
    );
};

// 4. Tạo hook để truy cập store
export const useStores = () => {
    const context = useContext(RootStoreContext);
    if (context === null) {
        throw new Error("useStores must be used within a RootStoreProvider");
    }
    return context;
};