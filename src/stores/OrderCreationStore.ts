import { makeAutoObservable, runInAction } from "mobx";
import type {Customer} from "../services/customerService";
import type {Product} from "../services/productService";
import { createOrder, type OrderItemRequest } from "../services/orderService";

// Định nghĩa 1 item trong giỏ hàng (khác với Product)
export interface CartItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    stock: number; // Lưu lại tồn kho để kiểm tra
}

export class OrderCreationStore {
    selectedCustomer: Customer | null = null;

    // Dùng Map để truy cập/cập nhật giỏ hàng O(1)
    // Key là productId
    cart = new Map<number, CartItem>();

    status: "idle" | "pending" | "success" | "error" = "idle";
    errorMessage: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    // --- Computed Values ---
    get totalCartItems(): number {
        return Array.from(this.cart.values()).reduce((sum, item) => sum + item.quantity, 0);
    }

    get totalCartAmount(): number {
        return Array.from(this.cart.values()).reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    get cartItemsArray(): CartItem[] {
        return Array.from(this.cart.values());
    }

    // --- Actions ---
    setCustomer(customer: Customer | null) {
        this.selectedCustomer = customer;
    }

    addProductToCart(product: Product) {
        this.status = "idle"; // Reset status

        // Kiểm tra xem đã có trong giỏ chưa
        const existingItem = this.cart.get(product.id);

        if (existingItem) {
            // Nếu có, tăng số lượng, nhưng phải check tồn kho
            if (existingItem.quantity < product.stockQuantity) {
                existingItem.quantity += 1;
            } else {
                // (Có thể báo lỗi)
                console.warn("Đã đạt tối đa tồn kho");
            }
        } else {
            // Nếu chưa có, thêm mới
            if (product.stockQuantity > 0) {
                this.cart.set(product.id, {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    stock: product.stockQuantity
                });
            } else {
                console.warn("Hết hàng");
            }
        }
    }

    updateItemQuantity(productId: number, quantity: number) {
        const item = this.cart.get(productId);
        if (item) {
            if (quantity > 0 && quantity <= item.stock) {
                item.quantity = quantity;
            } else if (quantity > item.stock) {
                item.quantity = item.stock; // Set về max
            }
        }
    }

    removeItemFromCart(productId: number) {
        this.cart.delete(productId);
    }

    clearCart() {
        this.cart.clear();
        this.selectedCustomer = null;
        this.errorMessage = null;
    }
    resetStatus = () => {
        this.status = 'idle';
    }

    // Gửi đơn hàng
    async submitOrder() {
        if (!this.selectedCustomer || this.cart.size === 0) {
            this.errorMessage = "Vui lòng chọn khách hàng và sản phẩm";
            return;
        }

        this.status = "pending";
        this.errorMessage = null;

        const items: OrderItemRequest[] = this.cartItemsArray.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }));

        try {
            const newOrder = await createOrder({
                customerId: this.selectedCustomer.id,
                items: items
            });
            runInAction(() => {
                this.status = "success";
                this.clearCart(); // Xóa giỏ hàng sau khi thành công
            });
            return newOrder;
        } catch (error: any) {
            runInAction(() => {
                this.status = "error";
                // Lấy message lỗi từ backend
                this.errorMessage = error.response?.data?.message || "Đã xảy ra lỗi không xác định";
            });
        }
    }
}