import { makeAutoObservable } from "mobx";

export class UIStore {
    // Trạng thái modal quản lý sản phẩm
    isProductModalOpen = false;
    editingProductId: number | null = null; // null: Tạo mới, number: Sửa

    constructor() {
        makeAutoObservable(this);
    }

    // Actions
    openProductModal(id: number | null = null) {
        this.isProductModalOpen = true;
        this.editingProductId = id;
    }

    closeProductModal() {
        this.isProductModalOpen = false;
        this.editingProductId = null;
    }
}