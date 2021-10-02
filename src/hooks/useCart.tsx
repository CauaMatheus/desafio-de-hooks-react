import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => Promise<void>;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storedCart = localStorage.getItem("@RocketShoes:cart")

    if (storedCart) {
      return JSON.parse(storedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const { data: stock }: { data: Stock } = await api.get(`/stock/${productId}`)
      const products = [...cart]
      const inCartProduct = products.find(product => product.id === productId);

      if (stock.amount <= 0 || (inCartProduct && stock.amount <= inCartProduct.amount)) {
        toast.error("Quantidade solicitada fora de estoque")
        return
      }

      if (inCartProduct) {
        inCartProduct.amount += 1
      } else {
        const { data: product } = await api.get(`/products/${productId}`);
        products.push({...product, amount: 1})
      }

      setCart(products)
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(products))
    } catch {
      // TODO
      toast.error("Erro na adição do produto")
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const products = [...cart]

      const productIndex = products.findIndex((product) => product.id === productId)
      if (productIndex >= 0) {
        products.splice(productIndex, 1)
        setCart(products)
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(products))
        return
      }
      throw Error()
    } catch {
      // TODO
      toast.error("Erro na remoção do produto")
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount <= 0) {
        return
      }

      const { data: stock }: { data: Stock } = await api.get(`/stock/${productId}`)
      if (stock.amount < amount) {
        toast.error("Quantidade solicitada fora de estoque")
        return
      }

      const products = [...cart]
      const requestedProduct = products.find((product) => product.id === productId)

      if(requestedProduct){
        requestedProduct.amount = amount
        setCart(products)
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(products))
      }
    } catch {
      // TODO
      toast.error("Erro na alteração de quantidade do produto")
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
