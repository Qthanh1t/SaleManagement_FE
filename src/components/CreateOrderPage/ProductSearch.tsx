import { AutoComplete, message, Spin } from 'antd';
import { useStores } from '../../stores/RootStore';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import {type Product, searchProducts } from '../../services/productService';

const ProductSearch = observer(() => {
    const { orderCreationStore } = useStores();
    const [options, setOptions] = useState<{ value: string, label: string, product: Product }[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState(""); // State để reset ô input

    // Xử lý tìm kiếm sản phẩm
    const handleSearch = async (value: string) => {
        setSearchValue(value); // Lưu giá trị đang gõ
        if (!value || value.length < 2) {
            setOptions([]);
            return;
        }
        setLoading(true);
        try {
            const products = await searchProducts(value);
            setOptions(products.map(p => ({
                value: p.name, // Giá trị của ô input (chỉ để hiển thị)
                label: `${p.name} (Tồn: ${p.stockQuantity} - Giá: ${p.price.toLocaleString('vi-VN')} VNĐ)`,
                product: p
            })));
        } catch (error) {
            message.error("Lỗi tìm kiếm sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khi CHỌN 1 sản phẩm
    const onSelect = (_: string, option: any) => {
        orderCreationStore.addProductToCart(option.product);
        setSearchValue(""); // Reset ô input sau khi chọn
        setOptions([]); // Xóa danh sách gợi ý
    };

    return (
        <AutoComplete
            options={options}
            style={{ width: '100%' }}
            onSelect={onSelect}
            onSearch={handleSearch}
            value={searchValue} // Gán giá trị này để reset
            placeholder="Tìm sản phẩm theo Tên hoặc SKU..."
            notFoundContent={loading ? <Spin size="small" /> : null}
        />
    );
});

export default ProductSearch;