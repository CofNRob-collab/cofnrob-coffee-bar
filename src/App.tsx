import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  onValue, 
  push, 
  update, 
  set, 
  DataSnapshot 
} from 'firebase/database';
import { 
  Coffee, 
  ShoppingBag, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Calendar, 
  Sparkles,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  Lock
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
  databaseURL: "https://your-firebase-db-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- Types ---
export interface MenuItem {
  id: string;
  name: string;
  nameTh: string;
  category: 'coffee' | 'tea' | 'cocoa_milk' | 'extra';
  price: number;
  isCold?: boolean;
  isHidden?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'done' | 'cancelled';
  createdAt: number;
  completedAt?: number;
}

// --- Menu List (Updated names, Thai labels, and prices) ---
const INITIAL_MENU: MenuItem[] = [
  // Cold Coffee (Iced) - Blue Gradient
  { id: '1', name: 'Iced Americano', nameTh: 'อเมริกาโน่เย็น', category: 'coffee', price: 50, isCold: true },
  { id: '2', name: 'Iced Espresso', nameTh: 'เอสเพรสโซเย็น', category: 'coffee', price: 55, isCold: true },
  { id: '3', name: 'Iced Americano Honey', nameTh: 'อเมริกาโน่น้ำผึ้งเย็น', category: 'coffee', price: 60, isCold: true },
  { id: '4', name: 'Iced Americano Orange', nameTh: 'อเมริกาโน่ส้มเย็น', category: 'coffee', price: 60, isCold: true },
  { id: '5', name: 'Iced Americano Honey Orange', nameTh: 'อเมริกาโน่น้ำผึ้งส้มเย็น', category: 'coffee', price: 60, isCold: true },
  { id: '6', name: 'Iced Mocha', nameTh: 'มอคค่าเย็น', category: 'coffee', price: 55, isCold: true },
  { id: '7', name: 'Iced Caramel Macchiato', nameTh: 'คาราเมลมัคคิอาโต้เย็น', category: 'coffee', price: 55, isCold: true },
  { id: '13', name: 'Iced Matcha Coffee', nameTh: 'มัทฉะกาแฟเย็น', category: 'coffee', price: 70, isCold: true },

  // Hot Coffee - Original Amber/Coffee Gradient
  { id: '8', name: 'Hot Cappuccino', nameTh: 'คาปูชิโน่ร้อน', category: 'coffee', price: 45, isCold: false },
  { id: '9', name: 'Hot Caramel Macchiato', nameTh: 'คาราเมลมัคคิอาโต้ร้อน', category: 'coffee', price: 45, isCold: false },
  { id: '10', name: 'Hot Mocha', nameTh: 'มอคค่าร้อน', category: 'coffee', price: 45, isCold: false },
  { id: '11', name: 'Hot Latte', nameTh: 'ลาเต้ร้อน', category: 'coffee', price: 45, isCold: false },
  { id: '12', name: 'Hot Americano Honey', nameTh: 'อเมริกาโน่น้ำผึ้งร้อน', category: 'coffee', price: 45, isCold: false },
  
  // Tea Category (Cold) - Blue Gradient
  { id: '14', name: 'Lemon Tea', nameTh: 'ชามะนาว', category: 'tea', price: 40, isCold: true },
  { id: '15', name: 'Peach Tea', nameTh: 'ชาพีช', category: 'tea', price: 40, isCold: true },
  
  // Cocoa / Extra - Original Colors
  { id: '16', name: 'Cocoa', nameTh: 'โกโก้', category: 'cocoa_milk', price: 50, isCold: true },
  { id: '17', name: 'Extra Shot', nameTh: 'เพิ่มช็อตกาแฟ', category: 'extra', price: 15, isCold: false },
];

// Helper: เลือกโทนสีพื้นหลัง (เมนูเย็น = สีน้ำเงินไล่ทูโทน)
const getItemBackground = (item: MenuItem) => {
  if (item.isCold && item.category !== 'cocoa_milk') {
    // เมนูเย็น (Iced) - สีน้ำเงินไล่ทูโทน
    return 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 border-blue-400/40 text-blue-50';
  }
  if (item.category === 'cocoa_milk') {
    // โกโก้คงสีเดิม
    return 'bg-gradient-to-br from-amber-900 via-amber-950 to-stone-950 border-amber-800/50 text-amber-100';
  }
  if (item.category === 'extra') {
    return 'bg-gradient-to-br from-slate-700 via-zinc-800 to-slate-900 border-slate-600/40 text-slate-100';
  }
  // เมนูร้อนคงสีเดิม
  return 'bg-gradient-to-br from-amber-800 via-amber-900 to-stone-900 border-amber-700/40 text-amber-50';
};

export default function App() {
  // ตรวจสอบว่า URL มี ?barista หรือไม่
  const isBaristaURL = typeof window !== 'undefined' && window.location.search.includes('barista');
  const [activeTab, setActiveTab] = useState<'customer' | 'barista'>(isBaristaURL ? 'barista' : 'customer');
  const [baristaSubTab, setBaristaSubTab] = useState<'orders' | 'history' | 'menu'>('orders');
  
  // States
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Filter Date State for Barista History
  const [historyDateFilter, setHistoryDateFilter] = useState<string>('all');
  const [customDate, setCustomDate] = useState<string>('');

  // Realtime Data from Firebase
  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    const unsubscribeOrders = onValue(ordersRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        const orderList: Order[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setOrders(orderList.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setOrders([]);
      }
    });

    const menuRef = ref(db, 'menu_settings');
    const unsubscribeMenu = onValue(menuRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        setMenuItems(prev => prev.map(item => ({
          ...item,
          isHidden: data[item.id]?.isHidden ?? false
        })));
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeMenu();
    };
  }, []);

  // --- Customer Handlers ---
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }));
  };

  const handlePlaceOrder = () => {
    if (!customerName.trim() || cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder = {
      customerName: customerName.trim(),
      items: cart,
      total,
      status: 'pending' as const,
      createdAt: Date.now()
    };

    push(ref(db, 'orders'), newOrder);
    setCart([]);
    setCustomerName('');
    alert('ส่งออเดอร์เรียบร้อยแล้ว!');
  };

  // --- Barista Handlers ---
  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updates: Record<string, any> = {
      [`orders/${orderId}/status`]: newStatus
    };
    if (newStatus === 'done') {
      updates[`orders/${orderId}/completedAt`] = Date.now();
    }
    update(ref(db), updates);
  };

  const toggleItemVisibility = (itemId: string, currentHidden: boolean) => {
    set(ref(db, `menu_settings/${itemId}/isHidden`), !currentHidden);
  };

  // --- Filtered Data ---
  const visibleCustomerMenu = menuItems.filter(item => !item.isHidden);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const completedOrders = orders.filter(o => o.status === 'done' || o.status === 'cancelled');

  const filteredHistoryOrders = completedOrders.filter(order => {
    if (historyDateFilter === 'all') return true;
    const orderDate = new Date(order.createdAt);
    const today = new Date();

    if (historyDateFilter === 'today') {
      return orderDate.toDateString() === today.toDateString();
    }
    if (historyDateFilter === 'custom' && customDate) {
      const selected = new Date(customDate);
      return orderDate.toDateString() === selected.toDateString();
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
      <div>
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Coffee className="w-7 h-7 text-teal-400" />
              <span className="font-bold text-xl tracking-wider bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">
                Cof N' Rob
              </span>
            </div>

            {/* แสดงปุ่มเปลี่ยนหน้าเฉพาะเมื่ออยู่ในโหมดบาริสต้าเท่านั้น */}
            {activeTab === 'barista' && (
              <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
                <button
                  onClick={() => setActiveTab('customer')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  หน้าลูกค้า
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500 text-black"
                >
                  ระบบบาริสต้า
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-6">
          {activeTab === 'customer' ? (
            /* ================= CUSTOMER VIEW ================= */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Menu List */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="text-amber-400 w-5 h-5" /> เมนูเครื่องดื่ม
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visibleCustomerMenu.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border shadow-md flex flex-col justify-between transition-all hover:scale-[1.02] ${getItemBackground(item)}`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
                            <p className="text-xs opacity-80 mt-0.5">{item.nameTh}</p>
                          </div>
                        </div>
                        <p className="text-2xl font-bold mt-3">{item.price} ฿</p>
                      </div>

                      <button
                        onClick={() => addToCart(item)}
                        className="mt-4 w-full py-2 px-4 rounded-xl bg-teal-400 hover:bg-teal-300 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md shadow-teal-500/10"
                      >
                        <Plus className="w-4 h-4" /> เพิ่มลงตะกร้า
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart & Order Form */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-fit sticky top-20">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ShoppingBag className="text-teal-400 w-5 h-5" /> รายการสั่งซื้อ
                </h2>

                <div className="mb-4">
                  <label className="block text-xs text-slate-400 mb-1">ชื่อลูกค้า</label>
                  <input
                    type="text"
                    placeholder="กรอกชื่อของคุณ"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  />
                </div>

                {cart.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">ยังไม่มีรายการในตะกร้า</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {cart.map((c) => (
                      <div key={c.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm">
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.price} ฿ × {c.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(c.id, -1)} className="p-1 hover:bg-slate-800 rounded">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span>{c.quantity}</span>
                          <button onClick={() => updateQuantity(c.id, 1)} className="p-1 hover:bg-slate-800 rounded">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => removeFromCart(c.id)} className="p-1 text-red-400 hover:bg-slate-800 rounded ml-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-800 mt-4 pt-4">
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span>ราคารวม:</span>
                    <span className="text-teal-400">
                      {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ฿
                    </span>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={!customerName.trim() || cart.length === 0}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-teal-300 text-black font-semibold shadow-lg shadow-teal-500/20 hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    ยืนยันการสั่งซื้อ
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ================= BARISTA VIEW ================= */
            <div className="space-y-6">
              <div className="flex gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setBaristaSubTab('orders')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    baristaSubTab === 'orders' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'text-slate-400'
                  }`}
                >
                  ออเดอร์ปัจจุบัน ({pendingOrders.length})
                </button>
                <button
                  onClick={() => setBaristaSubTab('history')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    baristaSubTab === 'history' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'text-slate-400'
                  }`}
                >
                  ประวัติออเดอร์
                </button>
                <button
                  onClick={() => setBaristaSubTab('menu')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    baristaSubTab === 'menu' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'text-slate-400'
                  }`}
                >
                  จัดการการซ่อนเมนู
                </button>
              </div>

              {baristaSubTab === 'orders' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingOrders.length === 0 ? (
                    <p className="col-span-full text-center text-slate-500 py-12">ไม่มีออเดอร์ค้างอยู่ในระบบ</p>
                  ) : (
                    pendingOrders.map((order) => (
                      <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg">{order.customerName}</h3>
                              <p className="text-xs text-slate-400">
                                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {order.status === 'pending' ? 'รอดำเนินการ' : 'กำลังชง'}
                            </span>
                          </div>

                          <div className="space-y-2 border-y border-slate-800 py-3 my-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{item.name} × {item.quantity}</span>
                                <span className="text-slate-400">{item.price * item.quantity} ฿</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between font-bold text-teal-400 mb-4">
                            <span>รวมทั้งหมด</span>
                            <span>{order.total} ฿</span>
                          </div>

                          <div className="flex gap-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'preparing')}
                                className="flex-1 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/40 rounded-xl text-sm font-semibold"
                              >
                                เริ่มทำ
                              </button>
                            )}
                            <button
                              onClick={() => updateOrderStatus(order.id, 'done')}
                              className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl text-sm font-semibold flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" /> เสร็จสิ้น
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {baristaSubTab === 'history' && (
                <div className="space-y-4">
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-teal-400" />
                      <span className="font-semibold text-sm">กรองประวัติขาย:</span>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <button
                        onClick={() => setHistoryDateFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          historyDateFilter === 'all' ? 'bg-teal-500 text-black font-semibold' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        ทั้งหมด
                      </button>
                      <button
                        onClick={() => setHistoryDateFilter('today')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          historyDateFilter === 'today' ? 'bg-teal-500 text-black font-semibold' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        วันนี้
                      </button>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs text-slate-400">เลือกวันที่:</span>
                        <input
                          type="date"
                          value={customDate}
                          onChange={(e) => {
                            setCustomDate(e.target.value);
                            setHistoryDateFilter('custom');
                          }}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredHistoryOrders.length === 0 ? (
                      <p className="text-center text-slate-500 py-12">ไม่พบประวัติออเดอร์ตามวันที่เลือก</p>
                    ) : (
                      filteredHistoryOrders.map((order) => (
                        <div key={order.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-sm">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base">{order.customerName}</span>
                              <span className="text-xs text-slate-500">
                                {new Date(order.createdAt).toLocaleDateString('th-TH')} - {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                            </p>
                          </div>

                          <div className="text-right flex items-center gap-4">
                            <div>
                              <p className="font-bold text-teal-400">{order.total} ฿</p>
                              <span className="text-xs text-emerald-400">เสร็จสิ้น</span>
                            </div>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'pending')}
                              title="ดึงกลับมารอดำเนินการ"
                              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {baristaSubTab === 'menu' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800">
                    💡 คลิกไอคอนตาเพื่อ <strong className="text-red-400">ซ่อนเมนู</strong> ออกจากหน้าสั่งอาหารของลูกค้า
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {menuItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border flex justify-between items-center ${getItemBackground(item)} ${
                          item.isHidden ? 'opacity-40 grayscale' : ''
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs opacity-80">{item.nameTh} - {item.price} ฿</p>
                        </div>

                        <button
                          onClick={() => toggleItemVisibility(item.id, !!item.isHidden)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.isHidden ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-slate-800/80 text-teal-300'
                          }`}
                        >
                          {item.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

      {/* Footer Discreet Link for Barista */}
      <footer className="py-4 text-center text-xs text-slate-600 border-t border-slate-900">
        <button
          onClick={() => setActiveTab(activeTab === 'customer' ? 'barista' : 'customer')}
          className="hover:text-slate-400 flex items-center gap-1 mx-auto"
        >
          <Lock className="w-3 h-3" /> {activeTab === 'customer' ? 'สำหรับบาริสต้า' : 'สลับไปหน้าลูกค้า'}
        </button>
      </footer>
    </div>
  );
}