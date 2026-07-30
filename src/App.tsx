import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Plus, 
  Minus, 
  Store, 
  User, 
  Check, 
  X
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  thaiName: string;
  price: number;
  category: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'completed';
  createdAt: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Iced Americano', thaiName: 'อเมริกาโน่เย็น', price: 50, category: 'Iced Coffee' },
  { id: '2', name: 'Iced Espresso', thaiName: 'เอสเพรสโซ่เย็น', price: 55, category: 'Iced Coffee' },
  { id: '3', name: 'Iced Americano Honey', thaiName: 'อเมริกาโน่น้ำผึ้งเย็น', price: 60, category: 'Iced Coffee' },
  { id: '4', name: 'Iced Americano Orange', thaiName: 'อเมริกาโน่ส้มเย็น', price: 60, category: 'Iced Coffee' },
  { id: '5', name: 'Iced Americano Honey Orange', thaiName: 'อเมริกาโน่น้ำผึ้งส้ม', price: 60, category: 'Iced Coffee' },
  { id: '6', name: 'Iced Americano Coconut', thaiName: 'อเมริกาโน่มะพร้าวเย็น', price: 60, category: 'Iced Coffee' },
  { id: '7', name: 'Americano Mint', thaiName: 'อเมริกาโน่มิ้นต์', price: 60, category: 'Iced Coffee' },
  { id: '8', name: 'Iced Cappuccino', thaiName: 'คาปูชิโน่เย็น', price: 55, category: 'Iced Coffee' },
  { id: '9', name: 'Iced Latte', thaiName: 'ลาเต้เย็น', price: 55, category: 'Iced Coffee' },
  { id: '10', name: 'Iced Mocha', thaiName: 'มอคค่าเย็น', price: 55, category: 'Iced Coffee' },
];

export function App() {
  const [view, setView] = useState<'customer' | 'barista'>('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false); // ควบคุมการเปิด-ปิดหน้าต่างตะกร้าแบบไอคอน
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cofnrob_orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cofnrob_orders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (!customerName.trim()) {
      alert('กรุณาระบุชื่อผู้สั่งซื้อก่อนครับ');
      return;
    }
    if (cart.length === 0) {
      alert('กรุณาเลือกเครื่องดื่มอย่างน้อย 1 รายการ');
      return;
    }

    const newOrder: Order = {
      id: Date.now().toString().slice(-4),
      customerName: customerName.trim(),
      items: [...cart],
      totalPrice: getTotalPrice(),
      status: 'pending',
      createdAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setCustomerName('');
    setIsCartOpen(false);
    alert('ส่งออเดอร์เรียบร้อยแล้วครับ!');
  };

  const toggleOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: order.status === 'pending' ? 'completed' : 'pending',
          };
        }
        return order;
      })
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const activeOrders = orders.filter((o) => o.status === 'pending');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coffee className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-black tracking-wide bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              Cof N' Rob <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-normal">Coffee Bar</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* ปุ่มไอคอนตะกร้าสินค้า (แสดงเฉพาะหน้าลูกค้า) */}
            {view === 'customer' && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-slate-700 text-amber-400 flex items-center gap-1.5 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalCartItems}
                  </span>
                )}
              </button>
            )}

            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setView('customer')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                  view === 'customer'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                เมนู
              </button>
              <button
                onClick={() => setView('barista')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                  view === 'barista'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Store className="w-4 h-4" />
                Barista
                {activeOrders.length > 0 && (
                  <span className="bg-rose-500 text-white text-xs px-1.5 py-0.2 rounded-full font-bold">
                    {activeOrders.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {view === 'customer' ? (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 mb-4">
                <Coffee className="w-5 h-5" /> Iced Coffee (กาแฟเย็น)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MENU_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all group"
                  >
                    <div>
                      <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400">{item.thaiName}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-extrabold text-amber-400">฿{item.price}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-amber-400 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> เพิ่ม
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal / Popup ตะกร้าสินค้า เมื่อคลิกไอคอนตะกร้า */}
            {isCartOpen && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-amber-400" /> ตะกร้าสินค้าของคุณ
                    </h2>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* ช่องกรอกชื่อย้ายมาอยู่ด้านบนสุดในตะกร้า */}
                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-xs font-semibold text-slate-300">
                      ชื่อผู้สั่งซื้อ / Customer Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ใส่ชื่อของคุณที่นี่..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">ยังไม่มีรายการในตะกร้า</p>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-4 overflow-y-auto pr-1 flex-1">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800"
                        >
                          <div className="flex-1 pr-2">
                            <p className="text-sm font-semibold text-slate-200">{item.name}</p>
                            <p className="text-xs text-amber-400 font-bold">฿{item.price * item.quantity}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center bg-slate-900 border border-slate-800 rounded">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-1 hover:text-amber-400 text-slate-400"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold px-2">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-1 hover:text-amber-400 text-slate-400"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-slate-800 pt-4 mt-auto space-y-3">
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-slate-400">ราคารวมทั้งหมด:</span>
                      <span className="text-amber-400 text-xl">฿{getTotalPrice()}</span>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400 py-2.5 rounded-lg font-bold text-center transition-colors"
                    >
                      ยืนยันสั่งซื้อ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Barista View */
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" /> ออเดอร์ที่กำลังรอดำเนินการ ({activeOrders.length})
              </h2>

              {activeOrders.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">ไม่มีออเดอร์ค้างในขณะนี้</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        <div className="flex justify-between items-start border-b border-slate-800 pb-2 mb-3">
                          <div>
                            <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">
                              #{order.id}
                            </span>
                            <h3 className="font-bold text-white text-base mt-1">{order.customerName}</h3>
                          </div>
                          <span className="text-xs text-slate-400">{order.createdAt}</span>
                        </div>

                        <div className="space-y-1.5 mb-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-slate-300">
                                {item.name} <span className="text-amber-400 font-bold">x{item.quantity}</span>
                              </span>
                              <span className="text-slate-500">฿{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-800 pt-3">
                        <div className="flex justify-between text-sm font-bold mb-3">
                          <span className="text-slate-400">รวมทั้งสิ้น:</span>
                          <span className="text-amber-400">฿{order.totalPrice}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleOrderStatus(order.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <Check className="w-4 h-4" /> ทำเสร็จแล้ว
                          </button>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {completedOrders.length > 0 && (
              <div className="pt-6 border-t border-slate-800">
                <h2 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> ประวัติออเดอร์ที่เสร็จแล้ว ({completedOrders.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {completedOrders.map((order) => (
                    <div key={order.id} className="bg-slate-900/50 border border-slate-800/60 rounded-lg p-3 text-xs opacity-75">
                      <div className="flex justify-between font-bold text-slate-300 mb-1">
                        <span>#{order.id} - {order.customerName}</span>
                        <span className="text-emerald-400">฿{order.totalPrice}</span>
                      </div>
                      <p className="text-slate-500 truncate mb-2">
                        {order.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                      </p>
                      <button
                        onClick={() => toggleOrderStatus(order.id)}
                        className="text-slate-400 hover:text-amber-400 underline text-[10px]"
                      >
                        ย้ายกลับไปกำลังทำ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;