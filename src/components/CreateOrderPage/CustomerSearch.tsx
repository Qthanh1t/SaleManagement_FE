import { AutoComplete, Button, Form, Input, Modal, Spin, message } from 'antd';
import { useStores } from '../../stores/RootStore';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import {type Customer, searchCustomers, createCustomer } from '../../services/customerService';
import { UserAddOutlined } from '@ant-design/icons';

const CustomerSearch = observer(() => {
    const { orderCreationStore } = useStores();
    const [options, setOptions] = useState<{ value: string, label: string, customer: Customer }[]>([]);
    const [loading, setLoading] = useState(false);

    // State cho modal tạo khách
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [modalLoading, setModalLoading] = useState(false);

    // Xử lý tìm kiếm (gõ SĐT)
    const handleSearch = async (value: string) => {
        if (!value || value.length < 3) {
            setOptions([]);
            return;
        }
        setLoading(true);
        try {
            const customers = await searchCustomers(value);
            setOptions(customers.map(c => ({
                value: c.phoneNumber,
                label: `${c.fullName} - ${c.phoneNumber}`,
                customer: c
            })));
        } catch (error) {
            message.error("Lỗi tìm kiếm khách hàng");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khi chọn 1 khách hàng
    const onSelect = (_: string, option: any) => {
        orderCreationStore.setCustomer(option.customer);
    };

    // Xử lý tạo khách hàng mới (trong modal)
    const handleCreateCustomer = async () => {
        try {
            const values = await form.validateFields();
            setModalLoading(true);
            const newCustomer = await createCustomer(values);
            message.success("Tạo khách hàng mới thành công!");
            orderCreationStore.setCustomer(newCustomer); // Tự động chọn khách vừa tạo
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            message.error("Lỗi: SĐT có thể đã tồn tại");
        } finally {
            setModalLoading(false);
        }
    };

    if (orderCreationStore.selectedCustomer) {
        // Nếu đã chọn, hiển thị thông tin
        return (
            <div className="p-4 rounded-lg">
                <h4 className="font-bold">Khách hàng: {orderCreationStore.selectedCustomer.fullName}</h4>
                <p>SĐT: {orderCreationStore.selectedCustomer.phoneNumber}</p>
                <Button danger onClick={() => orderCreationStore.setCustomer(null)}>
                    Thay đổi
                </Button>
            </div>
        );
    }

    // Nếu chưa chọn, hiển thị ô tìm kiếm
    return (
        <div className='p-4 rounded-lg'>
            <div className='flex gap-2'>
                <AutoComplete
                    options={options}
                    style={{ width: '100%' }}
                    onSelect={onSelect}
                    onSearch={handleSearch}
                    placeholder="Tìm khách hàng theo SĐT..."
                    notFoundContent={loading ? <Spin size="small" /> : null}
                />
                <Button icon={<UserAddOutlined />} onClick={() => setIsModalOpen(true)}>
                    Mới
                </Button>
            </div>

            {/* Modal tạo khách hàng mới */}
            <Modal
                title="Tạo khách hàng mới"
                open={isModalOpen}
                onOk={handleCreateCustomer}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={modalLoading}
            >
                <Form form={form} layout="vertical" className='mt-4'>
                    <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
});

export default CustomerSearch;