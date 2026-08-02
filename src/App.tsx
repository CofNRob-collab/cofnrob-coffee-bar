import { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  onValue,
  get,
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
  ArrowLeft,
  ChevronRight,
  Award,
  History,
  Phone,
  ToggleRight,
  Zap,
  MinusCircle,
  PlusCircle,
  Search,
  Users,
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
  memberPhoneCode?: string;
  earnedPoints?: number;
  pointsProcessed?: boolean;
  items: CartItem[];
  total: number;
  createdAt: number;
  status: OrderStatus;
}

interface MemberData {
  phone4: string;
  points: number;
  updatedAt: number;
}

interface CategoryMetaItem {
  icon: LucideIcon;
  label: string;
  labelTh: string;
  theme: ThemeType;
}

/* ------------------------------------------------------------------ */
/*  MENU INITIAL DATA                                                 */
/* ------------------------------------------------------------------ */

const INITIAL_MENU_ITEMS: Omit<MenuItem, 'id'>[] = [
  {
    name: 'Iced Americano',
    nameTh: 'อเมริกาโน่เย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 50,
    available: true,
  },
  {
    name: 'Iced Espresso',
    nameTh: 'เอสเพรสโซ่เย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 55,
    available: true,
  },
  {
    name: 'Iced Americano Honey',
    nameTh: 'อเมริกาโน่น้ำผึ้งเย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 60,
    available: true,
  },
  {
    name: 'Iced Americano Orange',
    nameTh: 'อเมริกาโน่ส้มเย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 60,
    available: true,
  },
  {
    name: 'Iced Americano Coconut',
    nameTh: 'อเมริกาโน่มะพร้าวเย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 60,
    available: true,
  },
  {
    name: 'Iced Americano Honey Orange',
    nameTh: 'อเมริกาโน่น้ำผึ้งส้ม',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 60,
    available: true,
  },
  {
    name: 'Americano Mint',
    nameTh: 'อเมริกาโน่มินต์',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 55,
    available: true,
  },
  {
    name: 'Iced Cappucino',
    nameTh: 'คาปูชิโน่เย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 55,
    available: true,
  },
  {
    name: 'Iced Mocha',
    nameTh: 'มอคค่าเย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 55,
    available: true,
  },
  {
    name: 'Iced Latte',
    nameTh: 'ลาเต้เย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 55,
    available: true,
  },
  {
    name: 'Latte Coconut',
    nameTh: 'ลาเต้มะพร้าว',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 65,
    available: true,
  },
  {
    name: 'Iced Caramel Macchiato',
    nameTh: 'คาราเมลมัคคิอาโต้เย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 55,
    available: true,
  },
  {
    name: 'Hot Americano',
    nameTh: 'อเมริกาโน่ร้อน',
    category: 'HOT COFFEE',
    theme: 'brown',
    price: 40,
    available: true,
  },
  {
    name: 'Hot Espresso',
    nameTh: 'เอสเพรสโซ่ร้อน',
    category: 'HOT COFFEE',
    theme: 'brown',
    price: 40,
    available: true,
  },
  {
    name: 'Hot Cappucino',
    nameTh: 'คาปูชิโน่ร้อน',
    category: 'HOT COFFEE',
    theme: 'brown',
    price: 45,
    available: true,
  },
  {
    name: 'Hot Caramel Macchiato',
    nameTh: 'คาราเมลมัคคิอาโต้ร้อน',
    category: 'HOT COFFEE',
    theme: 'brown',
    price: 45,
    available: true,
  },
  {
    name: 'Hot Mocha',
    nameTh: 'มอคค่าร้อน',
    category: 'HOT COFFEE',
    theme: 'brown',
    price: 45,
    available: true,
  },
  {
    name: 'Hot Latte',
    nameTh: 'ลาเต้ร้อน',
    category: 'HOT COFFEE',
    theme: 'brown',
    price: 45,
    available: true,
  },
  {
    name: 'Hot Americano Honey',
    nameTh: 'อเมริกาโน่น้ำผึ้งร้อน',
    category: 'HOT COFFEE',
    theme: 'brown',
    price: 45,
    available: true,
  },
  {
    name: 'Iced Matcha Latte',
    nameTh: 'มัทฉะลาเต้เย็น',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 65,
    available: true,
  },
  {
    name: 'Iced Matcha Coffee',
    nameTh: 'มัทฉะกาแฟ',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 70,
    available: true,
  },
  {
    name: 'Iced Matcha',
    nameTh: 'มัทฉะเย็น',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 60,
    available: true,
  },
  {
    name: 'Iced Matcha Orange',
    nameTh: 'มัทฉะส้ม',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 65,
    available: true,
  },
  {
    name: 'Lemon Tea',
    nameTh: 'ชามะนาว',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 40,
    available: true,
  },
  {
    name: 'Peach tea',
    nameTh: 'ชาพีช',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 40,
    available: true,
  },
  {
    name: 'Cocoa',
    nameTh: 'โกโก้',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 50,
    available: true,
  },
  {
    name: 'Extra shot',
    nameTh: 'เพิ่มช็อต',
    category: 'OTHERS',
    theme: 'gray',
    price: 15,
    available: true,
  },
];

