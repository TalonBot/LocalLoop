'use client';

import { useEffect, useState } from 'react';
import { loginTestUser, getMyProducts, createProduct, deleteProduct, updateProduct} from '@/lib/api';


type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  quantity_available: number;
  unit: string;
  is_available: boolean;
};


export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
const [newProduct, setNewProduct] = useState({
  name: '',
  description: '',
  category: 'Honey',
  price: 0,
  quantity_available: 1,
  unit: 'kg',
  is_available: true,
});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getMyProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      alert('Failed to load products.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts(); // fetch products on page load
  }, []);

  const handleLogin = async () => {
  try {
    console.log('Attempting login...');
    const result = await loginTestUser();
    console.log('✅ Login successful:', result);
    alert('Login successful!');
  } catch (error) {
    console.error('❌ Login failed:', error);
    alert('Login failed. Check console.');
  }
};

const handleSubmitProduct = async () => {
  try {
    if ((newProduct as any).id) {
      await updateProduct((newProduct as any).id, newProduct);
      alert('✏️ Product updated!');
    } else {
      await createProduct(newProduct);
      alert('✅ Product added!');
    }
        addToCart(newProduct as Product); // ZA SHRANJEVANJUE V LOCALSTORAGE
      
    setShowForm(false);
    fetchProducts();
  } catch (err) {
    console.error('Submit failed:', err);
    alert('❌ Failed to submit product');
  }
};

// Dodajanje v kosarico localStorage
const addToCart = (product: Product) => {
  const existing = localStorage.getItem('cart');
  const cart = existing ? JSON.parse(existing) : [];
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
};


const handleEdit = (product: Product) => {
  setNewProduct(product);     // prefill the form
  setShowForm(true);          // show the form
};

const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    await deleteProduct(id);  // use your API method
    alert('🗑️ Product deleted');
    fetchProducts();          // refresh
  } catch (err) {
    console.error('Delete failed:', err);
    alert('❌ Could not delete product.');
  }
};



  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Product Dashboard</h1>

      <div className="flex gap-4">
  <button
    onClick={handleLogin}
    className="px-4 py-2 border rounded hover:bg-green-100"
  >
    🔐 Quick Login
  </button>
  <button
    onClick={fetchProducts}
    className="px-4 py-2 border rounded hover:bg-blue-100"
  >
    🔄 Refresh Products
  </button>
  <button
    onClick={() => setShowForm(!showForm)}
    className="px-4 py-2 border rounded hover:bg-yellow-100"
  >
    ➕ Add Product
  </button>
</div>


      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Your Products</h2>
        {loading ? (
          <p>Loading...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Price (€)</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Available</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="p-2 border">{product.name}</td>
                  <td className="p-2 border">{product.category}</td>
                  <td className="p-2 border">{product.price}</td>
                  <td className="p-2 border">{product.quantity_available}</td>
                  <td className="p-2 border">
                    {product.is_available ? 'Yes' : 'No'}
                  </td>
                  <td className="p-2 border space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="px-2 py-1 border rounded text-yellow-400 hover:bg-yellow-900"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-2 py-1 border rounded text-red-500 hover:bg-red-900"
                  >
                    🗑️ Delete
                  </button>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {showForm && (
  <div className="mt-6 border border-gray-700 p-4 rounded bg-neutral-900 text-white">
    <h3 className="text-lg font-semibold mb-2">New Product</h3>
    <div className="grid grid-cols-2 gap-4">
      <input
        className="p-2 border rounded"
        placeholder="Name"
        value={newProduct.name}
        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
      />
      <input
        className="p-2 border rounded"
        placeholder="Category"
        value={newProduct.category}
        onChange={(e) =>
          setNewProduct({ ...newProduct, category: e.target.value })
        }
      />
      <input
        className="p-2 border rounded"
        placeholder="Unit"
        value={newProduct.unit}
        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
      />
      <input
        className="p-2 border rounded"
        placeholder="Price (€)"
        type="number"
        value={newProduct.price}
        onChange={(e) =>
          setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
        }
      />
      <input
        className="p-2 border rounded"
        placeholder="Quantity"
        type="number"
        value={newProduct.quantity_available}
        onChange={(e) =>
          setNewProduct({
            ...newProduct,
            quantity_available: parseInt(e.target.value),
          })
        }
      />
      <select
  className="p-2 border rounded"
  value={newProduct.is_available ? 'true' : 'false'}
  onChange={(e) =>
    setNewProduct({
      ...newProduct,
      is_available: e.target.value === 'true', // ✅ always boolean
    })
  }
>
  <option value="true">Available</option>
  <option value="false">Unavailable</option>
</select>
      <textarea
        className="col-span-2 p-2 border rounded"
        placeholder="Description"
        value={newProduct.description}
        onChange={(e) =>
          setNewProduct({ ...newProduct, description: e.target.value })
        }
      />
    </div>
    <button
      onClick={handleSubmitProduct}
      className="mt-4 px-4 py-2 bg-green-200 rounded hover:bg-green-300"
    >
      ✅ Submit Product
    </button>
    <button
  onClick={() => {
    setShowForm(false);
    setNewProduct({
      name: '',
      description: '',
      category: 'Honey',
      price: 0,
      quantity_available: 1,
      unit: 'kg',
      is_available: true,
    });
  }}
  className="mt-4 ml-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
>
  ❌ Cancel
</button>

  </div>
)}

      </div>
    </main>
  );
}
