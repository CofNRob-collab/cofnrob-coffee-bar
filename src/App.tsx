import { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  onValue,
} from 'firebase/database';
import {
  Coffee,
  Snowflake,
  Flame,
  Leaf,
  Send,
  Clock,
  CheckCircle2,
  Settings2,
  Plus,
  Minus,
  X,
  Radio,
  ToggleRight,
  Zap,
  ListChecks,
  Volume2,
  VolumeX,
  Pencil,
  Save,
  Tag,
  User,
  ShoppingBag,
  Trash2,
  Calendar,
  XCircle,
  EyeOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  FIREBASE INITIALIZATION                                           */
/* ------------------------------------------------------------------ */

const firebaseConfig = {
  apiKey: 'AIzaSyBUNGi_itL7fpOW4r71vfpec8Gj2L3QzNg',
  authDomain: 'cofnrob.firebaseapp.com',
  databaseURL:
    'https://cofnrob-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'cofnrob',
  storageBucket: 'cofnrob.firebasestorage.app',
  messagingSenderId: '573015850115',
  appId: '1:573015850115:web:169caa653cfd257a686fb6',
  measurementId: 'G-G38R9R3MHC',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ------------------------------------------------------------------ */
/*  TYPES & INTERFACES                                                */
/* ------------------------------------------------------------------ */

type ThemeType = 'blue' | 'brown' | 'teal' | 'gray' | 'green';
type CategoryType = 'ICED COFFEE' | 'HOT COFFEE' | 'MATCHA & TEA' | 'OTHERS';
type OrderStatus = 'pending' | 'cancelled' | 'done';

interface MenuItem {
  id: string;
  name: string;
  nameTh: string;
  category: CategoryType;
  theme: ThemeType;
  price: number;
  available: boolean;
}

interface CartItem {
  cartId: string;
  itemId: string;
  name: string;
  nameTh: string;
  theme: ThemeType;
  sweetness: number;
  qty: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  customerName: string;
  items: CartItem[];
  total: number;
  createdAt: number;
  status: OrderStatus;
}

interface CategoryMetaItem {
  icon: LucideIcon;
  label: string;
  labelTh: string;
  theme: ThemeType;
}

/* ------------------------------------------------------------------ */
/*  MENU DATA                                                         */
/* ------------------------------------------------------------------ */

const INITIAL_MENU_ITEMS: Omit<MenuItem, 'available'>[] = [
  {
    id: 'ic01',
    name: 'Ice Americano',
    nameTh: 'อเมริกาโน่เย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 50,
  },
  {
    id: 'ic02',
    name: 'Ice Espresso',
    nameTh: 'เอสเพรสโซ่เย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 55,
  },
  {
    id: 'ic03',
    name: 'Ice Americano Honey',
    nameTh: 'อเมริกาโน่น้ำผึ้งเย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 60,
  },
  {
    id: 'ic04',
    name: 'Ice Americano Orange',
    nameTh: 'อเมริกาโน่ส้มเย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 60,
  },
  {
    id: 'ic05',
    name: 'Iced Americano Coconut',
    nameTh: 'อเมริกาโน่มะพร้าวเย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 60,
  },
  {
    id: 'ic06',
    name: 'Ice Americano Honey Orange',
    nameTh: 'อเมริกาโน่น้ำผึ้งส้ม',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 60,
  },
  {
    id: 'ic07',
    name: 'Americano Mint',
    nameTh: 'อเมริกาโน่มินต์',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 55,
  },
  {
    id: 'ic08',
    name: 'Ice Cappucino',
    nameTh: 'คาปูชิโน่เย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 55,
  },
  {
    id: 'ic09',
    name: 'Ice Mocha',
    nameTh: 'มอคค่าเย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 55,
  },
  {
    id: 'ic10',
    name: 'Ice Latte',
    nameTh: 'ลาเต้เย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 55,
  },
  {
    id: 'ic11',
    name: 'Latte Coconut',
    nameTh: 'ลาเต้มะพร้าว',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 65,
  },
  {
    id: 'ic12',
    name: 'Ice Caramel Macchiato',
    nameTh: 'คาราเมลมัคคิอาโต้เย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 55,
  },

  {
    id: 'hc01',
    name: 'Hot Americano',
    nameTh: 'อเมริกาโน่ร้อน',
    category: 'HOT COFFEE',
    theme: 'brown',
    price: 40,
  },
  {
    id: 'hc02',
    name: 'Hot Espresso',
    nameTh: 'เอสเพรสโซ่ร้อน',
    category: 'HOT COFFEE',
    theme: 'brown',
    price: 40,
  },
  {
    id: 'hc03',
    name: 'Hot Cappucino',
    nameTh: 'คาปูชิโน่ร้อน',
    category: 'HOT COFFEE',
    theme: 'brown',
    price: 45,
  },
  {
    id: 'hc04',
    name: 'Hot Caramel Macchiato',
    nameTh: 'คาราเมลมัคคิอาโต้ร้อน',
    category: 'HOT COFFEE',
    theme: 'brown',
    price: 45,
  },
  {
    id: 'hc05',
    name: 'Hot Mocha',
    nameTh: 'มอคค่าร้อน',
    category: 'HOT COFFEE',
    theme: 'brown',
    price: 45,
  },
  {
    id: 'hc06',
    name: 'Hot Latte',
    nameTh: 'ลาเต้ร้อน',
    category: 'HOT COFFEE',
    theme: 'brown',
    price: 45,
  },
  {
    id: 'hc07',
    name: 'Hot Americano Honey',
    nameTh: 'อเมริกาโน่น้ำผึ้งร้อน',
    category: 'HOT COFFEE',
    theme: 'brown',
    price: 45,
  },

  {
    id: 'mt01',
    name: 'Iced Matcha Latte',
    nameTh: 'มัทฉะลาเต้เย็น',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 65,
  },
  {
    id: 'mt02',
    name: 'Ice Matcha Coffee',
    nameTh: 'มัทฉะกาแฟ',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 70,
  },
  {
    id: 'mt03',
    name: 'Iced Matcha',
    nameTh: 'มัทฉะเย็น',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 60,
  },
  {
    id: 'mt04',
    name: 'Iced Matcha Orange',
    nameTh: 'มัทฉะส้ม',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 65,
  },
  {
    id: 'mt05',
    name: 'Lemon Tea',
    nameTh: 'ชามะนาว',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 40,
  },
  {
    id: 'mt06',
    name: 'Peach tea',
    nameTh: 'ชาพีช',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 40,
  },
  {
    id: 'co01',
    name: 'Cocoa',
    nameTh: 'โกโก้',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 50,
  },

  {
    id: 'co02',
    name: 'Extra shot',
    nameTh: 'เพิ่มช็อต',
    category: 'OTHERS',
    theme: 'gray',
    price: 15,
  },
];

const CATEGORY_ORDER: CategoryType[] = [
  'ICED COFFEE',
  'HOT COFFEE',
  'MATCHA & TEA',
  'OTHERS',
];

const CATEGORY_META: Record<CategoryType, CategoryMetaItem> = {
  'ICED COFFEE': {
    icon: Snowflake,
    label: 'Iced Coffee',
    labelTh: 'กาแฟเย็น',
    theme: 'blue',
  },
  'HOT COFFEE': {
    icon: Flame,
    label: 'Hot Coffee',
    labelTh: 'กาแฟร้อน',
    theme: 'brown',
  },
  'MATCHA & TEA': {
    icon: Leaf,
    label: 'Matcha & Tea',
    labelTh: 'มัทฉะ & ชา',
    theme: 'green',
  },
  OTHERS: { icon: Coffee, label: 'Others', labelTh: 'อื่นๆ', theme: 'gray' },
};

const BUTTON_THEME: Record<
  ThemeType,
  { grad: string; text: string; price: string; sub: string }
> = {
  blue: {
    grad: 'bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 border-sky-400/50 hover:from-blue-500 hover:to-cyan-400 shadow-[0_4px_20px_rgba(14,165,233,0.3)]',
    text: 'text-white font-extrabold',
    price: 'text-sky-100 font-black',
    sub: 'text-sky-100/90 font-medium',
  },
  brown: {
    grad: 'bg-gradient-to-r from-[#4A2810] via-[#6F3C17] to-[#8C4A1B] border-amber-600/50 hover:from-[#5A3114] hover:to-[#9C5320] shadow-[0_4px_20px_rgba(140,74,27,0.3)]',
    text: 'text-amber-50 font-extrabold',
    price: 'text-amber-200 font-black',
    sub: 'text-amber-100/90 font-medium',
  },
  teal: {
    grad: 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-500 border-teal-400/50 hover:from-teal-600 hover:to-emerald-400 shadow-[0_4px_20px_rgba(20,184,166,0.3)]',
    text: 'text-white font-extrabold',
    price: 'text-teal-100 font-black',
    sub: 'text-teal-100/90 font-medium',
  },
  green: {
    grad: 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-600 border-emerald-500/50 hover:from-emerald-700 hover:to-green-500 shadow-[0_4px_20px_rgba(16,185,129,0.3)]',
    text: 'text-white font-extrabold',
    price: 'text-emerald-100 font-black',
    sub: 'text-emerald-100/90 font-medium',
  },
  gray: {
    grad: 'bg-gradient-to-r from-stone-700 via-neutral-700 to-zinc-600 border-stone-500/50 hover:from-stone-600 hover:to-zinc-500 shadow-[0_4px_20px_rgba(113,113,122,0.3)]',
    text: 'text-neutral-100 font-extrabold',
    price: 'text-amber-300 font-black',
    sub: 'text-neutral-300 font-medium',
  },
};

const SWEET_PRESETS = [
  { value: 0, label: '0%', labelTh: 'ไม่หวาน' },
  { value: 25, label: '25%', labelTh: 'หวานน้อย' },
  { value: 50, label: '50%', labelTh: 'หวานปานกลาง' },
  { value: 75, label: '75%', labelTh: 'หวานน้อยกว่าปกติ' },
  { value: 100, label: '100%', labelTh: 'หวานปกติ' },
  { value: 120, label: '120%', labelTh: 'หวานมาก' },
];

function sweetnessColor(v: number): string {
  if (v <= 25) return 'text-sky-300';
  if (v <= 50) return 'text-emerald-300';
  if (v <= 100) return 'text-amber-300';
  return 'text-rose-300';
}

function timeAgo(ts: number, now: number): string {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function fmtClock(d: Date): string {
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getViewFromURL(): 'barista' | 'customer' {
  if (typeof window === 'undefined') return 'customer';
  const params = new URLSearchParams(window.location.search);
  const raw = (params.get('view') || params.get('mode') || '')
    .trim()
    .toLowerCase();
  return raw === 'barista' ? 'barista' : 'customer';
}

function useOrderSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  function getCtx(): AudioContext | null {
    if (!enabled) return null;
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }

  function tone(
    freq: number,
    start: number,
    dur: number,
    type: OscillatorType = 'sine',
    gain = 0.5
  ) {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(ctx.destination);
    const t0 = ctx.currentTime + start;
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  return {
    playSent: () => {
      tone(660, 0, 0.1, 'sine', 0.4);
      tone(880, 0.1, 0.15, 'sine', 0.4);
    },
    playIncoming: () => {
      tone(880, 0, 0.2, 'square', 1.5);
      tone(1174.66, 0.2, 0.2, 'square', 1.5);
      tone(1318.51, 0.4, 0.3, 'square', 1.5);
      tone(1760, 0.7, 0.4, 'square', 1.8);
    },
    playDone: () => {
      tone(660, 0, 0.09, 'sine', 0.4);
      tone(880, 0.1, 0.09, 'sine', 0.4);
      tone(1100, 0.2, 0.15, 'sine', 0.5);
    },
  };
}

export default function App() {
  const [view, setView] = useState<'customer' | 'barista'>(getViewFromURL);
  const [menu, setMenu] = useState<MenuItem[]>(
    INITIAL_MENU_ITEMS.map((m) => ({ ...m, available: true }))
  );
  const [customerName, setCustomerName] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [sweetness, setSweetness] = useState<number>(100);
  const [qty, setQty] = useState<number>(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [baristaTab, setBaristaTab] = useState<'orders' | 'stock' | 'editor'>(
    'orders'
  );
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [shopOpen, setShopOpen] = useState<boolean>(true);
  const [shopMessage, setShopMessage] = useState<string>(
    'ร้านปิดให้บริการชั่วคราว'
  );
  const sound = useOrderSound(soundOn);

  useEffect(() => {
    const stockRef = ref(db, 'menuStock');
    const unsubscribeStock = onValue(stockRef, (snapshot) => {
      const stockData = snapshot.val();
      if (stockData) {
        setMenu((prev) =>
          prev.map((m) => ({
            ...m,
            available: stockData[m.id] !== undefined ? stockData[m.id] : true,
          }))
        );
      }
    });

    const shopRef = ref(db, 'shopOpen');
    const unsubscribeShop = onValue(shopRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) setShopOpen(val);
    });

    const msgRef = ref(db, 'shopMessage');
    const unsubscribeMsg = onValue(msgRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null) setShopMessage(val);
    });

    return () => {
      unsubscribeStock();
      unsubscribeShop();
      unsubscribeMsg();
    };
  }, []);

  function toggleShopStatus() {
    const newStatus = !shopOpen;
    setShopOpen(newStatus);
    set(ref(db, 'shopOpen'), newStatus);
    setToast(
      newStatus ? 'เปิดร้านแล้ว (Shop is Open)' : 'ปิดร้านแล้ว (Shop is Closed)'
    );
  }

  function updateShopMessage(newMsg: string) {
    setShopMessage(newMsg);
    set(ref(db, 'shopMessage'), newMsg);
    setToast('บันทึกข้อความแจ้งหน้าร้านเรียบร้อย');
  }

  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedOrders: Order[] = Object.keys(data).map((key) => {
          const itemData = data[key];
          let items: CartItem[] = [];
          if (Array.isArray(itemData.items)) {
            items = itemData.items;
          } else if (itemData.name) {
            items = [
              {
                cartId: key,
                itemId: itemData.itemId || key,
                name: itemData.name,
                nameTh: itemData.nameTh || itemData.name,
                theme: itemData.theme || 'blue',
                sweetness: itemData.sweetness ?? 100,
                qty: itemData.qty || 1,
                unitPrice: itemData.unitPrice || itemData.total || 0,
                total: itemData.total || 0,
              },
            ];
          }

          return {
            id: key,
            customerName: itemData.customerName || 'Guest',
            items,
            total: itemData.total || items.reduce((s, i) => s + i.total, 0),
            createdAt: itemData.createdAt || Date.now(),
            status: itemData.status || 'pending',
          };
        });

        parsedOrders.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(parsedOrders);
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function onNav() {
      setView(getViewFromURL());
    }
    window.addEventListener('popstate', onNav);
    return () => window.removeEventListener('popstate', onNav);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  function openModal(item: MenuItem) {
    if (!shopOpen) {
      setToast('ร้านปิดอยู่ ไม่สามารถเลือกสินค้าได้');
      return;
    }
    if (!item.available) return;
    setModalItem(item);
    setSweetness(100);
    setQty(1);
  }

  function closeModal() {
    setModalItem(null);
  }

  function addToCart() {
    if (!shopOpen) {
      setToast('ร้านปิดอยู่ ไม่สามารถสั่งสินค้าได้');
      return;
    }
    if (!modalItem) return;
    const newCartItem: CartItem = {
      cartId: `${modalItem.id}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 4)}`,
      itemId: modalItem.id,
      name: modalItem.name,
      nameTh: modalItem.nameTh,
      theme: modalItem.theme,
      sweetness,
      qty,
      unitPrice: modalItem.price,
      total: modalItem.price * qty,
    };

    setCart((prev) => [...prev, newCartItem]);
    setToast(`เพิ่ม ${modalItem.name} ลงในตะกร้าแล้ว`);
    setModalItem(null);
  }

  function removeFromCart(cartId: string) {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  }

  function updateCartQty(cartId: string, delta: number) {
    setCart(
      (prev) =>
        prev
          .map((item) => {
            if (item.cartId === cartId) {
              const newQty = item.qty + delta;
              if (newQty <= 0) return null;
              return {
                ...item,
                qty: newQty,
                total: item.unitPrice * newQty,
              };
            }
            return item;
          })
          .filter(Boolean) as CartItem[]
    );
  }

  function submitCartOrder() {
    if (!shopOpen) {
      setToast('ร้านปิดอยู่ ไม่สามารถส่งออเดอร์ได้');
      return;
    }
    if (cart.length === 0) return;
    const name = customerName.trim() || 'Guest';
    const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

    const newOrderData = {
      customerName: name,
      items: cart,
      total: totalAmount,
      createdAt: Date.now(),
      status: 'pending',
    };

    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);
    set(newOrderRef, newOrderData);

    setToast(`ส่งออเดอร์เรียบร้อยแล้วสำหรับคุณ ${name}`);
    setCart([]);
    sound.playSent();
  }

  function advanceOrder(id: string, status: OrderStatus) {
    const orderRef = ref(db, `orders/${id}`);
    update(orderRef, { status });
    if (status === 'done') sound.playDone();
  }

  function toggleStock(id: string) {
    const item = menu.find((m) => m.id === id);
    if (!item) return;
    const nextStatus = !item.available;
    set(ref(db, `menuStock/${id}`), nextStatus);
  }

  function updateMenuItem(id: string, updates: Partial<MenuItem>) {
    setMenu((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    if (updates.available !== undefined) {
      set(ref(db, `menuStock/${id}`), updates.available);
    }
    setEditingItem(null);
    setToast(`อัปเดตเมนู ${updates.name || ''} เรียบร้อย`);
  }

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status === 'pending'),
    [orders]
  );

  return (
    <div className="min-h-screen w-full bg-[#05070A] text-neutral-100 font-sans">
      {view === 'customer' ? (
        <CustomerView
          menu={menu}
          customerName={customerName}
          setCustomerName={setCustomerName}
          openModal={openModal}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
          cart={cart}
          removeFromCart={removeFromCart}
          updateCartQty={updateCartQty}
          submitCartOrder={submitCartOrder}
          shopOpen={shopOpen}
          shopMessage={shopMessage}
        />
      ) : (
        <BaristaView
          menu={menu}
          toggleStock={toggleStock}
          baristaTab={baristaTab}
          setBaristaTab={setBaristaTab}
          activeOrders={activeOrders}
          allOrders={orders}
          advanceOrder={advanceOrder}
          now={now}
          sound={sound}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          updateMenuItem={updateMenuItem}
          shopOpen={shopOpen}
          toggleShopStatus={toggleShopStatus}
          shopMessage={shopMessage}
          updateShopMessage={updateShopMessage}
        />
      )}

      {modalItem && shopOpen && (
        <CustomizeModal
          item={modalItem}
          sweetness={sweetness}
          setSweetness={setSweetness}
          qty={qty}
          setQty={setQty}
          onClose={closeModal}
          onAddToCart={addToCart}
        />
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] px-4 py-3 rounded-2xl bg-[#0D1117] border border-emerald-400/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

interface CustomerViewProps {
  menu: MenuItem[];
  customerName: string;
  setCustomerName: (name: string) => void;
  openModal: (item: MenuItem) => void;
  soundOn: boolean;
  setSoundOn: (val: boolean) => void;
  cart: CartItem[];
  removeFromCart: (cartId: string) => void;
  updateCartQty: (cartId: string, delta: number) => void;
  submitCartOrder: () => void;
  shopOpen: boolean;
  shopMessage: string;
}

function CustomerView({
  menu,
  customerName,
  setCustomerName,
  openModal,
  soundOn,
  setSoundOn,
  cart,
  removeFromCart,
  updateCartQty,
  submitCartOrder,
  shopOpen,
  shopMessage,
}: CustomerViewProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const totalCartItems = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-28">
      <div className="pb-6 mb-6 border-b border-white/15">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white">
              Cof N&apos; Rob <span className="text-amber-400">Coffee Bar</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              เลือกสั่งเมนูเครื่องดื่มที่คุณชื่นชอบ
            </p>
            <div className="mt-3 max-w-xs">
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400"
                />
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ระบุชื่อสำหรับเรียกคิว..."
                  maxLength={40}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-white placeholder:text-neutral-500 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 transition-colors flex items-center gap-2"
            >
              <ShoppingBag size={20} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-black text-xs font-mono font-black flex items-center justify-center shadow">
                  {totalCartItems}
                </span>
              )}
              <span className="hidden sm:inline text-xs font-bold font-mono">
                ฿{cartTotal}
              </span>
            </button>

            <button
              onClick={() => setSoundOn(!soundOn)}
              title={soundOn ? 'ปิดเสียง' : 'เปิดเสียง'}
              className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-neutral-300 hover:text-white transition-colors"
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>
      </div>

      {!shopOpen && (
        <div className="mb-8 p-6 rounded-3xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-[0_0_40px_rgba(244,63,94,0.2)]">
          <div className="p-4 rounded-2xl bg-rose-500/20 text-rose-400 shrink-0">
            <XCircle size={36} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide">
              วันนี้ร้านปิดให้บริการ (Shop is Closed)
            </h2>
            <p className="text-sm text-rose-300 mt-1 font-medium whitespace-pre-wrap">
              {shopMessage}
            </p>
          </div>
        </div>
      )}

      <div
        className={`space-y-8 ${
          !shopOpen ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        {CATEGORY_ORDER.map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          const visibleItems = menu.filter(
            (m) => m.category === cat && m.available
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-emerald-400">
                  <Icon size={16} />
                </span>
                <h2 className="text-base font-bold text-white tracking-wide">
                  {meta.label}
                </h2>
                <span className="text-xs text-neutral-400">
                  ({meta.labelTh})
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {visibleItems.map((item) => (
                  <MenuButton
                    key={item.id}
                    item={item}
                    onClick={() => openModal(item)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full sm:max-w-md bg-[#0D1117] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag size={20} className="text-amber-400" />
                รายการที่สั่งไว้ (Cart)
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400"
              >
                <X size={16} />
              </button>
            </div>

            {!shopOpen && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-semibold text-center">
                ร้านปิดอยู่ ไม่สามารถส่งออเดอร์ได้ในขณะนี้
              </div>
            )}

            {cart.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-neutral-500 my-2">
                <ShoppingBag size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">ยังไม่มีรายการในตะกร้า</p>
                <p className="text-xs text-neutral-600 mt-1">
                  เลือกเครื่องดื่มจากเมนูด้านหลัง
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 mb-4">
                {cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-neutral-400">
                          หวาน {item.sweetness}%
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          ฿{item.unitPrice}/แก้ว
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white/[0.06] rounded-lg px-1.5 py-0.5">
                        <button
                          onClick={() => updateCartQty(item.cartId, -1)}
                          className="p-1 text-neutral-400 hover:text-white"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-mono font-bold w-4 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.cartId, 1)}
                          className="p-1 text-neutral-400 hover:text-white"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-sm font-mono font-extrabold text-amber-400 min-w-[45px] text-right">
                        ฿{item.total}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="p-1 text-neutral-500 hover:text-rose-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="pt-4 border-t border-white/10 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-neutral-400">
                    ราคารวมทั้งหมด
                  </span>
                  <span className="text-2xl font-mono font-black text-amber-400">
                    ฿{cartTotal}
                  </span>
                </div>

                <button
                  disabled={!shopOpen}
                  onClick={() => {
                    submitCartOrder();
                    setIsCartOpen(false);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-base transition-transform shadow-lg ${
                    shopOpen
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black active:scale-[0.98] shadow-[0_0_25px_-5px_rgba(245,158,11,0.6)]'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <Send size={18} />{' '}
                  {shopOpen
                    ? 'ส่งออเดอร์ · Send Order'
                    : 'ร้านปิดอยู่ (Closed)'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuButton({
  item,
  onClick,
}: {
  item: MenuItem;
  onClick: () => void;
}) {
  const bt = BUTTON_THEME[item.theme];

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl p-3.5 border ${bt.grad} active:scale-[0.97] transition-all min-h-[96px] flex flex-col justify-between`}
    >
      <div>
        <p className={`text-base sm:text-lg leading-tight ${bt.text}`}>
          {item.name}
        </p>
        <p className={`text-xs mt-0.5 ${bt.sub}`}>{item.nameTh}</p>
      </div>
      <p className={`text-sm mt-2 font-mono ${bt.price}`}>฿{item.price}</p>
    </button>
  );
}

interface CustomizeModalProps {
  item: MenuItem;
  sweetness: number;
  setSweetness: (val: number) => void;
  qty: number;
  setQty: (val: number) => void;
  onClose: () => void;
  onAddToCart: () => void;
}

function CustomizeModal({
  item,
  sweetness,
  setSweetness,
  qty,
  setQty,
  onClose,
  onAddToCart,
}: CustomizeModalProps) {
  const total = item.price * qty;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-sm bg-[#0D1117] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto shadow-[0_0_60px_-10px_rgba(0,0,0,0.9)]">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-lg font-bold text-white">{item.name}</h3>
            <p className="text-xs text-neutral-400">{item.nameTh}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400"
          >
            <X size={16} />
          </button>
        </div>
        <span className="inline-block mt-2 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300">
          ฿{item.price} / แก้ว
        </span>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-300">
              ระดับความหวาน · Sweetness
            </span>
            <span
              className={`font-mono font-bold text-lg ${sweetnessColor(
                sweetness
              )}`}
            >
              {sweetness}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={120}
            step={5}
            value={sweetness}
            onChange={(e) => setSweetness(Number(e.target.value))}
            className="w-full accent-amber-400 h-2 bg-white/10 rounded-lg cursor-pointer"
          />
          <div className="flex flex-wrap gap-1.5 mt-3">
            {SWEET_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setSweetness(p.value)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition-colors ${
                  sweetness === p.value
                    ? 'bg-amber-400 border-amber-400 text-black font-bold'
                    : 'bg-white/[0.03] border-white/10 text-neutral-300 hover:border-white/30'
                }`}
              >
                {p.label} <span className="opacity-70">{p.labelTh}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-300">
            จำนวน · Quantity
          </span>
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-2 py-1">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="p-1 text-neutral-300 hover:text-white"
            >
              <Minus size={14} />
            </button>
            <span className="w-5 text-center font-mono text-sm font-bold">
              {qty}
            </span>
            <button
              onClick={() => setQty(Math.min(20, qty + 1))}
              className="p-1 text-neutral-300 hover:text-white"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-neutral-400">ราคารวม</span>
          <span className="font-mono font-black text-xl text-amber-400">
            ฿{total}
          </span>
        </div>
        <button
          onClick={onAddToCart}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-sm active:scale-[0.98] transition-transform shadow-[0_0_25px_-5px_rgba(245,158,11,0.6)]"
        >
          <Plus size={18} /> เพิ่มลงตะกร้า
        </button>
      </div>
    </div>
  );
}

interface BaristaViewProps {
  menu: MenuItem[];
  toggleStock: (id: string) => void;
  baristaTab: 'orders' | 'stock' | 'editor';
  setBaristaTab: (tab: 'orders' | 'stock' | 'editor') => void;
  activeOrders: Order[];
  allOrders: Order[];
  advanceOrder: (id: string, status: OrderStatus) => void;
  now: number;
  sound: ReturnType<typeof useOrderSound>;
  soundOn: boolean;
  setSoundOn: (val: boolean) => void;
  editingItem: MenuItem | null;
  setEditingItem: (item: MenuItem | null) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  shopOpen: boolean;
  toggleShopStatus: () => void;
  shopMessage: string;
  updateShopMessage: (msg: string) => void;
}

function BaristaView({
  menu,
  toggleStock,
  baristaTab,
  setBaristaTab,
  activeOrders,
  allOrders,
  advanceOrder,
  now,
  sound,
  soundOn,
  setSoundOn,
  editingItem,
  setEditingItem,
  updateMenuItem,
  shopOpen,
  toggleShopStatus,
  shopMessage,
  updateShopMessage,
}: BaristaViewProps) {
  const [clock, setClock] = useState<Date>(new Date());
  const [historyFilter, setHistoryFilter] = useState<
    'today' | '3days' | '7days' | 'all'
  >('today');
  const [tempMsg, setTempMsg] = useState<string>(shopMessage);

  useEffect(() => {
    setTempMsg(shopMessage);
  }, [shopMessage]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef<boolean>(false);

  useEffect(() => {
    const pendingIds = activeOrders.map((o) => o.id);
    const hasNew = pendingIds.some((id) => !seenIds.current.has(id));
    if (hasNew && initialized.current) sound?.playIncoming();
    pendingIds.forEach((id) => seenIds.current.add(id));
    initialized.current = true;
  }, [activeOrders, sound]);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-16">
      <div className="pt-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Coffee size={22} className="text-teal-400" /> Cof N&apos; Rob —
            Barista Display Dashboard
          </h1>
          <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
            <Radio size={12} className="text-emerald-400 animate-pulse" /> Live
            feed synced with customer terminals
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={toggleShopStatus}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold border transition-all ${
              shopOpen
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-rose-500/20 border-rose-400/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                shopOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
              }`}
            />
            {shopOpen ? 'เปิดร้านอยู่ (Open)' : 'ปิดร้านแล้ว (Closed)'}
          </button>

          <span className="font-mono text-neutral-300 flex items-center gap-1.5 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/10">
            <Clock size={14} /> {fmtClock(clock)}
          </span>
          <button
            onClick={() => setSoundOn(!soundOn)}
            title={soundOn ? 'ปิดเสียง' : 'เปิดเสียง'}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white"
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
            ข้อความแจ้งหน้าร้านเมื่อปิด (เช่น ปิด 3 วัน, ปิดให้บริการชั่วคราว
            ฯลฯ)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tempMsg}
              onChange={(e) => setTempMsg(e.target.value)}
              placeholder="ระบุรายละเอียดการปิดร้าน..."
              className="flex-1 rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button
              onClick={() => updateShopMessage(tempMsg)}
              className="px-4 py-2 rounded-xl bg-teal-500 text-black text-xs font-bold hover:bg-teal-400 transition-colors shrink-0"
            >
              บันทึกข้อความ
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 mt-5 rounded-xl bg-white/[0.04] border border-white/10 w-fit">
        <button
          onClick={() => setBaristaTab('orders')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            baristaTab === 'orders'
              ? 'bg-teal-400 text-black'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ListChecks size={15} /> Live Orders & History
        </button>
        <button
          onClick={() => setBaristaTab('stock')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            baristaTab === 'stock'
              ? 'bg-teal-400 text-black'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Settings2 size={15} /> Hide / Show Menu
        </button>
        <button
          onClick={() => setBaristaTab('editor')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            baristaTab === 'editor'
              ? 'bg-teal-400 text-black'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Pencil size={15} /> Edit Menu & Prices
        </button>
      </div>

      {baristaTab === 'orders' && (
        <OrdersFeed
          activeOrders={activeOrders}
          allOrders={allOrders}
          advanceOrder={advanceOrder}
          now={now}
          historyFilter={historyFilter}
          setHistoryFilter={setHistoryFilter}
        />
      )}
      {baristaTab === 'stock' && (
        <StockControl menu={menu} toggleStock={toggleStock} />
      )}
      {baristaTab === 'editor' && (
        <MenuEditor menu={menu} setEditingItem={setEditingItem} />
      )}

      {editingItem && (
        <MenuEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={updateMenuItem}
        />
      )}
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="px-4 py-2.5 rounded-2xl bg-[#0D1117] border border-white/10 flex flex-col items-center min-w-[90px]">
      <span className={`font-mono font-extrabold text-xl ${color}`}>
        {value}
      </span>
      <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
        {label}
      </span>
    </div>
  );
}

function OrdersFeed({
  activeOrders,
  allOrders,
  advanceOrder,
  now,
  historyFilter,
  setHistoryFilter,
}: {
  activeOrders: Order[];
  allOrders: Order[];
  advanceOrder: (id: string, status: OrderStatus) => void;
  now: number;
  historyFilter: 'today' | '3days' | '7days' | 'all';
  setHistoryFilter: (filter: 'today' | '3days' | '7days' | 'all') => void;
}) {
  const filteredHistory = useMemo(() => {
    const oneDayMs = 24 * 60 * 60 * 1000;
    return allOrders.filter((o) => {
      if (o.status === 'pending') return false;
      const ageMs = now - o.createdAt;
      if (historyFilter === 'today') return ageMs <= oneDayMs;
      if (historyFilter === '3days') return ageMs <= 3 * oneDayMs;
      if (historyFilter === '7days') return ageMs <= 7 * oneDayMs;
      return true;
    });
  }, [allOrders, now, historyFilter]);

  const pendingCount = activeOrders.length;
  const doneCount = filteredHistory.filter((o) => o.status === 'done').length;
  const cancelCount = filteredHistory.filter(
    (o) => o.status === 'cancelled'
  ).length;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <StatChip
            label="Pending / รอดำเนินการ"
            value={pendingCount}
            color="text-amber-300"
          />
          <StatChip
            label="Done / เสร็จสิ้น"
            value={doneCount}
            color="text-emerald-300"
          />
          <StatChip
            label="Cancelled / ยกเลิก"
            value={cancelCount}
            color="text-rose-400"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs">
          <span className="text-neutral-400 px-2 flex items-center gap-1">
            <Calendar size={13} /> ดูประวัติ:
          </span>
          <button
            onClick={() => setHistoryFilter('today')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              historyFilter === 'today'
                ? 'bg-amber-400 text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            วันนี้
          </button>
          <button
            onClick={() => setHistoryFilter('3days')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              historyFilter === '3days'
                ? 'bg-amber-400 text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            3 วันล่าสุด
          </button>
          <button
            onClick={() => setHistoryFilter('7days')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              historyFilter === '7days'
                ? 'bg-amber-400 text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            7 วันล่าสุด
          </button>
          <button
            onClick={() => setHistoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              historyFilter === 'all'
                ? 'bg-amber-400 text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            ทั้งหมด
          </button>
        </div>
      </div>

      <h2 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Clock size={16} /> ออเดอร์ที่กำลังรอทำ (Active Pending Orders)
      </h2>

      {activeOrders.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl text-neutral-500 text-sm mb-8">
          ไม่มีออเดอร์ค้างอยู่ในขณะนี้
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {activeOrders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              advanceOrder={advanceOrder}
              now={now}
            />
          ))}
        </div>
      )}

      <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2 pt-4 border-t border-white/10">
        <Calendar size={16} /> ประวัติออเดอร์ย้อนหลัง (Order History Log)
      </h2>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl text-neutral-500 text-xs">
          ไม่พบประวัติออเดอร์ในช่วงเวลาที่เลือก
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistory.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              advanceOrder={advanceOrder}
              now={now}
              isHistory
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  advanceOrder,
  now,
  isHistory = false,
}: {
  order: Order;
  advanceOrder: (id: string, status: OrderStatus) => void;
  now: number;
  isHistory?: boolean;
}) {
  const statusMeta = {
    pending: {
      label: 'PENDING',
      cls: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    },
    cancelled: {
      label: 'CANCELLED',
      cls: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    },
    done: {
      label: 'DONE',
      cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    },
  }[order.status];

  return (
    <div
      className={`relative rounded-2xl border ${
        order.status === 'pending'
          ? 'border-amber-400/40 bg-[#0D1117]'
          : 'border-white/10 bg-[#090D12] opacity-80'
      } p-4 overflow-hidden shadow-lg`}
    >
      <div className="relative flex items-start justify-between border-b border-white/5 pb-2.5">
        <div>
          <span className="font-mono text-xs text-neutral-500">
            #{order.id.slice(-5)}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <User size={14} className="text-amber-400" />
            <span className="font-bold text-sm text-white truncate max-w-[140px]">
              {order.customerName}
            </span>
          </div>
        </div>
        <span
          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${statusMeta.cls}`}
        >
          {statusMeta.label}
        </span>
      </div>

      <div className="relative mt-3 space-y-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start text-xs">
            <div>
              <p className="font-bold text-white">
                {item.qty > 1 ? `${item.qty}× ` : ''}
                {item.name}
              </p>
              <p className="text-[11px] text-neutral-400">
                {item.nameTh} · หวาน{' '}
                <span className={sweetnessColor(item.sweetness)}>
                  {item.sweetness}%
                </span>
              </p>
            </div>
            <span className="font-mono text-neutral-300 font-semibold">
              ฿{item.total}
            </span>
          </div>
        ))}
      </div>

      <div className="relative mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="font-mono font-extrabold text-amber-400 text-sm">
          รวม ฿{order.total}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-neutral-500">
          <Clock size={11} />{' '}
          {isHistory ? fmtDate(order.createdAt) : timeAgo(order.createdAt, now)}
        </span>
      </div>

      {!isHistory && order.status === 'pending' && (
        <div className="relative mt-4 flex gap-2">
          <button
            onClick={() => advanceOrder(order.id, 'cancelled')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-300 text-xs font-bold hover:bg-rose-500/25 transition-colors"
          >
            <XCircle size={14} /> Cancel / ยกเลิก
          </button>
          <button
            onClick={() => advanceOrder(order.id, 'done')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-colors"
          >
            <CheckCircle2 size={14} /> Done / เสร็จสิ้น
          </button>
        </div>
      )}
    </div>
  );
}

function StockControl({
  menu,
  toggleStock,
}: {
  menu: MenuItem[];
  toggleStock: (id: string) => void;
}) {
  return (
    <div className="mt-6">
      <p className="text-xs text-neutral-400 mb-4 flex items-center gap-1.5">
        <Zap size={14} className="text-teal-400" /> หากปิดการใช้งานเมนูใด
        ระบบจะทำการ **ซ่อนเมนูนานั้น** ออกจากหน้าของลูกค้าทันที
      </p>
      {CATEGORY_ORDER.map((cat) => {
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        const items = menu.filter((m) => m.category === cat);
        return (
          <div key={cat} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-teal-400/10 border border-teal-400/30 text-teal-300">
                <Icon size={14} />
              </span>
              <h2 className="text-sm font-bold text-white">{meta.label}</h2>
              <span className="text-xs text-neutral-500">({meta.labelTh})</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 ${
                    item.available
                      ? 'border-white/10 bg-[#0D1117]'
                      : 'border-rose-500/30 bg-rose-500/[0.04]'
                  }`}
                >
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-bold truncate ${
                        item.available
                          ? 'text-white'
                          : 'text-neutral-500 line-through'
                      }`}
                    >
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      {item.nameTh}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleStock(item.id)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors"
                    title={item.available ? 'ซ่อนเมนูนี้' : 'แสดงเมนูนี้'}
                  >
                    {item.available ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <ToggleRight size={22} /> แสดงเมนู
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400">
                        <EyeOff size={16} /> ซ่อนอยู่
                      </span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MenuEditor({
  menu,
  setEditingItem,
}: {
  menu: MenuItem[];
  setEditingItem: (item: MenuItem) => void;
}) {
  return (
    <div className="mt-6">
      <p className="text-xs text-neutral-400 mb-4 flex items-center gap-1.5">
        <Pencil size={14} className="text-teal-400" /> คลิกที่เมนูเพื่อแก้ไขราคา
        หรือชื่อเมนูภาษาไทย/อังกฤษ
      </p>
      {CATEGORY_ORDER.map((cat) => {
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        const items = menu.filter((m) => m.category === cat);
        return (
          <div key={cat} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-teal-400/10 border border-teal-400/30 text-teal-300">
                <Icon size={14} />
              </span>
              <h2 className="text-sm font-bold text-white">{meta.label}</h2>
              <span className="text-xs text-neutral-500">({meta.labelTh})</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setEditingItem(item)}
                  className="text-left flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#0D1117] p-3.5 hover:border-teal-400/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">
                      {item.nameTh}
                    </p>
                    <p className="text-xs font-mono font-black text-amber-400 mt-1">
                      ฿{item.price}
                    </p>
                  </div>
                  <Pencil size={16} className="shrink-0 text-neutral-500" />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MenuEditModal({
  item,
  onClose,
  onSave,
}: {
  item: MenuItem;
  onClose: () => void;
  onSave: (id: string, updates: Partial<MenuItem>) => void;
}) {
  const [name, setName] = useState<string>(item.name);
  const [nameTh, setNameTh] = useState<string>(item.nameTh);
  const [price, setPrice] = useState<number | string>(item.price);
  const [available, setAvailable] = useState<boolean>(item.available);

  function handleSave() {
    const cleanPrice = Math.max(0, Number(price) || 0);
    onSave(item.id, {
      name: name.trim() || item.name,
      nameTh: nameTh.trim() || item.nameTh,
      price: cleanPrice,
      available,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-sm bg-[#0D1117] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Pencil size={16} className="text-teal-400" /> แก้ไขเมนู
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400"
          >
            <X size={16} />
          </button>
        </div>

        <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
          ชื่อภาษาอังกฤษ (English Name)
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />

        <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
          ชื่อภาษาไทย (Thai Name)
        </label>
        <input
          value={nameTh}
          onChange={(e) => setNameTh(e.target.value)}
          className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />

        <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
          ราคา (บาท)
        </label>
        <div className="relative mb-4">
          <Tag
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-10 pr-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
          สถานะแสดงเมนู
        </label>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAvailable(true)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
              available
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'bg-white/[0.03] border-white/10 text-neutral-500'
            }`}
          >
            <CheckCircle2 size={14} /> แสดงเมนู
          </button>
          <button
            onClick={() => setAvailable(false)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
              !available
                ? 'bg-rose-500/20 border-rose-400/50 text-rose-300'
                : 'bg-white/[0.03] border-white/10 text-neutral-500'
            }`}
          >
            <EyeOff size={14} /> ซ่อนเมนู
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-teal-300 text-black font-extrabold text-sm active:scale-[0.98] transition-transform shadow-[0_0_25px_-5px_rgba(45,212,191,0.6)]"
        >
          <Save size={16} /> บันทึกการเปลี่ยนแปลง
        </button>
      </div>
    </div>
  );
}