const MAIN_GROUPS: CategoryType[] = [
  'ICED COFFEE',
  'HOT COFFEE',
  'MATCHA & TEA',
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
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [memberPhoneCode, setMemberPhoneCode] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [sweetness, setSweetness] = useState<number>(100);
  const [qty, setQty] = useState<number>(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [baristaTab, setBaristaTab] = useState<
    'orders' | 'points' | 'stock' | 'editor'
  >('orders');
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [shopOpen, setShopOpen] = useState<boolean>(true);
  const [shopMessage, setShopMessage] = useState<string>(
    'ร้านปิดให้บริการชั่วคราว'
  );
  const sound = useOrderSound(soundOn);

  /* ------------------------------------------------------------------ */
  /*  FIREBASE MENU DATA SYNCING                                        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const menuRef = ref(db, 'menuItems');
    const unsubscribeMenu = onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const menuList: MenuItem[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          available: data[key].available ?? true,
        }));
        setMenu(menuList);
      } else {
        // หากไม่มีข้อมูลใน DB ให้เซ็ต Initial Menu เข้าไปอัตโนมัติ
        INITIAL_MENU_ITEMS.forEach((item) => {
          const newRef = push(ref(db, 'menuItems'));
          set(newRef, item);
        });
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
      unsubscribeMenu();
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
            memberPhoneCode: itemData.memberPhoneCode || '',
            earnedPoints: itemData.earnedPoints || 0,
            pointsProcessed: itemData.pointsProcessed || false,
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
        .substring(2, 6)}`,
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

    const trimmedPhone = memberPhoneCode.trim();
    if (!trimmedPhone || trimmedPhone.length !== 4) {
      setToast('กรุณากรอกรหัสสมาชิก 4 ตัวท้ายให้ถูกต้องก่อนสั่งซื้อ');
      return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
    const earnedPoints = totalAmount / 10;

    const newOrderData = {
      customerName: `สมาชิก #${trimmedPhone}`,
      memberPhoneCode: trimmedPhone,
      earnedPoints: earnedPoints,
      pointsProcessed: false,
      items: cart,
      total: totalAmount,
      createdAt: Date.now(),
      status: 'pending',
    };

    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);
    set(newOrderRef, newOrderData);

    setToast(
      `ส่งออเดอร์เรียบร้อย! (คุณจะได้รับ +${earnedPoints} แต้มเมื่อบาริสต้ากดรับ/ทำเสร็จ)`
    );
    setCart([]);
    sound.playSent();
  }

  async function advanceOrder(id: string, status: OrderStatus) {
    const targetOrder = orders.find((o) => o.id === id);
    if (!targetOrder) return;

    if (
      status === 'done' &&
      targetOrder.memberPhoneCode &&
      !targetOrder.pointsProcessed
    ) {
      const phone4 = targetOrder.memberPhoneCode;
      const pointsToAdd = targetOrder.earnedPoints || targetOrder.total / 10;

      const memberRef = ref(db, `members/${phone4}`);
      const snapshot = await get(memberRef);
      const currentPoints = snapshot.exists() ? snapshot.val().points || 0 : 0;

      await set(memberRef, {
        phone4,
        points: currentPoints + pointsToAdd,
        updatedAt: Date.now(),
      });

      const orderRef = ref(db, `orders/${id}`);
      update(orderRef, { status: 'done', pointsProcessed: true });
      sound.playDone();
      setToast(`เพิ่ม ${pointsToAdd} แต้มให้สมาชิก #${phone4} เรียบร้อยแล้ว!`);
    } else {
      const orderRef = ref(db, `orders/${id}`);
      update(orderRef, { status });
      if (status === 'done') sound.playDone();
    }
  }

  /* ------------------------------------------------------------------ */
  /*  PERSISTENT MENU MANAGEMENT FUNCTIONS                              */
  /* ------------------------------------------------------------------ */

  function toggleStock(id: string) {
    const item = menu.find((m) => m.id === id);
    if (!item) return;
    const nextStatus = !item.available;
    update(ref(db, `menuItems/${id}`), { available: nextStatus });
  }

  function updateMenuItem(id: string, updates: Partial<MenuItem>) {
    update(ref(db, `menuItems/${id}`), updates);
    setEditingItem(null);
    setToast(`อัปเดตเมนู ${updates.name || ''} เรียบร้อยแล้ว`);
  }

  function addMenuItem(newItem: Omit<MenuItem, 'id'>) {
    const menuListRef = ref(db, 'menuItems');
    const newItemRef = push(menuListRef);
    set(newItemRef, newItem);
    setIsAddingNew(false);
    setToast(`เพิ่มเมนู ${newItem.name} เรียบร้อยแล้ว`);
  }

  function deleteMenuItem(id: string) {
    const item = menu.find((m) => m.id === id);
    set(ref(db, `menuItems/${id}`), null);
    setEditingItem(null);
    setToast(`ลบเมนู ${item?.name || ''} เรียบร้อยแล้ว`);
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
          memberPhoneCode={memberPhoneCode}
          setMemberPhoneCode={setMemberPhoneCode}
          openModal={openModal}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
          cart={cart}
          removeFromCart={removeFromCart}
          updateCartQty={updateCartQty}
          submitCartOrder={submitCartOrder}
          shopOpen={shopOpen}
          shopMessage={shopMessage}
          orders={orders}
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
          setIsAddingNew={setIsAddingNew}
          updateMenuItem={updateMenuItem}
          shopOpen={shopOpen}
          toggleShopStatus={toggleShopStatus}
          shopMessage={shopMessage}
          updateShopMessage={updateShopMessage}
          setToast={setToast}
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

      {baristaTab === 'editor' && (editingItem || isAddingNew) && (
        <MenuEditModal
          item={editingItem}
          isNew={isAddingNew}
          onClose={() => {
            setEditingItem(null);
            setIsAddingNew(false);
          }}
          onSave={updateMenuItem}
          onAdd={addMenuItem}
          onDelete={deleteMenuItem}
        />
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] px-4 py-3 rounded-2xl bg-[#0D1117] border border-emerald-400/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

interface CustomerViewProps {
  menu: MenuItem[];
  memberPhoneCode: string;
  setMemberPhoneCode: (code: string) => void;
  openModal: (item: MenuItem) => void;
  soundOn: boolean;
  setSoundOn: (val: boolean) => void;
  cart: CartItem[];
  removeFromCart: (cartId: string) => void;
  updateCartQty: (cartId: string, delta: number) => void;
  submitCartOrder: () => void;
  shopOpen: boolean;
  shopMessage: string;
  orders: Order[];
}

function CustomerView({
  menu,
  memberPhoneCode,
  setMemberPhoneCode,
  openModal,
  soundOn,
  setSoundOn,
  cart,
  removeFromCart,
  updateCartQty,
  submitCartOrder,
  shopOpen,
  shopMessage,
  orders,
}: CustomerViewProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [memberInfo, setMemberInfo] = useState<MemberData | null>(null);

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const totalCartItems = cart.reduce((sum, i) => sum + i.qty, 0);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'pending').length;
  }, [orders]);

  useEffect(() => {
    const code = memberPhoneCode.trim();
    if (code.length === 4) {
      const memberRef = ref(db, `members/${code}`);
      const unsubscribe = onValue(memberRef, (snapshot) => {
        if (snapshot.exists()) {
          setMemberInfo(snapshot.val());
        } else {
          setMemberInfo({ phone4: code, points: 0, updatedAt: Date.now() });
        }
      });
      return () => unsubscribe();
    } else {
      setMemberInfo(null);
    }
  }, [memberPhoneCode]);

  const memberHistory = useMemo(() => {
    const code = memberPhoneCode.trim();
    if (code.length !== 4) return [];
    return orders.filter((o) => o.memberPhoneCode === code);
  }, [orders, memberPhoneCode]);

  const visibleItems = useMemo(() => {
    if (!selectedCategory) return [];

    const catItems = menu.filter(
      (m) => m.category === selectedCategory && m.available
    );

    if (
      selectedCategory === 'ICED COFFEE' ||
      selectedCategory === 'HOT COFFEE'
    ) {
      const extraShots = menu.filter(
        (m) => m.category === 'OTHERS' && m.available
      );
      return [...catItems, ...extraShots];
    }

    return catItems;
  }, [menu, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-28">
      {/* Header */}
      <div className="pb-6 mb-6 border-b border-white/15">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white">
              Cof N&apos; Rob <span className="text-amber-400">Coffee Bar</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              สะสมแต้มง่ายๆ: ซื้อครบทุก 10 บาท = 1 คะแนน
            </p>

            <div className="mt-3 max-w-xs">
              <div className="relative">
                <Phone
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  value={memberPhoneCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 4) setMemberPhoneCode(val);
                  }}
                  placeholder="กรอกเบอร์โทร 4 ตัวท้าย..."
                  maxLength={4}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono font-bold text-amber-300 placeholder:text-neutral-500 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
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

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-neutral-300">
              <Users size={16} className="text-amber-400" />
              <span>
                คิวรอ:{' '}
                <span className="font-mono font-black text-amber-400 text-sm">
                  {pendingOrdersCount}
                </span>{' '}
                <span className="hidden sm:inline">ออเดอร์</span>
              </span>
            </div>

            <button
              onClick={() => setSoundOn(!soundOn)}
              title={soundOn ? 'ปิดเสียง' : 'เปิดเสียง'}
              className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/10 text-neutral-300 hover:text-white transition-colors"
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>

        {memberPhoneCode.trim().length === 4 && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-400/30 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-400">
                <Award size={24} />
              </div>
              <div>
                <span className="text-xs text-neutral-400 font-semibold block">
                  สมาชิกเบอร์ท้าย #{memberPhoneCode}
                </span>
                <span className="text-lg font-black text-amber-400 font-mono">
                  {memberInfo ? memberInfo.points : 0}{' '}
                  <span className="text-xs font-normal text-amber-200">
                    คะแนนสะสม
                  </span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-neutral-400 block flex items-center gap-1 justify-end">
                <History size={12} /> เคยสั่งซื้อทั้งหมด
              </span>
              <span className="text-xs font-bold text-white font-mono">
                {memberHistory.length} ออเดอร์
              </span>
            </div>
          </div>
        )}
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
        className={`space-y-6 ${
          !shopOpen ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        {!selectedCategory ? (
          <div>
            <h2 className="text-base font-bold text-neutral-300 mb-4">
              เลือกหมวดหมู่เครื่องดื่ม (Select Category)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MAIN_GROUPS.map((catKey) => {
                const meta = CATEGORY_META[catKey];
                const Icon = meta.icon;
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategory(catKey)}
                    className="group relative text-left p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-amber-400/50 hover:bg-white/[0.06] transition-all flex flex-col justify-between overflow-hidden shadow-lg active:scale-[0.98]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-3.5 rounded-2xl bg-amber-400/10 text-amber-400 group-hover:scale-110 transition-transform">
                        <Icon size={32} />
                      </div>
                      <ChevronRight
                        className="text-neutral-500 group-hover:text-amber-400 transition-colors"
                        size={24}
                      />
                    </div>

                    <div className="mt-6">
                      <h3 className="text-xl font-black text-white tracking-wide">
                        {meta.labelTh}
                      </h3>
                      <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest mt-0.5">
                        {meta.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-amber-400 text-xs font-bold transition-all"
              >
                <ArrowLeft size={16} /> กลับไปเลือกหมวดหมู่
              </button>

              <div className="flex items-center gap-2">
                {MAIN_GROUPS.map((catKey) => {
                  const meta = CATEGORY_META[catKey];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={catKey}
                      onClick={() => setSelectedCategory(catKey)}
                      className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-bold ${
                        selectedCategory === catKey
                          ? 'bg-amber-400 border-amber-400 text-black'
                          : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="hidden sm:inline">{meta.labelTh}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              {(() => {
                const meta = CATEGORY_META[selectedCategory];
                const Icon = meta.icon;
                return (
                  <>
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400">
                      <Icon size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-white tracking-wide">
                        {meta.labelTh}
                      </h2>
                      <p className="text-xs text-neutral-400">{meta.label}</p>
                    </div>
                  </>
                );
              })()}
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
        )}

        {memberHistory.length > 0 && (
          <div className="mt-10 pt-6 border-t border-white/10">
            <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
              <History size={16} /> ประวัติการสั่งซื้อย้อนหลังของคุณ (เบอร์ท้าย
              #{memberPhoneCode})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {memberHistory.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-xs"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-neutral-400">
                      {fmtDate(o.createdAt)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        o.status === 'done'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : o.status === 'cancelled'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {o.status === 'done'
                        ? 'เสร็จสิ้น (+สะสมแต้มแล้ว)'
                        : o.status === 'cancelled'
                        ? 'ยกเลิก'
                        : 'รอดำเนินการ'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {o.items.map((i, idx) => (
                      <p
                        key={idx}
                        className="text-white font-semibold truncate"
                      >
                        {i.name} x{i.qty}{' '}
                        <span
                          className={`text-[11px] font-normal ${sweetnessColor(
                            i.sweetness
                          )}`}
                        >
                          (หวาน {i.sweetness}%)
                        </span>
                      </p>
                    ))}
                  </div>
                  <p className="text-amber-400 font-mono font-bold mt-1">
                    ฿{o.total}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
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
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-neutral-400">
                    ราคารวมทั้งหมด
                  </span>
                  <span className="text-2xl font-mono font-black text-amber-400">
                    ฿{cartTotal}
                  </span>
                </div>

                <div className="mb-4 text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Award size={14} /> จะได้รับคะแนนสะสม: +{cartTotal / 10} คะแนน
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
  const bt = BUTTON_THEME[item.theme] || BUTTON_THEME.gray;

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
  baristaTab: 'orders' | 'points' | 'stock' | 'editor';
  setBaristaTab: (tab: 'orders' | 'points' | 'stock' | 'editor') => void;
  activeOrders: Order[];
  allOrders: Order[];
  advanceOrder: (id: string, status: OrderStatus) => void;
  now: number;
  sound: ReturnType<typeof useOrderSound>;
  soundOn: boolean;
  setSoundOn: (val: boolean) => void;
  editingItem: MenuItem | null;
  setEditingItem: (item: MenuItem | null) => void;
  setIsAddingNew: (val: boolean) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  shopOpen: boolean;
  toggleShopStatus: () => void;
  shopMessage: string;
  updateShopMessage: (msg: string) => void;
  setToast: (msg: string) => void;
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
  setIsAddingNew,
  updateMenuItem,
  shopOpen,
  toggleShopStatus,
  shopMessage,
  updateShopMessage,
  setToast,
}: BaristaViewProps) {
  const [clock, setClock] = useState<Date>(new Date());
  const [historyFilter, setHistoryFilter] = useState<
    'today' | 'yesterday' | 'custom' | 'all'
  >('today');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
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

      {/* Barista Nav Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 mt-5 rounded-xl bg-white/[0.04] border border-white/10 w-fit">
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
          onClick={() => setBaristaTab('points')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            baristaTab === 'points'
              ? 'bg-amber-400 text-black'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Award size={15} /> จัดการแต้มสะสม (Add / Redeem Points)
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
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      )}

      {baristaTab === 'points' && <PointsManager setToast={setToast} />}

      {baristaTab === 'stock' && (
        <StockControl menu={menu} toggleStock={toggleStock} />
      )}

      {baristaTab === 'editor' && (
        <MenuEditor
          menu={menu}
          setEditingItem={setEditingItem}
          setIsAddingNew={setIsAddingNew}
        />
      )}
    </div>
  );
}

function PointsManager({ setToast }: { setToast: (msg: string) => void }) {
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [member, setMember] = useState<MemberData | null>(null);
  const [pointsToDeduct, setPointsToDeduct] = useState<number>(10);
  const [pointsToAdd, setPointsToAdd] = useState<number>(10);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  async function handleSearch() {
    const code = searchPhone.trim();
    if (code.length !== 4) {
      setToast('กรุณากรอกรหัสสมาชิก 4 ตัวท้ายให้ครบถ้วน');
      return;
    }
    setIsSearching(true);
    const memberRef = ref(db, `members/${code}`);
    const snapshot = await get(memberRef);
    if (snapshot.exists()) {
      setMember(snapshot.val());
    } else {
      setMember({ phone4: code, points: 0, updatedAt: Date.now() });
      setToast(`ยังไม่มีข้อมูลสมาชิก #${code} (เริ่มต้น 0 คะแนน)`);
    }
    setIsSearching(false);
  }

  async function handleAddPoints() {
    if (!member) return;
    if (pointsToAdd <= 0) {
      setToast('กรุณาระบุจำนวนคะแนนที่ต้องการเพิ่มให้ถูกต้อง');
      return;
    }

    const newPoints = member.points + pointsToAdd;
    const memberRef = ref(db, `members/${member.phone4}`);
    await set(memberRef, {
      phone4: member.phone4,
      points: newPoints,
      updatedAt: Date.now(),
    });

    setMember({ ...member, points: newPoints, updatedAt: Date.now() });
    setToast(
      `เพิ่มคะแนนให้สมาชิก #${member.phone4} จำนวน +${pointsToAdd} คะแนนเรียบร้อยแล้ว`
    );
  }

  async function handleDeductPoints() {
    if (!member) return;
    if (pointsToDeduct <= 0) {
      setToast('กรุณาระบุจำนวนคะแนนที่ต้องการหักให้ถูกต้อง');
      return;
    }
    if (member.points < pointsToDeduct) {
      setToast(
        `คะแนนไม่พอ! สมาชิกมีเพียง ${member.points} คะแนน แต่ต้องการตัด ${pointsToDeduct} คะแนน`
      );
      return;
    }

    const newPoints = member.points - pointsToDeduct;
    const memberRef = ref(db, `members/${member.phone4}`);
    await set(memberRef, {
      phone4: member.phone4,
      points: newPoints,
      updatedAt: Date.now(),
    });

    setMember({ ...member, points: newPoints, updatedAt: Date.now() });
    setToast(
      `ตัดคะแนนสมาชิก #${member.phone4} จำนวน -${pointsToDeduct} คะแนนเรียบร้อยแล้ว`
    );
  }

  return (
    <div className="mt-6 max-w-xl">
      <div className="p-6 rounded-3xl bg-[#0D1117] border border-amber-400/30 shadow-xl">
        <h2 className="text-lg font-black text-amber-400 flex items-center gap-2 mb-1">
          <Award size={20} /> ระบบจัดการแต้มสะสมสมาชิก (Manage Points)
        </h2>
        <p className="text-xs text-neutral-400 mb-6">
          สำหรับบาริสต้าใช้เพิ่มแต้มอิสระ
          หรือตัดคะแนนสะสมเมื่อลูกค้านำแต้มมาแลกส่วนลด
        </p>

        <div className="space-y-2 mb-6">
          <label className="text-xs font-bold text-neutral-300 block">
            ค้นหารหัสสมาชิก (เบอร์โทร 4 ตัวท้าย)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <input
                type="text"
                inputMode="numeric"
                value={searchPhone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 4) setSearchPhone(val);
                }}
                maxLength={4}
                placeholder="เช่น 1234"
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm font-mono font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
            >
              <Search size={15} /> ค้นหา
            </button>
          </div>
        </div>

        {member && (
          <div className="pt-5 border-t border-white/10 space-y-6 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 block font-semibold">
                  สมาชิกหมายเลข
                </span>
                <span className="text-lg font-black text-white font-mono">
                  #{member.phone4}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-amber-300/80 block font-semibold">
                  คะแนนสะสมคงเหลือ
                </span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {member.points}{' '}
                  <span className="text-xs font-normal text-amber-200">
                    แต้ม
                  </span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
              <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <PlusCircle size={15} /> บวกแต้มสะสมเพิ่ม (Add Points)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={pointsToAdd}
                  onChange={(e) =>
                    setPointsToAdd(Math.max(1, Number(e.target.value)))
                  }
                  className="w-32 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-base font-mono font-bold text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="text-xs text-neutral-400">คะแนน</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[10, 20, 50, 100].map((pts) => (
                  <button
                    key={pts}
                    onClick={() => setPointsToAdd(pts)}
                    className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                  >
                    +{pts} แต้ม
                  </button>
                ))}
              </div>

              <button
                onClick={handleAddPoints}
                className="w-full py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-[0.98]"
              >
                <PlusCircle size={16} /> ยืนยันการเพิ่มคะแนน (+{pointsToAdd}{' '}
                แต้ม)
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
              <label className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <MinusCircle size={15} /> หัก / แลกคะแนนออก (Redeem Points)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={member.points}
                  value={pointsToDeduct}
                  onChange={(e) =>
                    setPointsToDeduct(Math.max(1, Number(e.target.value)))
                  }
                  className="w-32 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-base font-mono font-bold text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <span className="text-xs text-neutral-400">คะแนน</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[10, 20, 50, 100].map((pts) => (
                  <button
                    key={pts}
                    onClick={() => setPointsToDeduct(pts)}
                    className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300"
                  >
                    -{pts} แต้ม
                  </button>
                ))}
              </div>

              <button
                onClick={handleDeductPoints}
                disabled={member.points <= 0}
                className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  member.points > 0
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-[0.98]'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <MinusCircle size={16} /> ยืนยันการหัก/ตัดคะแนน (-
                {pointsToDeduct} แต้ม)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
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
  selectedDate,
  setSelectedDate,
}: {
  activeOrders: Order[];
  allOrders: Order[];
  advanceOrder: (id: string, status: OrderStatus) => void;
  now: number;
  historyFilter: 'today' | 'yesterday' | 'custom' | 'all';
  setHistoryFilter: (filter: 'today' | 'yesterday' | 'custom' | 'all') => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}) {
  const filteredHistory = useMemo(() => {
    if (historyFilter === 'all') {
      return allOrders.filter((o) => o.status !== 'pending');
    }

    const nowDate = new Date(now);
    const startOfToday = new Date(
      nowDate.getFullYear(),
      nowDate.getMonth(),
      nowDate.getDate()
    ).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000 - 1;

    let startTime = startOfToday;
    let endTime = endOfToday;

    if (historyFilter === 'yesterday') {
      startTime = startOfToday - 24 * 60 * 60 * 1000;
      endTime = startOfToday - 1;
    } else if (historyFilter === 'custom') {
      if (!selectedDate) return [];
      const [year, month, day] = selectedDate.split('-').map(Number);
      const customStart = new Date(year, month - 1, day).getTime();
      startTime = customStart;
      endTime = customStart + 24 * 60 * 60 * 1000 - 1;
    }

    return allOrders.filter((o) => {
      if (o.status === 'pending') return false;
      return o.createdAt >= startTime && o.createdAt <= endTime;
    });
  }, [allOrders, now, historyFilter, selectedDate]);

  const pendingCount = activeOrders.length;
  const doneOrders = filteredHistory.filter((o) => o.status === 'done');
  const doneCount = doneOrders.length;
  const cancelCount = filteredHistory.filter(
    (o) => o.status === 'cancelled'
  ).length;

  const totalRevenue = useMemo(
    () => doneOrders.reduce((sum, o) => sum + o.total, 0),
    [doneOrders]
  );

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
          <StatChip
            label="Revenue / ยอดขาย"
            value={`฿${totalRevenue}`}
            color="text-teal-300"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.04] p-1.5 rounded-xl border border-white/10 text-xs">
          <span className="text-neutral-400 px-2 flex items-center gap-1 font-semibold">
            <Calendar size={13} className="text-amber-400" /> ตัวกรองประวัติ:
          </span>
          <button
            onClick={() => setHistoryFilter('today')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              historyFilter === 'today'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            วันนี้
          </button>
          <button
            onClick={() => setHistoryFilter('yesterday')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              historyFilter === 'yesterday'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            เมื่อวาน
          </button>
          <button
            onClick={() => setHistoryFilter('custom')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              historyFilter === 'custom'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            เลือกวันเอง
          </button>
          <button
            onClick={() => setHistoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              historyFilter === 'all'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            ทั้งหมด
          </button>

          {historyFilter === 'custom' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="ml-1 bg-white/[0.06] border border-amber-400/40 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            />
          )}
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
          {order.memberPhoneCode && (
            <span className="inline-block mt-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              สมาชิก #{order.memberPhoneCode} (+
              {order.earnedPoints || order.total / 10} แต้ม)
            </span>
          )}
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
            <CheckCircle2 size={14} /> Done & เพิ่มแต้ม
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
  const categories: CategoryType[] = [
    'ICED COFFEE',
    'HOT COFFEE',
    'MATCHA & TEA',
    'OTHERS',
  ];

  return (
    <div className="mt-6">
      <p className="text-xs text-neutral-400 mb-4 flex items-center gap-1.5">
        <Zap size={14} className="text-teal-400" /> หากปิดการใช้งานเมนูใด
        ระบบจะทำการ **ซ่อนเมนูนานั้น** ออกจากหน้าของลูกค้าทันที
      </p>
      {categories.map((cat) => {
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
  setIsAddingNew,
}: {
  menu: MenuItem[];
  setEditingItem: (item: MenuItem) => void;
  setIsAddingNew: (val: boolean) => void;
}) {
  const categories: CategoryType[] = [
    'ICED COFFEE',
    'HOT COFFEE',
    'MATCHA & TEA',
    'OTHERS',
  ];

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <p className="text-xs text-neutral-400 flex items-center gap-1.5">
          <Pencil size={14} className="text-teal-400" />{' '}
          คลิกที่เมนูเพื่อแก้ไข/ลบ หรือคลิกปุ่มเพิ่มเมนูเพื่อสร้างรายการใหม่
        </p>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-black font-extrabold text-xs shadow-[0_0_15px_rgba(45,212,191,0.4)] transition-all active:scale-[0.98]"
        >
          <Plus size={16} /> เพิ่มเมนูใหม่ (Add New Menu)
        </button>
      </div>

      {categories.map((cat) => {
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
  isNew = false,
  onClose,
  onSave,
  onAdd,
  onDelete,
}: {
  item: MenuItem | null;
  isNew?: boolean;
  onClose: () => void;
  onSave?: (id: string, updates: Partial<MenuItem>) => void;
  onAdd?: (item: Omit<MenuItem, 'id'>) => void;
  onDelete?: (id: string) => void;
}) {
  const [name, setName] = useState<string>(item?.name || '');
  const [nameTh, setNameTh] = useState<string>(item?.nameTh || '');
  const [category, setCategory] = useState<CategoryType>(
    item?.category || 'ICED COFFEE'
  );
  const [theme, setTheme] = useState<ThemeType>(item?.theme || 'blue');
  const [price, setPrice] = useState<number | string>(item?.price ?? 50);
  const [available, setAvailable] = useState<boolean>(item?.available ?? true);

  const categories: CategoryType[] = [
    'ICED COFFEE',
    'HOT COFFEE',
    'MATCHA & TEA',
    'OTHERS',
  ];

  const themeOptions: { value: ThemeType; label: string }[] = [
    { value: 'blue', label: 'Blue (กาแฟเย็น)' },
    { value: 'brown', label: 'Brown (กาแฟร้อน)' },
    { value: 'green', label: 'Green (ชา/มัทฉะ)' },
    { value: 'teal', label: 'Teal' },
    { value: 'gray', label: 'Gray (อื่นๆ)' },
  ];

  function handleSubmit() {
    const cleanPrice = Math.max(0, Number(price) || 0);
    if (isNew) {
      if (!name.trim() || !nameTh.trim()) return;
      onAdd?.({
        name: name.trim(),
        nameTh: nameTh.trim(),
        category,
        theme,
        price: cleanPrice,
        available,
      });
    } else if (item && onSave) {
      onSave(item.id, {
        name: name.trim() || item.name,
        nameTh: nameTh.trim() || item.nameTh,
        category,
        theme,
        price: cleanPrice,
        available,
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-[#0D1117] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {isNew ? (
              <>
                <Plus size={18} className="text-teal-400" /> เพิ่มเมนูใหม่
              </>
            ) : (
              <>
                <Pencil size={16} className="text-teal-400" /> แก้ไขเมนู
              </>
            )}
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
          placeholder="e.g. Iced Espresso"
          className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />

        <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
          ชื่อภาษาไทย (Thai Name)
        </label>
        <input
          value={nameTh}
          onChange={(e) => setNameTh(e.target.value)}
          placeholder="เช่น เอสเพรสโซ่เย็น"
          className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-sm text-white mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
              หมวดหมู่ (Category)
            </label>
            <select
              value={category}
              onChange={(e) => {
                const cat = e.target.value as CategoryType;
                setCategory(cat);
                if (cat === 'ICED COFFEE') setTheme('blue');
                else if (cat === 'HOT COFFEE') setTheme('brown');
                else if (cat === 'MATCHA & TEA') setTheme('green');
                else setTheme('gray');
              }}
              className="w-full rounded-xl bg-[#161B22] border border-white/10 px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
              ธีมสี (Theme)
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeType)}
              className="w-full rounded-xl bg-[#161B22] border border-white/10 px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              {themeOptions.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

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

        <div className="flex gap-2">
          {!isNew && item && onDelete && (
            <button
              onClick={() => {
                if (confirm(`คุณต้องการลบเมนู "${item.name}" ใช่หรือไม่?`)) {
                  onDelete(item.id);
                }
              }}
              className="flex items-center justify-center p-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-rose-300 transition-colors"
              title="ลบเมนูนี้"
            >
              <Trash2 size={18} />
            </button>
          )}

          <button
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-teal-300 text-black font-extrabold text-sm active:scale-[0.98] transition-transform shadow-[0_0_25px_-5px_rgba(45,212,191,0.6)]"
          >
            {isNew ? (
              <>
                <Plus size={18} /> สร้างเมนูใหม่
              </>
            ) : (
              <>
                <Save size={16} /> บันทึกการเปลี่ยนแปลง
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
