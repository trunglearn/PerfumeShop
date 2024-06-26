import { toast } from 'react-toastify';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CartLocalItem = {
    productId: string;
    quantity: number;
};

type CartQueryState = {
    data: CartLocalItem[];
    setData: (payload: CartLocalItem[]) => void;
};

const useCartQueryStore = create(
    persist<CartQueryState>(
        (set) => ({
            data: [],
            setData: (payload: CartLocalItem[]) => set({ data: payload }),
        }),
        {
            name: 'cart-store',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

const useCartStore = () => {
    const { data, setData } = useCartQueryStore();

    const addProduct = (product: CartLocalItem) => {
        const productInCart = data?.find(
            (item) => item.productId === product.productId
        );

        if (productInCart) {
            const newProductInCart: CartLocalItem = {
                ...productInCart,
                quantity: productInCart.quantity + product.quantity,
            };

            const newData = [
                newProductInCart,
                ...data.filter((item) => item.productId !== product.productId),
            ];
            setData(newData);
            toast.success('Thêm sản phẩm vào giỏ hàng thành công.');
        } else {
            setData([product, ...data]);
            toast.success('Thêm sản phẩm vào giỏ hàng thành công.');
        }
    };

    const updateProductQuantity = (
        product: CartLocalItem,
        quantity: number
    ) => {
        const index = data.findIndex(
            (item) => item.productId === product.productId
        );
        if (index !== -1) {
            const newData = [...data];
            newData[index].quantity = product.quantity;
            newData[index].quantity = Math.max(newData[index].quantity, 1);
            newData[index].quantity = Math.min(
                newData[index].quantity,
                quantity ?? 0
            );
            setData(newData);
        } else {
            toast.error('Sản phẩm không tồn tại trong giỏ hàng!');
        }
    };

    const deleteProduct = (productId: string) => {
        const newData = data?.filter((item) => item.productId !== productId);
        setData(newData);
        toast.success('Sản phẩm đã đc xóa khỏi giỏ hàng.');
    };

    return {
        data,
        addProduct,
        updateProductQuantity,
        deleteProduct,
    };
};

export default useCartStore;
