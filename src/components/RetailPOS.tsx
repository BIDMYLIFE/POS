import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, DollarSign, Package, BarChart3, Search, X } from 'lucide-react';
import axios from 'axios';
export default function RetailPOS() {
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeTab, setActiveTab] = useState('pos');
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [transactions, setTransactions] = useState([]);
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastReceipt, setLastReceipt] = useState(null);
    const barcodeRef = useRef<HTMLInputElement>(null); // hidden input
    const categories = ['All', ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.barcode.includes(searchTerm);
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Focus hidden barcode input on mount
    useEffect(() => {
        barcodeRef.current?.focus();
    }, []);

    // Load products from backend API (uses Vite proxy when running dev)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('/products');
                // backend returns price as number/string depending on serializer
                setProducts(res.data || []);
            } catch (err) {
                console.error('Failed to load products', err);
            }
        };

        fetchProducts();
    }, []);

    // Optional: refocus after each cart action
    useEffect(() => {
        const handleClick = () => barcodeRef.current?.focus();
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // Handle barcode scanning
    const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const barcode = e.currentTarget.value.trim();
            if (!barcode) return;

            const product = products.find(p => p.barcode === barcode);
            if (product) addToCart(product);

            e.currentTarget.value = ''; // clear input after scan
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.quantity < product.stock) {
                setCart(cart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                ));
            }
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (id, change) => {
        const product = products.find(p => p.id === id);
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + change;
                if (newQty <= 0) return null;
                if (newQty > product.stock) return item;
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(Boolean));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal - (subtotal * discount / 100);
    };

    const completeSale = () => {
        if (cart.length === 0) return;

        const transaction = {
            id: Date.now(),
            items: [...cart],
            subtotal: calculateSubtotal(),
            discount: discount,
            total: calculateTotal(),
            paymentMethod: paymentMethod,
            timestamp: new Date().toISOString(),
        };

        const updatedProducts = products.map(product => {
            const cartItem = cart.find(item => item.id === product.id);
            if (cartItem) {
                return { ...product, stock: product.stock - cartItem.quantity };
            }
            return product;
        });

        setProducts(updatedProducts);
        setTransactions([transaction, ...transactions]);
        setLastReceipt(transaction);
        setShowReceipt(true);
        setCart([]);
        setDiscount(0);
    };

    const getTotalSales = () => {
        return transactions.reduce((sum, t) => sum + t.total, 0);
    };

    const getTotalTransactions = () => transactions.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Hidden input for barcode scanning */}
            {/* <input
                type="text"
                ref={barcodeRef}
                onKeyDown={handleBarcodeInput}
                className="absolute opacity-0 pointer-events-none"
                autoFocus
            /> */}
            <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="text-white" size={24} />
                            </div>
                            <h1 className="text-2xl font-bold text-white">RetailPOS</h1>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('pos')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'pos'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                            >
                                <ShoppingCart className="inline mr-2" size={18} />
                                POS
                            </button>
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'products'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                            >
                                <Package className="inline mr-2" size={18} />
                                Products
                            </button>
                            <button
                                onClick={() => setActiveTab('reports')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'reports'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                            >
                                <BarChart3 className="inline mr-2" size={18} />
                                Reports
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {activeTab === 'pos' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                                <div className="mb-4 space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Search products or scan barcode..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const barcode = e.currentTarget.value.trim();
                                                    const product = products.find(p => p.barcode === barcode);
                                                    if (product) {
                                                        addToCart(product);
                                                        setSearchTerm(''); // clear input after scan
                                                    }
                                                }
                                            }}
                                            className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                                    {filteredProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            disabled={product.stock === 0}
                                            className="bg-gradient-to-br from-purple-600/50 to-pink-600/50 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="text-left">
                                                <span className="text-xs text-purple-200 font-medium">{product.category}</span>
                                                <h3 className="font-semibold text-white mb-1 text-sm">{product.name}</h3>
                                                <p className="text-2xl font-bold text-white">${product.price}</p>
                                                <p className="text-sm text-white/70 mt-2">Stock: {product.stock}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 sticky top-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <ShoppingCart size={24} />
                                    Cart
                                </h2>

                                <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                                    {cart.map(item => (
                                        <div key={item.id} className="bg-black/30 p-3 rounded-lg border border-white/10">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium text-white">{item.name}</span>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        className="w-7 h-7 bg-white/10 rounded flex items-center justify-center hover:bg-white/20"
                                                    >
                                                        <Minus size={14} className="text-white" />
                                                    </button>
                                                    <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        className="w-7 h-7 bg-white/10 rounded flex items-center justify-center hover:bg-white/20"
                                                    >
                                                        <Plus size={14} className="text-white" />
                                                    </button>
                                                </div>
                                                <span className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {cart.length === 0 && (
                                        <p className="text-white/50 text-center py-8">Cart is empty</p>
                                    )}
                                </div>

                                <div className="space-y-3 border-t border-white/20 pt-4">
                                    <div className="flex justify-between text-white">
                                        <span>Subtotal:</span>
                                        <span className="font-bold">${calculateSubtotal().toFixed(2)}</span>
                                    </div>

                                    <div className="flex gap-2 items-center">
                                        <label className="text-white text-sm">Discount (%):</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={discount}
                                            onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                                            className="w-20 px-2 py-1 bg-black/30 border border-white/20 rounded text-white text-center"
                                        />
                                    </div>

                                    <div className="flex justify-between text-white text-lg font-bold border-t border-white/20 pt-2">
                                        <span>Total:</span>
                                        <span>${calculateTotal().toFixed(2)}</span>
                                    </div>

                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="mobile">Mobile Payment</option>
                                    </select>

                                    <button
                                        onClick={completeSale}
                                        disabled={cart.length === 0}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <DollarSign size={20} />
                                        Complete Sale
                                    </button>

                                    <button
                                        onClick={() => setCart([])}
                                        className="w-full bg-red-500/20 text-red-300 py-2 rounded-lg font-medium hover:bg-red-500/30 transition-all border border-red-500/30"
                                    >
                                        Clear Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-6">Product Inventory</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/20">
                                        <th className="text-left py-3 px-4 text-white/70 font-medium">ID</th>
                                        <th className="text-left py-3 px-4 text-white/70 font-medium">Category</th>
                                        <th className="text-left py-3 px-4 text-white/70 font-medium">Name</th>
                                        <th className="text-left py-3 px-4 text-white/70 font-medium">Price</th>
                                        <th className="text-left py-3 px-4 text-white/70 font-medium">Cost</th>
                                        <th className="text-left py-3 px-4 text-white/70 font-medium">Stock</th>
                                        <th className="text-left py-3 px-4 text-white/70 font-medium">Barcode</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                                            <td className="py-3 px-4 text-white">{product.id}</td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-sm">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-white font-medium">{product.name}</td>
                                            <td className="py-3 px-4 text-white">${product.price}</td>
                                            <td className="py-3 px-4 text-white">${product.cost}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded ${product.stock < 10 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                                                    }`}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-white/70">{product.barcode}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-blue-600/50 to-blue-800/50 backdrop-blur-md rounded-xl p-6 border border-white/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/70 text-sm">Total Sales</p>
                                        <p className="text-3xl font-bold text-white">${getTotalSales().toFixed(2)}</p>
                                    </div>
                                    <DollarSign className="text-white/50" size={40} />
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-600/50 to-green-800/50 backdrop-blur-md rounded-xl p-6 border border-white/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/70 text-sm">Transactions</p>
                                        <p className="text-3xl font-bold text-white">{getTotalTransactions()}</p>
                                    </div>
                                    <ShoppingCart className="text-white/50" size={40} />
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-600/50 to-purple-800/50 backdrop-blur-md rounded-xl p-6 border border-white/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/70 text-sm">Products</p>
                                        <p className="text-3xl font-bold text-white">{products.length}</p>
                                    </div>
                                    <Package className="text-white/50" size={40} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-6">Recent Transactions</h2>
                            <div className="space-y-3">
                                {transactions.slice(0, 10).map(transaction => (
                                    <div key={transaction.id} className="bg-black/30 p-4 rounded-lg border border-white/10">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-white font-medium">Transaction #{transaction.id}</p>
                                                <p className="text-white/50 text-sm">{new Date(transaction.timestamp).toLocaleString()}</p>
                                            </div>
                                            <p className="text-xl font-bold text-white">${transaction.total.toFixed(2)}</p>
                                        </div>
                                        <div className="flex gap-4 text-sm">
                                            <span className="text-white/70">Items: {transaction.items.length}</span>
                                            <span className="text-white/70">Payment: {transaction.paymentMethod}</span>
                                            {transaction.discount > 0 && (
                                                <span className="text-green-400">Discount: {transaction.discount}%</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {transactions.length === 0 && (
                                    <p className="text-white/50 text-center py-8">No transactions yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showReceipt && lastReceipt && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Receipt</h2>
                            <button onClick={() => setShowReceipt(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="border-b-2 border-dashed pb-4 mb-4">
                            <p className="text-center font-bold text-lg mb-2">RetailPOS Store</p>
                            <p className="text-center text-sm text-gray-600">Transaction #{lastReceipt.id}</p>
                            <p className="text-center text-sm text-gray-600">{new Date(lastReceipt.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="space-y-2 mb-4">
                            {lastReceipt.items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t-2 border-dashed pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>${lastReceipt.subtotal.toFixed(2)}</span>
                            </div>
                            {lastReceipt.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount ({lastReceipt.discount}%):</span>
                                    <span>-${(lastReceipt.subtotal * lastReceipt.discount / 100).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total:</span>
                                <span>${lastReceipt.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Payment Method:</span>
                                <span className="capitalize">{lastReceipt.paymentMethod}</span>
                            </div>
                        </div>
                        <div className="mt-6 text-center text-sm text-gray-500">
                            <p>Thank you for your purchase!</p>
                        </div>
                        <div className="mt-6 flex gap-4">
                            <button
                                onClick={async () => {
                                    if (!lastReceipt) return;
                                    try {
                                        await axios.post('/pos/posSave', lastReceipt);
                                        alert('Receipt saved successfully!');
                                        setShowReceipt(false);
                                    } catch (error) {
                                        console.error(error);
                                        alert('Failed to save receipt.');
                                    }
                                }}
                                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all"
                            >
                                Save
                            </button>
                            <div className="mt-6 flex gap-4">
                                <button
                                    onClick={() => setShowReceipt(false)}
                                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition-all"
                                >
                                    Close
                                </button>
                            </div>

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}