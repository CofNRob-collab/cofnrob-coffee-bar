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
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
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
  Gift,
  UserX,
  Lock,
  LogOut,
  Receipt,
  Home,
  Wallet,
  BarChart3,
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
const auth = getAuth(app);

/* ------------------------------------------------------------------ */
/*  TYPES & INTERFACES                                                */
/* ------------------------------------------------------------------ */

type ThemeType = 'blue' | 'brown' | 'teal' | 'gray' | 'green';
type CategoryType = 'ICED COFFEE' | 'HOT COFFEE' | 'MATCHA & TEA' | 'OTHERS';
type OrderStatus = 'pending' | 'cancelled' | 'done';
type ExpenseCategory = 'ingredient' | 'rent' | 'utility' | 'other';

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
  originalUnitPrice?: number;
  redeemedWithPoints?: boolean;
  pointsCost?: number;
}

interface Order {
  id: string;
  customerName: string;
  memberPhoneCode?: string;
  earnedPoints?: number;
  pointsProcessed?: boolean;
  redeemedPoints?: number;
  pointsRedeemed?: boolean;
  pointsRefunded?: boolean;
  note?: string;
  items: CartItem[];
  total: number;
  createdAt: number;
  status: OrderStatus;
}

interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  date: string; // 'YYYY-MM-DD' วันที่ซื้อจริง (บาริสต้าเลือกเอง)
  createdAt: number; // เวลาที่บันทึกรายการ
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
    sub: 'text-sky-100/90 font-bold',
  },
  brown: {
    grad: 'bg-gradient-to-r from-[#4A2810] via-[#6F3C17] to-[#8C4A1B] border-amber-600/50 hover:from-[#5A3114] hover:to-[#9C5320] shadow-[0_4px_20px_rgba(140,74,27,0.3)]',
    text: 'text-amber-50 font-extrabold',
    price: 'text-amber-200 font-black',
    sub: 'text-amber-100/90 font-bold',
  },
  teal: {
    grad: 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-500 border-teal-400/50 hover:from-teal-600 hover:to-emerald-400 shadow-[0_4px_20px_rgba(20,184,166,0.3)]',
    text: 'text-white font-extrabold',
    price: 'text-teal-100 font-black',
    sub: 'text-teal-100/90 font-bold',
  },
  green: {
    grad: 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-600 border-emerald-500/50 hover:from-emerald-700 hover:to-green-500 shadow-[0_4px_20px_rgba(16,185,129,0.3)]',
    text: 'text-white font-extrabold',
    price: 'text-emerald-100 font-black',
    sub: 'text-emerald-100/90 font-bold',
  },
  gray: {
    grad: 'bg-gradient-to-r from-stone-700 via-neutral-700 to-zinc-600 border-stone-500/50 hover:from-stone-600 hover:to-zinc-500 shadow-[0_4px_20px_rgba(113,113,122,0.3)]',
    text: 'text-neutral-100 font-extrabold',
    price: 'text-amber-300 font-black',
    sub: 'text-neutral-200 font-bold',
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

// ระดับความหวานพิเศษ 11 ระดับ เฉพาะเมนู Espresso, Cappucino, Mocha เท่านั้น
// เมนูอื่นๆ ยังคงใช้ SWEET_PRESETS (6 ระดับ) ตามเดิมทุกประการ
const SWEET_PRESETS_11_LEVEL = [
  { value: 0, label: '0%', labelTh: 'ไม่หวาน' },
  { value: 12, labelTh: 'ระดับ 12%' },
  { value: 25, label: '25%', labelTh: 'หวานหน่อยๆ' },
  { value: 37, labelTh: 'ระดับ 37%' },
  { value: 50, label: '50%', labelTh: 'หวานกลาง' },
  { value: 62, labelTh: 'ระดับ 62%' },
  { value: 75, label: '75%', labelTh: 'หวานกำลังดี' },
  { value: 87, labelTh: 'ระดับ 87%' },
  { value: 100, label: '100%', labelTh: 'หวานปกติ' },
  { value: 112, labelTh: 'ระดับ 112%' },
  { value: 120, label: '120%', labelTh: 'หวานชลบุรี' },
];

// รายชื่อเมนูที่ใช้ระดับความหวาน 11 ระดับ (ครอบคลุมทั้งเวอร์ชันร้อนและเย็น)
const ELEVEN_LEVEL_SWEETNESS_ITEMS = ['Espresso', 'Cappucino', 'Mocha'];

function getSweetPresetsForItem(itemName: string) {
  const isElevenLevelItem = ELEVEN_LEVEL_SWEETNESS_ITEMS.some((keyword) =>
    itemName.includes(keyword)
  );
  return isElevenLevelItem ? SWEET_PRESETS_11_LEVEL : SWEET_PRESETS;
}

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
  const [memberInfo, setMemberInfo] = useState<MemberData | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [orderNote, setOrderNote] = useState<string>('');
  const [sweetness, setSweetness] = useState<number>(100);
  const [qty, setQty] = useState<number>(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [baristaTab, setBaristaTab] = useState<
    'orders' | 'points' | 'stock' | 'editor' | 'expenses'
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

  // Firebase Auth State
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const sound = useOrderSound(soundOn);

  /* ------------------------------------------------------------------ */
  /*  FIREBASE AUTH LISTENER                                            */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

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
            redeemedPoints: itemData.redeemedPoints || 0,
            pointsRedeemed: itemData.pointsRedeemed || false,
            pointsRefunded: itemData.pointsRefunded || false,
            note: itemData.note || '',
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

  /* ------------------------------------------------------------------ */
  /*  FIREBASE EXPENSE TRACKING SYNCING                                 */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const expensesRef = ref(db, 'expenses');
    const unsubscribeExpenses = onValue(expensesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedExpenses: Expense[] = Object.keys(data).map((key) => ({
          id: key,
          description: data[key].description || '',
          category: data[key].category || 'other',
          quantity: data[key].quantity ?? 1,
          unit: data[key].unit || '',
          unitPrice: data[key].unitPrice ?? 0,
          total: data[key].total ?? 0,
          date: data[key].date || new Date().toISOString().split('T')[0],
          createdAt: data[key].createdAt || Date.now(),
        }));
        parsedExpenses.sort((a, b) => b.createdAt - a.createdAt);
        setExpenses(parsedExpenses);
      } else {
        setExpenses([]);
      }
    });

    return () => unsubscribeExpenses();
  }, []);

  /* ------------------------------------------------------------------ */
  /*  LIVE MEMBER POINT BALANCE — ใช้ทั้งใน CustomizeModal และตะกร้า      */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const code = memberPhoneCode.trim();
    if (code.length === 4) {
      const memberRef = ref(db, `members/${code}`);
      const unsubscribeMember = onValue(memberRef, (snapshot) => {
        if (snapshot.exists()) {
          setMemberInfo(snapshot.val());
        } else {
          setMemberInfo({ phone4: code, points: 0, updatedAt: Date.now() });
        }
      });
      return () => unsubscribeMember();
    } else {
      setMemberInfo(null);
    }
  }, [memberPhoneCode]);

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
    setToast(`เพิ่ม ${modalItem.nameTh} (${modalItem.name}) ลงในตะกร้าแล้ว`);
    setModalItem(null);
  }

  async function handleInstantOrder(usePoints: boolean) {
    if (!shopOpen) {
      setToast('ร้านปิดอยู่ ไม่สามารถส่งออเดอร์ได้');
      return;
    }
    if (!modalItem) return;

    const trimmedPhone = memberPhoneCode.trim();
    const isMember = trimmedPhone.length === 4;
    const fullPrice = modalItem.price * qty;
    const pointsCost = usePoints && isMember ? fullPrice : 0;

    let memberPointsAfter = 0;
    if (pointsCost > 0) {
      const memberRef = ref(db, `members/${trimmedPhone}`);
      const snap = await get(memberRef);
      if (!snap.exists()) {
        setToast(`ไม่พบสมาชิก #${trimmedPhone}`);
        return;
      }
      const currentPoints = Number(snap.val().points || 0);
      if (currentPoints < pointsCost) {
        setToast(
          `แต้มไม่พอสำหรับการแลก (มี ${currentPoints} แต้ม แต่ต้องใช้ ${pointsCost} แต้ม)`
        );
        return;
      }
      memberPointsAfter = currentPoints - pointsCost;
    }

    const totalAmount = fullPrice - pointsCost;
    const earnedPoints = isMember ? totalAmount / 10 : 0;

    const singleItem: CartItem = {
      cartId: `${modalItem.id}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)}`,
      itemId: modalItem.id,
      name: modalItem.name,
      nameTh: modalItem.nameTh,
      theme: modalItem.theme,
      sweetness,
      qty,
      unitPrice: pointsCost > 0 ? 0 : modalItem.price,
      total: totalAmount,
      originalUnitPrice: modalItem.price,
      redeemedWithPoints: pointsCost > 0,
      pointsCost: pointsCost,
    };

    const newOrderData = {
      customerName: isMember ? `สมาชิก #${trimmedPhone}` : 'Guest',
      memberPhoneCode: isMember ? trimmedPhone : '',
      earnedPoints: earnedPoints,
      pointsProcessed: false,
      redeemedPoints: pointsCost,
      pointsRefunded: false,
      note: orderNote.trim(),
      items: [singleItem],
      total: totalAmount,
      createdAt: Date.now(),
      status: 'pending',
    };

    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);

    try {
      if (pointsCost > 0) {
        await set(ref(db, `members/${trimmedPhone}`), {
          phone4: trimmedPhone,
          points: memberPointsAfter,
          updatedAt: Date.now(),
        });
      }
      await set(newOrderRef, newOrderData);
    } catch (err) {
      if (pointsCost > 0) {
        const memberRef = ref(db, `members/${trimmedPhone}`);
        const rollbackSnap = await get(memberRef);
        if (rollbackSnap.exists()) {
          const rollbackPoints = Number(rollbackSnap.val().points || 0);
          await update(memberRef, {
            points: rollbackPoints + pointsCost,
            updatedAt: Date.now(),
          });
        }
      }
      setToast('เกิดข้อผิดพลาดในการส่งออเดอร์ กรุณาลองใหม่');
      return;
    }

    setToast(
      pointsCost > 0
        ? `สั่งทันทีเรียบร้อย! (แลกฟรีด้วย ${pointsCost} แต้ม)`
        : isMember
        ? `สั่งทันทีเรียบร้อย! (คุณจะได้รับ +${earnedPoints} แต้มเมื่อบาริสต้ากดรับ/ทำเสร็จ)`
        : 'สั่งทันทีเรียบร้อย! (รายการของ Guest)'
    );
    setModalItem(null);
    setOrderNote('');
    sound.playSent();
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

  async function redeemCartItem(cartId: string) {
    const trimmedPhone = memberPhoneCode.trim();
    if (trimmedPhone.length !== 4) {
      setToast('กรุณากรอกเบอร์สมาชิก 4 หลักก่อนใช้แต้มแลกเมนู');
      return;
    }

    const target = cart.find((item) => item.cartId === cartId);
    if (!target || target.redeemedWithPoints) return;

    const memberSnap = await get(ref(db, `members/${trimmedPhone}`));
    if (!memberSnap.exists()) {
      setToast(`ไม่พบสมาชิก #${trimmedPhone}`);
      return;
    }

    const currentPoints = Number(memberSnap.val().points || 0);
    const alreadySelected = cart.reduce(
      (sum, item) =>
        sum +
        (item.redeemedWithPoints
          ? item.pointsCost || item.unitPrice * item.qty
          : 0),
      0
    );
    const pointsCost =
      (target.originalUnitPrice ?? target.unitPrice) * target.qty;

    if (currentPoints - alreadySelected < pointsCost) {
      setToast(
        `คะแนนไม่พอสำหรับ ${target.nameTh} (ต้องใช้ ${pointsCost} แต้ม)`
      );
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              originalUnitPrice: item.originalUnitPrice ?? item.unitPrice,
              unitPrice: 0,
              total: 0,
              redeemedWithPoints: true,
              pointsCost,
            }
          : item
      )
    );
    setToast(`เลือก ${target.nameTh} เพื่อแลกด้วย ${pointsCost} แต้มแล้ว`);
  }

  function unredeemCartItem(cartId: string) {
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartId !== cartId) return item;
        const originalPrice =
          item.originalUnitPrice ??
          menu.find((m) => m.id === item.itemId)?.price ??
          0;
        return {
          ...item,
          unitPrice: originalPrice,
          total: originalPrice * item.qty,
          redeemedWithPoints: false,
          pointsCost: 0,
        };
      })
    );
    setToast('ยกเลิกการใช้แต้มแลกเมนูแล้ว');
  }

  async function submitCartOrder() {
    if (!shopOpen) {
      setToast('ร้านปิดอยู่ ไม่สามารถส่งออเดอร์ได้');
      return;
    }
    if (cart.length === 0) return;

    const trimmedPhone = memberPhoneCode.trim();
    const isMember = trimmedPhone.length === 4;
    const redeemedPoints = isMember
      ? cart.reduce(
          (sum, item) =>
            sum +
            (item.redeemedWithPoints
              ? item.pointsCost || item.unitPrice * item.qty
              : 0),
          0
        )
      : 0;
    const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
    const earnedPoints = isMember ? totalAmount / 10 : 0;

    let memberPointsAfterRedeem = 0;
    if (isMember && redeemedPoints > 0) {
      const memberRef = ref(db, `members/${trimmedPhone}`);
      const snapshot = await get(memberRef);
      if (!snapshot.exists()) {
        setToast(`ไม่พบสมาชิก #${trimmedPhone}`);
        return;
      }
      const currentPoints = Number(snapshot.val().points || 0);
      if (currentPoints < redeemedPoints) {
        setToast(
          `คะแนนไม่พอสำหรับการแลก (มี ${currentPoints} แต้ม แต่ต้องใช้ ${redeemedPoints} แต้ม)`
        );
        return;
      }
      memberPointsAfterRedeem = currentPoints - redeemedPoints;
    }

    const newOrderData = {
      customerName: isMember ? `สมาชิก #${trimmedPhone}` : 'Guest',
      memberPhoneCode: isMember ? trimmedPhone : '',
      earnedPoints: earnedPoints,
      pointsProcessed: false,
      redeemedPoints: redeemedPoints,
      pointsRefunded: false,
      note: orderNote.trim(),
      items: cart,
      total: totalAmount,
      createdAt: Date.now(),
      status: 'pending',
    };

    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);

    try {
      if (isMember && redeemedPoints > 0) {
        await set(ref(db, `members/${trimmedPhone}`), {
          phone4: trimmedPhone,
          points: memberPointsAfterRedeem,
          updatedAt: Date.now(),
        });
      }
      await set(newOrderRef, newOrderData);
    } catch (err) {
      if (isMember && redeemedPoints > 0) {
        const memberRef = ref(db, `members/${trimmedPhone}`);
        const rollbackSnap = await get(memberRef);
        if (rollbackSnap.exists()) {
          const rollbackPoints = Number(rollbackSnap.val().points || 0);
          await update(memberRef, {
            points: rollbackPoints + redeemedPoints,
            updatedAt: Date.now(),
          });
        }
      }
      setToast('ไม่สามารถส่งออเดอร์ได้ กรุณาลองใหม่อีกครั้ง');
      return;
    }

    setToast(
      redeemedPoints > 0
        ? `ส่งออเดอร์เรียบร้อย! ใช้ ${redeemedPoints} แต้มแลกเมนู และชำระ ฿${totalAmount}`
        : isMember
        ? `ส่งออเดอร์เรียบร้อย! (คุณจะได้รับ +${earnedPoints} แต้มเมื่อบาริสต้ากดรับ/ทำเสร็จ)`
        : 'ส่งออเดอร์เรียบร้อย! (รายการของ Guest)'
    );
    setCart([]);
    setOrderNote('');
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
    } else if (
      status === 'cancelled' &&
      targetOrder.memberPhoneCode &&
      (targetOrder.redeemedPoints || 0) > 0 &&
      !targetOrder.pointsRefunded
    ) {
      // ออเดอร์นี้เคยใช้แต้มแลกเมนูไป — ถ้าโดนยกเลิก ต้องคืนแต้มที่หักไปกลับให้สมาชิก
      const phone4 = targetOrder.memberPhoneCode;
      const pointsToRefund = targetOrder.redeemedPoints || 0;

      const memberRef = ref(db, `members/${phone4}`);
      const snapshot = await get(memberRef);
      const currentPoints = snapshot.exists() ? snapshot.val().points || 0 : 0;

      await set(memberRef, {
        phone4,
        points: currentPoints + pointsToRefund,
        updatedAt: Date.now(),
      });

      const orderRef = ref(db, `orders/${id}`);
      update(orderRef, { status: 'cancelled', pointsRefunded: true });
      setToast(
        `ยกเลิกออเดอร์แล้ว — คืนแต้ม ${pointsToRefund} แต้มให้สมาชิก #${phone4} เรียบร้อย`
      );
    } else {
      const orderRef = ref(db, `orders/${id}`);
      update(orderRef, { status });
      if (status === 'done') sound.playDone();
    }
  }

  /**
   * แก้ไขออเดอร์ย้อนหลัง (รวมถึงออเดอร์ที่กด Done ไปแล้ว) เพื่อแก้ไขข้อผิดพลาด
   * เช่น กดเมนูผิด, จำนวนผิด, ราคาผิด, หรือใส่เบอร์สมาชิกผิด
   * แต้มสะสมจะถูกคำนวณใหม่ให้สอดคล้องกับข้อมูลที่แก้ไขเสมอ:
   *   1) ถ้าออเดอร์เดิมเคยให้แต้มไปแล้ว จะหักแต้มเดิมออกจากสมาชิกคนเดิมก่อน
   *   2) ถ้าสถานะหลังแก้ไขเป็น "done" และมีเบอร์สมาชิก จะคำนวณแต้มใหม่จากยอดใหม่แล้วเติมให้
   */
  async function editOrder(
    id: string,
    updates: {
      customerName: string;
      memberPhoneCode: string;
      items: CartItem[];
      status: OrderStatus;
    }
  ) {
    const original = orders.find((o) => o.id === id);
    if (!original) return;

    const newTotal = updates.items.reduce((sum, i) => sum + i.total, 0);
    const trimmedPhone = updates.memberPhoneCode.trim();
    const isMember = trimmedPhone.length === 4;

    // 1) หักแต้มเดิมออกจากสมาชิกคนเดิม ถ้าออเดอร์นี้เคยประมวลผลแต้มไปแล้ว
    if (original.pointsProcessed && original.memberPhoneCode) {
      const oldMemberRef = ref(db, `members/${original.memberPhoneCode}`);
      const oldSnap = await get(oldMemberRef);
      if (oldSnap.exists()) {
        const oldPoints = oldSnap.val().points || 0;
        const pointsToRevert = original.earnedPoints || original.total / 10;
        await update(oldMemberRef, {
          points: Math.max(0, oldPoints - pointsToRevert),
          updatedAt: Date.now(),
        });
      }
    }

    // 2) ถ้าสถานะหลังแก้ไขคือ "done" และมีเบอร์สมาชิก ให้คำนวณแต้มใหม่แล้วเติมให้
    let newEarnedPoints = 0;
    let pointsProcessed = false;

    if (updates.status === 'done' && isMember) {
      newEarnedPoints = newTotal / 10;
      const memberRef = ref(db, `members/${trimmedPhone}`);
      const snap = await get(memberRef);
      const currentPoints = snap.exists() ? snap.val().points || 0 : 0;
      await set(memberRef, {
        phone4: trimmedPhone,
        points: currentPoints + newEarnedPoints,
        updatedAt: Date.now(),
      });
      pointsProcessed = true;
    }

    // 3) ถ้าสถานะหลังแก้ไขคือ "cancelled" และออเดอร์เดิมเคยใช้แต้มแลกเมนูไป (ยังไม่เคยคืน)
    //    ต้องคืนแต้มที่หักไปกลับให้สมาชิกด้วย
    let pointsRefunded = original.pointsRefunded || false;
    if (
      updates.status === 'cancelled' &&
      original.memberPhoneCode &&
      (original.redeemedPoints || 0) > 0 &&
      !original.pointsRefunded
    ) {
      const refundRef = ref(db, `members/${original.memberPhoneCode}`);
      const refundSnap = await get(refundRef);
      const refundCurrentPoints = refundSnap.exists()
        ? refundSnap.val().points || 0
        : 0;
      await update(refundRef, {
        points: refundCurrentPoints + (original.redeemedPoints || 0),
        updatedAt: Date.now(),
      });
      pointsRefunded = true;
    }

    const orderRef = ref(db, `orders/${id}`);
    await update(orderRef, {
      customerName: updates.customerName.trim() || 'Guest',
      memberPhoneCode: isMember ? trimmedPhone : '',
      items: updates.items,
      total: newTotal,
      status: updates.status,
      earnedPoints: newEarnedPoints,
      pointsProcessed,
      pointsRefunded,
    });

    setToast('แก้ไขออเดอร์เรียบร้อยแล้ว (Order updated)');
  }

  /* ------------------------------------------------------------------ */
  /*  EXPENSE TRACKING FUNCTIONS — บันทึกค่าใช้จ่าย/ต้นทุนประจำวัน       */
  /* ------------------------------------------------------------------ */

  function addExpense(entry: {
    description: string;
    category: ExpenseCategory;
    quantity: number;
    unit: string;
    unitPrice: number;
    date: string;
  }) {
    const total = entry.quantity * entry.unitPrice;
    const expensesRef = ref(db, 'expenses');
    const newExpenseRef = push(expensesRef);
    set(newExpenseRef, {
      description: entry.description.trim() || 'รายการค่าใช้จ่าย',
      category: entry.category,
      quantity: entry.quantity,
      unit: entry.unit.trim(),
      unitPrice: entry.unitPrice,
      total,
      date: entry.date,
      createdAt: Date.now(),
    });
    setToast(
      `บันทึกค่าใช้จ่าย "${entry.description}" (฿${total}) เรียบร้อยแล้ว`
    );
  }

  function deleteExpense(id: string) {
    set(ref(db, `expenses/${id}`), null);
    setToast('ลบรายการค่าใช้จ่ายเรียบร้อยแล้ว');
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
    setToast(
      `อัปเดตเมนู ${updates.nameTh || updates.name || ''} เรียบร้อยแล้ว`
    );
  }

  function addMenuItem(newItem: Omit<MenuItem, 'id'>) {
    const menuListRef = ref(db, 'menuItems');
    const newItemRef = push(menuListRef);
    set(newItemRef, newItem);
    setIsAddingNew(false);
    setToast(`เพิ่มเมนู ${newItem.nameTh} (${newItem.name}) เรียบร้อยแล้ว`);
  }

  function deleteMenuItem(id: string) {
    const item = menu.find((m) => m.id === id);
    set(ref(db, `menuItems/${id}`), null);
    setEditingItem(null);
    setToast(`ลบเมนู ${item?.nameTh || item?.name || ''} เรียบร้อยแล้ว`);
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
          memberInfo={memberInfo}
          openModal={openModal}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
          cart={cart}
          removeFromCart={removeFromCart}
          updateCartQty={updateCartQty}
          submitCartOrder={submitCartOrder}
          redeemCartItem={redeemCartItem}
          unredeemCartItem={unredeemCartItem}
          shopOpen={shopOpen}
          shopMessage={shopMessage}
          orders={orders}
          setToast={setToast}
          orderNote={orderNote}
          setOrderNote={setOrderNote}
        />
      ) : (
        <BaristaContainer
          user={user}
          authLoading={authLoading}
          menu={menu}
          toggleStock={toggleStock}
          baristaTab={baristaTab}
          setBaristaTab={setBaristaTab}
          activeOrders={activeOrders}
          allOrders={orders}
          advanceOrder={advanceOrder}
          editOrder={editOrder}
          expenses={expenses}
          addExpense={addExpense}
          deleteExpense={deleteExpense}
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
          availablePoints={memberInfo?.points ?? 0}
          onClose={closeModal}
          onAddToCart={addToCart}
          onInstantOrder={handleInstantOrder}
          orderNote={orderNote}
          setOrderNote={setOrderNote}
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
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] px-5 py-3.5 rounded-2xl bg-[#0D1117] border border-emerald-400/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] flex items-center gap-2.5 text-base font-bold animate-bounce">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WELCOME POPUP COMPONENT                                           */
/* ------------------------------------------------------------------ */

function WelcomeModal({
  onSelectMember,
  onSelectGuest,
}: {
  onSelectMember: (phone: string) => void;
  onSelectGuest: () => void;
}) {
  const [step, setStep] = useState<'choose' | 'inputPhone'>('choose');
  const [phoneInput, setPhoneInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  function handleConfirmPhone() {
    const clean = phoneInput.trim();
    if (clean.length !== 4) {
      setErrorMsg('กรุณากรอกเบอร์โทร 4 ตัวท้ายให้ครบถ้วน');
      return;
    }
    onSelectMember(clean);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative w-full max-w-sm bg-[#0D1117] border border-amber-400/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center animate-fadeIn">
        {step === 'choose' ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Gift size={36} />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              ยินดีต้อนรับ!
            </h2>
            <p className="text-sm text-neutral-300 font-semibold mb-6">
              ต้องการสะสมแต้มสำหรับออเดอร์นี้หรือไม่?
              <br />
              <span className="text-xs text-amber-300 font-normal">
                (ซื้อครบทุก 10 บาท = 1 คะแนน)
              </span>
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setStep('inputPhone')}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all active:scale-[0.98]"
              >
                <Award size={20} /> สะสมแต้ม
              </button>

              <button
                onClick={onSelectGuest}
                className="w-full py-3.5 px-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-neutral-300 hover:text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <UserX size={20} /> ไม่สะสมแต้ม (Guest)
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Phone size={32} />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              กรอกเบอร์โทร
            </h2>
            <p className="text-sm text-neutral-300 font-semibold mb-5">
              ระบุเบอร์โทรศัพท์ 4 ตัวท้ายเพื่อใช้สะสมแต้ม
            </p>

            <div className="mb-4">
              <input
                type="text"
                inputMode="numeric"
                value={phoneInput}
                autoFocus
                onChange={(e) => {
                  setErrorMsg('');
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 4) setPhoneInput(val);
                }}
                maxLength={4}
                placeholder="เช่น 1234"
                className="w-full text-center py-3 rounded-2xl bg-white/[0.05] border border-amber-400/40 text-2xl font-mono font-black text-amber-300 placeholder:text-neutral-600 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              {errorMsg && (
                <p className="text-xs text-rose-400 font-bold mt-2">
                  {errorMsg}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setStep('choose');
                  setErrorMsg('');
                }}
                className="flex-1 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-neutral-300 font-bold text-sm"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleConfirmPhone}
                className="flex-1 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-sm shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              >
                ยืนยัน
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface CustomerViewProps {
  menu: MenuItem[];
  memberPhoneCode: string;
  setMemberPhoneCode: (code: string) => void;
  memberInfo: MemberData | null;
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
  setToast: (msg: string) => void;
  orderNote: string;
  setOrderNote: (note: string) => void;
  redeemCartItem: (cartId: string) => void;
  unredeemCartItem: (cartId: string) => void;
}

function CustomerView({
  menu,
  memberPhoneCode,
  setMemberPhoneCode,
  memberInfo,
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
  setToast,
  orderNote,
  setOrderNote,
  redeemCartItem,
  unredeemCartItem,
}: CustomerViewProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );

  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);

  useEffect(() => {
    const hasPrompted = sessionStorage.getItem('cof_welcome_prompted');
    if (!hasPrompted) {
      setShowWelcomeModal(true);
    }
  }, []);

  function handleWelcomeMember(phone4: string) {
    setMemberPhoneCode(phone4);
    sessionStorage.setItem('cof_welcome_prompted', 'true');
    setShowWelcomeModal(false);
    setToast(`ยินดีต้อนรับสมาชิก #${phone4}`);
  }

  function handleWelcomeGuest() {
    setMemberPhoneCode('');
    sessionStorage.setItem('cof_welcome_prompted', 'true');
    setShowWelcomeModal(false);
    setToast('เข้าใช้งานในฐานะ Guest');
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const totalCartItems = cart.reduce((sum, i) => sum + i.qty, 0);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'pending').length;
  }, [orders]);

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
      {showWelcomeModal && (
        <WelcomeModal
          onSelectMember={handleWelcomeMember}
          onSelectGuest={handleWelcomeGuest}
        />
      )}

      {/* Header */}
      <div className="pb-6 mb-6 border-b border-white/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img
              src="/logo.png"
              alt="Cof N' Rob Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-2xl bg-amber-400/10 p-1 border border-amber-400/30 shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white">
                Cof N&apos; Rob{' '}
                <span className="text-amber-400">Coffee Bar</span>
              </h1>
              <p className="text-sm font-semibold text-neutral-300 mt-1">
                สะสมแต้มง่ายๆ: ซื้อครบทุก 10 บาท = 1 คะแนน
              </p>

              <div className="mt-3 max-w-xs">
                <div className="relative">
                  <Phone
                    size={16}
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
                    placeholder="กรอกเบอร์โทร 4 ตัวท้าย (Guest หากไม่กรอก)"
                    maxLength={4}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm font-mono font-bold text-amber-300 placeholder:text-neutral-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
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
              <span className="hidden sm:inline text-sm font-bold font-mono">
                ฿{cartTotal}
              </span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm font-bold text-neutral-200">
              <Users size={16} className="text-amber-400" />
              <span>
                คิวรอ:{' '}
                <span className="font-mono font-black text-amber-400 text-base">
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

        {memberPhoneCode.trim().length === 4 ? (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-400/30 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-400">
                <Award size={26} />
              </div>
              <div>
                <span className="text-sm text-neutral-300 font-bold block">
                  สมาชิกเบอร์ท้าย #{memberPhoneCode}
                </span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {memberInfo ? memberInfo.points : 0}{' '}
                  <span className="text-sm font-semibold text-amber-200">
                    คะแนนสะสม
                  </span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-neutral-300 block flex items-center gap-1 justify-end font-semibold">
                <History size={14} /> เคยสั่งซื้อทั้งหมด
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {memberHistory.length} ออเดอร์
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs font-semibold text-neutral-400">
            <span>สถานะปัจจุบัน: Guest (ไม่ได้สะสมแต้ม)</span>
            <button
              onClick={() => setShowWelcomeModal(true)}
              className="text-amber-400 font-bold hover:underline"
            >
              คลิกเพื่อใส่เบอร์สะสมแต้ม
            </button>
          </div>
        )}
      </div>

      {!shopOpen && (
        <div className="mb-8 p-6 rounded-3xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left shadow-[0_0_40px_rgba(244,63,94,0.2)]">
          <div className="p-4 rounded-2xl bg-rose-500/20 text-rose-400 shrink-0">
            <XCircle size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-wide">
              วันนี้ร้านปิดให้บริการ (Shop is Closed)
            </h2>
            <p className="text-base text-rose-200 mt-1 font-bold whitespace-pre-wrap">
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
            <h2 className="text-lg font-extrabold text-neutral-200 mb-4">
              เลือกหมวดหมู่เครื่องดื่ม (Select Category)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      <h3 className="text-2xl font-black text-white tracking-wide">
                        {meta.labelTh}
                      </h3>
                      <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest mt-1">
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] text-amber-400 text-sm font-extrabold transition-all"
              >
                <ArrowLeft size={18} /> กลับไปเลือกหมวดหมู่
              </button>

              <div className="flex items-center gap-2">
                {MAIN_GROUPS.map((catKey) => {
                  const meta = CATEGORY_META[catKey];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={catKey}
                      onClick={() => setSelectedCategory(catKey)}
                      className={`p-2 sm:px-3 sm:py-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs sm:text-sm font-bold ${
                        selectedCategory === catKey
                          ? 'bg-amber-400 border-amber-400 text-black'
                          : 'bg-white/[0.03] border-white/10 text-neutral-300 hover:text-white'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="hidden sm:inline">{meta.labelTh}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2.5 mb-5">
              {(() => {
                const meta = CATEGORY_META[selectedCategory];
                const Icon = meta.icon;
                return (
                  <>
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
                      <Icon size={22} />
                    </span>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-wide">
                        {meta.labelTh}
                      </h2>
                      <p className="text-xs text-neutral-400">{meta.label}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
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
            <h3 className="text-base font-extrabold text-amber-400 mb-3 flex items-center gap-2">
              <History size={18} /> ประวัติการสั่งซื้อย้อนหลังของคุณ (เบอร์ท้าย
              #{memberPhoneCode})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {memberHistory.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-sm"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-neutral-400 font-semibold">
                      {fmtDate(o.createdAt)}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
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
                      <div key={idx} className="truncate">
                        <span className="text-base font-extrabold text-white">
                          {i.qty > 1 ? `${i.qty}× ` : ''}
                          {i.nameTh}
                        </span>
                        <span className="text-xs text-neutral-400 font-normal ml-1.5">
                          ({i.name})
                        </span>{' '}
                        <span
                          className={`text-xs font-bold ${sweetnessColor(
                            i.sweetness
                          )}`}
                        >
                          (หวาน {i.sweetness}%)
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-amber-400 font-mono font-bold mt-1.5 text-base">
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
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag size={22} className="text-amber-400" />
                รายการที่สั่งไว้ (Cart)
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400"
              >
                <X size={18} />
              </button>
            </div>

            {!shopOpen && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 text-sm font-bold text-center">
                ร้านปิดอยู่ ไม่สามารถส่งออเดอร์ได้ในขณะนี้
              </div>
            )}

            {cart.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl text-neutral-400 my-2">
                <ShoppingBag size={36} className="mx-auto mb-2 opacity-40" />
                <p className="text-base font-bold">ยังไม่มีรายการในตะกร้า</p>
                <p className="text-xs text-neutral-400 mt-1">
                  เลือกเครื่องดื่มจากเมนูด้านหลัง
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 mb-4">
                {cart.map((item) => (
                  <div
                    key={item.cartId}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-black text-white truncate">
                        {item.nameTh}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-amber-300">
                          หวาน {item.sweetness}%
                        </span>
                        {item.redeemedWithPoints ? (
                          <span className="text-xs font-black text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 px-2 py-0.5 rounded">
                            🎁 ใช้แต้ม {item.pointsCost} แต้ม · ฿0
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400 font-mono">
                            ฿{item.unitPrice}/แก้ว
                          </span>
                        )}
                        {memberPhoneCode.trim().length === 4 && (
                          <button
                            onClick={() =>
                              item.redeemedWithPoints
                                ? unredeemCartItem(item.cartId)
                                : redeemCartItem(item.cartId)
                            }
                            className={`mt-2 px-2.5 py-1 rounded-lg text-[11px] font-black border transition-colors ${
                              item.redeemedWithPoints
                                ? 'bg-rose-500/10 border-rose-400/30 text-rose-300 hover:bg-rose-500/20'
                                : 'bg-amber-400/10 border-amber-400/30 text-amber-300 hover:bg-amber-400/20'
                            }`}
                          >
                            {item.redeemedWithPoints
                              ? 'ยกเลิกใช้แต้ม'
                              : `🎁 ใช้ ${
                                  (item.originalUnitPrice ?? item.unitPrice) *
                                  item.qty
                                } แต้มแลกเมนูนี้`}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white/[0.06] rounded-lg px-1.5 py-0.5">
                        <button
                          onClick={() => updateCartQty(item.cartId, -1)}
                          className="p-1 text-neutral-300 hover:text-white"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-mono font-bold w-4 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.cartId, 1)}
                          className="p-1 text-neutral-300 hover:text-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="text-base font-mono font-black text-amber-400 min-w-[50px] text-right">
                        ฿{item.total}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="p-1 text-neutral-500 hover:text-rose-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="pt-4 border-t border-white/10 mt-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-neutral-300">
                    ราคารวมทั้งหมด
                  </span>
                  <span className="text-2xl font-mono font-black text-amber-400">
                    ฿{cartTotal}
                  </span>
                </div>

                {cart.some((item) => item.redeemedWithPoints) && (
                  <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-black">
                    🎁 ใช้แต้มแลกแล้ว{' '}
                    {cart.reduce(
                      (sum, item) =>
                        sum +
                        (item.redeemedWithPoints ? item.pointsCost || 0 : 0),
                      0
                    )}{' '}
                    แต้ม · เมนูที่แลกคิดราคา ฿0
                  </div>
                )}

                <div className="mb-4 text-xs sm:text-sm text-emerald-400 font-bold flex items-center gap-1.5">
                  <Award size={16} />{' '}
                  {memberPhoneCode.trim().length === 4
                    ? `จะได้รับคะแนนสะสม: +${cartTotal / 10} คะแนน`
                    : 'สั่งซื้อในฐานะ Guest (ไม่ได้รับคะแนน)'}
                </div>

                <button
                  disabled={!shopOpen}
                  onClick={() => {
                    submitCartOrder();
                    setIsCartOpen(false);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-lg transition-transform shadow-lg ${
                    shopOpen
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black active:scale-[0.98] shadow-[0_0_25px_-5px_rgba(245,158,11,0.6)]'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  <Send size={20} />{' '}
                  {shopOpen
                    ? 'ส่งออเดอร์ · Send Order'
                    : 'ร้านปิดอยู่ (Closed)'}
                </button>

                <input
                  type="text"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="ฝากข้อความถึงบาริสต้า (ถ้ามี)"
                  maxLength={120}
                  className="w-full mt-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
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
      className={`text-left rounded-2xl p-4 border ${bt.grad} active:scale-[0.97] transition-all min-h-[105px] flex flex-col justify-between`}
    >
      <div>
        <p className={`text-lg sm:text-xl font-black leading-tight ${bt.text}`}>
          {item.nameTh}
        </p>
        <p className={`text-xs mt-0.5 opacity-90 ${bt.sub}`}>{item.name}</p>
      </div>
      <p className={`text-base mt-2 font-mono ${bt.price}`}>฿{item.price}</p>
    </button>
  );
}

interface CustomizeModalProps {
  item: MenuItem;
  sweetness: number;
  setSweetness: (val: number) => void;
  qty: number;
  setQty: (val: number) => void;
  availablePoints: number;
  onClose: () => void;
  onAddToCart: () => void;
  onInstantOrder: (usePoints: boolean) => void;
  orderNote: string;
  setOrderNote: (note: string) => void;
}

function CustomizeModal({
  item,
  sweetness,
  setSweetness,
  qty,
  setQty,
  availablePoints,
  onClose,
  onAddToCart,
  onInstantOrder,
  orderNote,
  setOrderNote,
}: CustomizeModalProps) {
  const total = item.price * qty;
  const activeSweetPresets = getSweetPresetsForItem(item.name);
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const canRedeem = availablePoints >= total && total > 0;

  useEffect(() => {
    setUsePoints(false);
  }, [item.id, qty]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md bg-[#0D1117] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto shadow-[0_0_60px_-10px_rgba(0,0,0,0.9)]">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-2xl font-black text-white">{item.nameTh}</h3>
            <p className="text-xs text-neutral-400 font-medium">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400"
          >
            <X size={18} />
          </button>
        </div>
        <span className="inline-block mt-2 text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300">
          ฿{item.price} / แก้ว
        </span>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-neutral-200">
              ระดับความหวาน · Sweetness
            </span>
            <span
              className={`font-mono font-extrabold text-xl ${sweetnessColor(
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
            className="w-full accent-amber-400 h-2.5 bg-white/10 rounded-lg cursor-pointer"
          />
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {activeSweetPresets.map((p) => (
              <button
                key={p.value}
                onClick={() => setSweetness(p.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  sweetness === p.value
                    ? 'bg-amber-400 border-amber-400 text-black font-black'
                    : 'bg-white/[0.03] border-white/10 text-neutral-200 hover:border-white/30'
                }`}
              >
                {p.label}{' '}
                <span className="text-xs opacity-80">{p.labelTh}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm font-bold text-neutral-200">
            จำนวน · Quantity
          </span>
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-2.5 py-1.5">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="p-1 text-neutral-300 hover:text-white"
            >
              <Minus size={16} />
            </button>
            <span className="w-6 text-center font-mono text-base font-bold">
              {qty}
            </span>
            <button
              onClick={() => setQty(Math.min(20, qty + 1))}
              className="p-1 text-neutral-300 hover:text-white"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-base">
          <span className="text-neutral-300 font-bold">ราคารวม</span>
          <span className="font-mono font-black text-2xl text-amber-400">
            {usePoints ? '🎁 0 บาท' : `฿${total}`}
          </span>
        </div>

        {canRedeem && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setUsePoints((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-colors ${
                usePoints
                  ? 'bg-rose-500/10 border-rose-400/30 text-rose-300 hover:bg-rose-500/20'
                  : 'bg-amber-400/10 border-amber-400/30 text-amber-300 hover:bg-amber-400/20'
              }`}
            >
              {usePoints ? 'ยกเลิกใช้แต้ม' : `🎁 ใช้ ${total} แต้มแลกฟรี`}
            </button>
          </div>
        )}
        {!canRedeem && availablePoints > 0 && total > 0 && (
          <p className="mt-2 text-right text-xs text-neutral-500">
            แต้มไม่พอสำหรับแลกฟรี (มี {availablePoints} / ต้องการ {total} แต้ม)
          </p>
        )}

        <div className="mt-5">
          <input
            type="text"
            value={orderNote}
            onChange={(e) => setOrderNote(e.target.value)}
            placeholder="ฝากข้อความถึงบาริสต้า (ถ้ามี)"
            maxLength={120}
            className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onAddToCart}
            className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white font-extrabold text-sm sm:text-base active:scale-[0.98] transition-all"
          >
            <Plus size={18} /> เพิ่มลงตะกร้า
          </button>
          <button
            onClick={() => onInstantOrder(usePoints)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm sm:text-base active:scale-[0.98] transition-all shadow-[0_0_25px_-5px_rgba(245,158,11,0.6)]"
          >
            <Send size={18} /> สั่งทันที
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FIREBASE AUTH LOGIN FORM                                          */
/* ------------------------------------------------------------------ */

function LoginScreen({ setToast }: { setToast: (msg: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setToast('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setToast('เข้าสู่ระบบสำเร็จ (Logged in successfully)');
    } catch (err: any) {
      setToast(`เข้าสู่ระบบไม่สำเร็จ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0D1117] border border-teal-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(20,184,166,0.15)]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-400/10 border border-teal-400/30 flex items-center justify-center text-teal-400">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black text-white">
            Barista Portal Login
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            กรุณาเข้าสู่ระบบด้วยบัญชี Firebase Authentication เพื่อจัดการร้าน
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="barista@cofnrob.com"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-black font-black text-base transition-all shadow-[0_0_20px_rgba(20,184,166,0.4)] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (Sign In)'}
          </button>
        </form>
      </div>
    </div>
  );
}

interface BaristaContainerProps {
  user: any;
  authLoading: boolean;
  menu: MenuItem[];
  toggleStock: (id: string) => void;
  baristaTab: 'orders' | 'points' | 'stock' | 'editor' | 'expenses';
  setBaristaTab: (
    tab: 'orders' | 'points' | 'stock' | 'editor' | 'expenses'
  ) => void;
  activeOrders: Order[];
  allOrders: Order[];
  advanceOrder: (id: string, status: OrderStatus) => void;
  editOrder: (
    id: string,
    updates: {
      customerName: string;
      memberPhoneCode: string;
      items: CartItem[];
      status: OrderStatus;
    }
  ) => void;
  expenses: Expense[];
  addExpense: (entry: {
    description: string;
    category: ExpenseCategory;
    quantity: number;
    unit: string;
    unitPrice: number;
    date: string;
  }) => void;
  deleteExpense: (id: string) => void;
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

function BaristaContainer({
  user,
  authLoading,
  menu,
  toggleStock,
  baristaTab,
  setBaristaTab,
  activeOrders,
  allOrders,
  advanceOrder,
  editOrder,
  expenses,
  addExpense,
  deleteExpense,
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
}: BaristaContainerProps) {
  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-teal-400 font-bold text-lg animate-pulse">
        กำลังตรวจสอบสถานะการเข้าสู่ระบบ...
      </div>
    );
  }

  if (!user) {
    return <LoginScreen setToast={setToast} />;
  }

  return (
    <BaristaView
      user={user}
      menu={menu}
      toggleStock={toggleStock}
      baristaTab={baristaTab}
      setBaristaTab={setBaristaTab}
      activeOrders={activeOrders}
      allOrders={allOrders}
      advanceOrder={advanceOrder}
      editOrder={editOrder}
      expenses={expenses}
      addExpense={addExpense}
      deleteExpense={deleteExpense}
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
  );
}

interface BaristaViewProps {
  user: any;
  menu: MenuItem[];
  toggleStock: (id: string) => void;
  baristaTab: 'orders' | 'points' | 'stock' | 'editor' | 'expenses';
  setBaristaTab: (
    tab: 'orders' | 'points' | 'stock' | 'editor' | 'expenses'
  ) => void;
  activeOrders: Order[];
  allOrders: Order[];
  advanceOrder: (id: string, status: OrderStatus) => void;
  editOrder: (
    id: string,
    updates: {
      customerName: string;
      memberPhoneCode: string;
      items: CartItem[];
      status: OrderStatus;
    }
  ) => void;
  expenses: Expense[];
  addExpense: (entry: {
    description: string;
    category: ExpenseCategory;
    quantity: number;
    unit: string;
    unitPrice: number;
    date: string;
  }) => void;
  deleteExpense: (id: string) => void;
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
  user,
  menu,
  toggleStock,
  baristaTab,
  setBaristaTab,
  activeOrders,
  allOrders,
  advanceOrder,
  editOrder,
  expenses,
  addExpense,
  deleteExpense,
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
    'today' | 'yesterday' | 'custom' | 'monthly' | 'all'
  >('today');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
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

  async function handleLogout() {
    try {
      await signOut(auth);
      setToast('ออกจากระบบเรียบร้อยแล้ว');
    } catch (err: any) {
      setToast(`เกิดข้อผิดพลาดในการออกจากระบบ: ${err.message}`);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-16">
      <div className="pt-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Cof N' Rob Logo"
            className="w-10 h-10 object-contain rounded-xl bg-teal-400/10 p-1 border border-teal-400/30 shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Coffee size={24} className="text-teal-400" /> Cof N&apos; Rob —
              Barista Display Dashboard
            </h1>
            <p className="text-sm font-medium text-neutral-300 mt-1 flex items-center gap-1.5">
              <Radio size={14} className="text-emerald-400 animate-pulse" />{' '}
              Live feed synced with customer terminals (Logged in as:{' '}
              <span className="text-teal-300 font-bold">{user?.email}</span>)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={toggleShopStatus}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold border transition-all ${
              shopOpen
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-rose-500/20 border-rose-400/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                shopOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
              }`}
            />
            {shopOpen ? 'เปิดร้านอยู่ (Open)' : 'ปิดร้านแล้ว (Closed)'}
          </button>

          <span className="font-mono text-neutral-200 flex items-center gap-1.5 bg-white/[0.04] px-3.5 py-2 rounded-xl border border-white/10">
            <Clock size={16} /> {fmtClock(clock)}
          </span>
          <button
            onClick={() => setSoundOn(!soundOn)}
            title={soundOn ? 'ปิดเสียง' : 'เปิดเสียง'}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white"
          >
            {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            onClick={handleLogout}
            title="ออกจากระบบ"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold transition-colors"
          >
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-neutral-300 mb-1.5">
            ข้อความแจ้งหน้าร้านเมื่อปิด (เช่น ปิด 3 วัน, ปิดให้บริการชั่วคราว
            ฯลฯ)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tempMsg}
              onChange={(e) => setTempMsg(e.target.value)}
              placeholder="ระบุรายละเอียดการปิดร้าน..."
              className="flex-1 rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button
              onClick={() => updateShopMessage(tempMsg)}
              className="px-4 py-2.5 rounded-xl bg-teal-500 text-black text-sm font-bold hover:bg-teal-400 transition-colors shrink-0"
            >
              บันทึกข้อความ
            </button>
          </div>
        </div>
      </div>

      {/* Barista Nav Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 mt-5 rounded-2xl bg-white/[0.04] border border-white/10 w-fit">
        <button
          onClick={() => setBaristaTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            baristaTab === 'orders'
              ? 'bg-teal-400 text-black'
              : 'text-neutral-300 hover:text-neutral-100'
          }`}
        >
          <ListChecks size={16} /> Live Orders & History
        </button>

        <button
          onClick={() => setBaristaTab('points')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            baristaTab === 'points'
              ? 'bg-amber-400 text-black'
              : 'text-neutral-300 hover:text-neutral-100'
          }`}
        >
          <Award size={16} /> จัดการแต้มสะสม (Add / Redeem Points)
        </button>

        <button
          onClick={() => setBaristaTab('stock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            baristaTab === 'stock'
              ? 'bg-teal-400 text-black'
              : 'text-neutral-300 hover:text-neutral-100'
          }`}
        >
          <Settings2 size={16} /> Hide / Show Menu
        </button>

        <button
          onClick={() => setBaristaTab('editor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            baristaTab === 'editor'
              ? 'bg-teal-400 text-black'
              : 'text-neutral-300 hover:text-neutral-100'
          }`}
        >
          <Pencil size={16} /> Edit Menu & Prices
        </button>

        <button
          onClick={() => setBaristaTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            baristaTab === 'expenses'
              ? 'bg-rose-400 text-black'
              : 'text-neutral-300 hover:text-neutral-100'
          }`}
        >
          <Receipt size={16} /> บันทึกค่าใช้จ่าย (Expenses)
        </button>
      </div>

      {baristaTab === 'orders' && (
        <OrdersFeed
          menu={menu}
          activeOrders={activeOrders}
          allOrders={allOrders}
          advanceOrder={advanceOrder}
          editOrder={editOrder}
          now={now}
          historyFilter={historyFilter}
          setHistoryFilter={setHistoryFilter}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
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

      {baristaTab === 'expenses' && (
        <ExpenseTracker
          expenses={expenses}
          addExpense={addExpense}
          deleteExpense={deleteExpense}
          now={now}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  EXPENSE TRACKER — บันทึกค่าใช้จ่ายในการซื้อวัตถุดิบ/ค่าใช้จ่ายร้าน  */
/* ------------------------------------------------------------------ */

const EXPENSE_CATEGORY_META: Record<
  ExpenseCategory,
  { icon: LucideIcon; label: string; colorCls: string; chipCls: string }
> = {
  ingredient: {
    icon: ShoppingBag,
    label: 'วัตถุดิบ (นม/กาแฟ/น้ำ ฯลฯ)',
    colorCls: 'text-teal-300',
    chipCls: 'bg-teal-500/15 border-teal-400/30 text-teal-300',
  },
  rent: {
    icon: Home,
    label: 'ค่าเช่าร้าน',
    colorCls: 'text-amber-300',
    chipCls: 'bg-amber-500/15 border-amber-400/30 text-amber-300',
  },
  utility: {
    icon: Zap,
    label: 'ค่าน้ำ/ค่าไฟ/สาธารณูปโภค',
    colorCls: 'text-sky-300',
    chipCls: 'bg-sky-500/15 border-sky-400/30 text-sky-300',
  },
  other: {
    icon: Tag,
    label: 'อื่นๆ',
    colorCls: 'text-neutral-300',
    chipCls: 'bg-white/10 border-white/20 text-neutral-300',
  },
};

function ExpenseTracker({
  expenses,
  addExpense,
  deleteExpense,
  now,
}: {
  expenses: Expense[];
  addExpense: (entry: {
    description: string;
    category: ExpenseCategory;
    quantity: number;
    unit: string;
    unitPrice: number;
    date: string;
  }) => void;
  deleteExpense: (id: string) => void;
  now: number;
}) {
  const todayStr = new Date(now).toISOString().split('T')[0];

  const [category, setCategory] = useState<ExpenseCategory>('ingredient');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(todayStr);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<number>(0);

  const [historyFilter, setHistoryFilter] = useState<
    'today' | 'yesterday' | 'custom' | 'monthly' | 'all'
  >('today');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    todayStr.slice(0, 7)
  );

  const previewTotal = Math.max(0, quantity) * Math.max(0, unitPrice);

  function handleSubmit() {
    if (!description.trim()) {
      alert('กรุณาระบุรายละเอียดค่าใช้จ่าย เช่น "นมสด 10 ลิตร"');
      return;
    }
    if (quantity <= 0 || unitPrice < 0) {
      alert('กรุณาระบุจำนวนและราคาให้ถูกต้อง');
      return;
    }
    addExpense({ description, category, quantity, unit, unitPrice, date });
    setDescription('');
    setQuantity(1);
    setUnit('');
    setUnitPrice(0);
  }

  const filteredExpenses = useMemo(() => {
    if (historyFilter === 'all') return expenses;

    const nowDate = new Date(now);
    const startOfToday = new Date(
      nowDate.getFullYear(),
      nowDate.getMonth(),
      nowDate.getDate()
    ).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000;

    if (historyFilter === 'today') {
      return expenses.filter(
        (e) =>
          e.date === todayStr ||
          (e.createdAt >= startOfToday && e.createdAt < endOfToday)
      );
    }
    if (historyFilter === 'yesterday') {
      const yStart = startOfToday - 24 * 60 * 60 * 1000;
      const yDateStr = new Date(yStart).toISOString().split('T')[0];
      return expenses.filter(
        (e) =>
          e.date === yDateStr ||
          (e.createdAt >= yStart && e.createdAt < startOfToday)
      );
    }
    if (historyFilter === 'custom') {
      return expenses.filter((e) => e.date === selectedDate);
    }
    if (historyFilter === 'monthly') {
      return expenses.filter((e) => e.date.startsWith(selectedMonth));
    }
    return expenses;
  }, [expenses, historyFilter, selectedDate, selectedMonth, now, todayStr]);

  const totalForPeriod = filteredExpenses.reduce((s, e) => s + e.total, 0);
  const byCategory = useMemo(() => {
    const map: Record<ExpenseCategory, number> = {
      ingredient: 0,
      rent: 0,
      utility: 0,
      other: 0,
    };
    filteredExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.total;
    });
    return map;
  }, [filteredExpenses]);

  return (
    <div className="mt-6 grid lg:grid-cols-[380px_1fr] gap-5">
      {/* ฟอร์มบันทึกรายการใหม่ */}
      <div className="rounded-2xl bg-[#0D1117] border border-white/10 p-5 h-fit">
        <h2 className="text-base font-extrabold text-rose-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Receipt size={18} /> บันทึกค่าใช้จ่ายใหม่
        </h2>

        <label className="block text-xs font-bold text-neutral-400 mb-1.5">
          หมวดหมู่
        </label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(Object.keys(EXPENSE_CATEGORY_META) as ExpenseCategory[]).map(
            (cat) => {
              const meta = EXPENSE_CATEGORY_META[cat];
              const Icon = meta.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    category === cat
                      ? meta.chipCls
                      : 'bg-white/[0.03] border-white/10 text-neutral-500 hover:border-white/25'
                  }`}
                >
                  <Icon size={14} /> {meta.label}
                </button>
              );
            }
          )}
        </div>

        <label className="block text-xs font-bold text-neutral-400 mb-1.5">
          รายละเอียด
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='เช่น "นมสด ตราหมี", "ค่าเช่าร้านเดือน ส.ค."'
          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-neutral-600 mb-4 focus:outline-none focus:ring-2 focus:ring-rose-400"
        />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1.5">
              วันที่ซื้อ
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1.5">
              หน่วย (ไม่บังคับ)
            </label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="ลิตร / ถุง / ครั้ง"
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1.5">
              จำนวน
            </label>
            <input
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1.5">
              ราคา/หน่วย (฿)
            </label>
            <input
              type="number"
              min={0}
              value={unitPrice}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 pt-3 border-t border-white/10">
          <span className="text-sm text-neutral-400 font-bold">รวม</span>
          <span className="font-mono font-black text-xl text-rose-300">
            ฿{previewTotal.toFixed(0)}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-rose-400 to-rose-300 text-black font-black text-sm active:scale-[0.98] transition-transform shadow-[0_0_25px_-5px_rgba(244,63,94,0.5)]"
        >
          <Save size={16} /> บันทึกรายการ
        </button>
      </div>

      {/* ประวัติ + สรุปยอดรวม */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-[#0D1117] border border-rose-400/30 flex flex-col">
              <span className="font-mono font-black text-xl text-rose-300">
                ฿{totalForPeriod.toFixed(0)}
              </span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wide">
                รวมค่าใช้จ่ายช่วงที่เลือก
              </span>
            </div>
            {(Object.keys(EXPENSE_CATEGORY_META) as ExpenseCategory[]).map(
              (cat) => {
                const meta = EXPENSE_CATEGORY_META[cat];
                if (byCategory[cat] <= 0) return null;
                return (
                  <div
                    key={cat}
                    className="px-3.5 py-2.5 rounded-xl bg-[#0D1117] border border-white/10 flex flex-col"
                  >
                    <span
                      className={`font-mono font-black text-base ${meta.colorCls}`}
                    >
                      ฿{byCategory[cat].toFixed(0)}
                    </span>
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wide">
                      {meta.label}
                    </span>
                  </div>
                );
              }
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.04] p-1.5 rounded-xl border border-white/10 text-xs">
            <span className="text-neutral-300 px-2 flex items-center gap-1 font-bold">
              <Calendar size={14} className="text-rose-400" /> ตัวกรอง:
            </span>
            <button
              onClick={() => setHistoryFilter('today')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                historyFilter === 'today'
                  ? 'bg-rose-400 text-black shadow-md'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              วันนี้
            </button>
            <button
              onClick={() => setHistoryFilter('yesterday')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                historyFilter === 'yesterday'
                  ? 'bg-rose-400 text-black shadow-md'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              เมื่อวาน
            </button>
            <button
              onClick={() => setHistoryFilter('custom')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                historyFilter === 'custom'
                  ? 'bg-rose-400 text-black shadow-md'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              เลือกวันเอง
            </button>
            <button
              onClick={() => setHistoryFilter('monthly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                historyFilter === 'monthly'
                  ? 'bg-rose-400 text-black shadow-md'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              รายเดือน
            </button>
            <button
              onClick={() => setHistoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                historyFilter === 'all'
                  ? 'bg-rose-400 text-black shadow-md'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              ทั้งหมด
            </button>

            {historyFilter === 'custom' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="ml-1 bg-white/[0.06] border border-rose-400/40 text-rose-300 px-2.5 py-1 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-rose-400 cursor-pointer"
              />
            )}
            {historyFilter === 'monthly' && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="ml-1 bg-white/[0.06] border border-rose-400/40 text-rose-300 px-2.5 py-1 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-rose-400 cursor-pointer"
              />
            )}
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl text-neutral-400 text-sm font-bold">
            ไม่พบรายการค่าใช้จ่ายในช่วงเวลาที่เลือก
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExpenses.map((e) => {
              const meta = EXPENSE_CATEGORY_META[e.category];
              const Icon = meta.icon;
              return (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-[#0D1117] border border-white/10 px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${meta.chipCls}`}
                    >
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-white truncate">
                        {e.description}
                      </p>
                      <p className="text-xs text-neutral-400 font-mono">
                        {e.date} · {e.quantity}
                        {e.unit ? ` ${e.unit}` : ''} × ฿{e.unitPrice}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-black text-base text-rose-300">
                      ฿{e.total.toFixed(0)}
                    </span>
                    <button
                      onClick={() => deleteExpense(e.id)}
                      title="ลบรายการนี้"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-neutral-500 hover:text-rose-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
        <h2 className="text-xl font-black text-amber-400 flex items-center gap-2 mb-1">
          <Award size={22} /> ระบบจัดการแต้มสะสมสมาชิก (Manage Points)
        </h2>
        <p className="text-sm font-semibold text-neutral-300 mb-6">
          สำหรับบาริสต้าใช้เพิ่มแต้มอิสระ
          หรือตัดคะแนนสะสมเมื่อลูกค้านำแต้มมาแลกส่วนลด
        </p>

        <div className="space-y-2 mb-6">
          <label className="text-sm font-bold text-neutral-200 block">
            ค้นหารหัสสมาชิก (เบอร์โทร 4 ตัวท้าย)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
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
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-base font-mono font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black text-sm font-black rounded-xl transition-all flex items-center gap-1.5 shrink-0"
            >
              <Search size={16} /> ค้นหา
            </button>
          </div>
        </div>

        {member && (
          <div className="pt-5 border-t border-white/10 space-y-6 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between">
              <div>
                <span className="text-sm text-neutral-300 block font-bold">
                  สมาชิกหมายเลข
                </span>
                <span className="text-xl font-black text-white font-mono">
                  #{member.phone4}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm text-amber-300 block font-bold">
                  คะแนนสะสมคงเหลือ
                </span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {member.points}{' '}
                  <span className="text-sm font-semibold text-amber-200">
                    แต้ม
                  </span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
              <label className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                <PlusCircle size={16} /> บวกแต้มสะสมเพิ่ม (Add Points)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={pointsToAdd}
                  onChange={(e) =>
                    setPointsToAdd(Math.max(1, Number(e.target.value)))
                  }
                  className="w-32 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-lg font-mono font-bold text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="text-sm font-bold text-neutral-300">
                  คะแนน
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[10, 20, 50, 100].map((pts) => (
                  <button
                    key={pts}
                    onClick={() => setPointsToAdd(pts)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                  >
                    +{pts} แต้ม
                  </button>
                ))}
              </div>

              <button
                onClick={handleAddPoints}
                className="w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-[0.98]"
              >
                <PlusCircle size={18} /> ยืนยันการเพิ่มคะแนน (+{pointsToAdd}{' '}
                แต้ม)
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
              <label className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                <MinusCircle size={16} /> หัก / แลกคะแนนออก (Redeem Points)
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
                  className="w-32 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-lg font-mono font-bold text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
                <span className="text-sm font-bold text-neutral-300">
                  คะแนน
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[10, 20, 50, 100].map((pts) => (
                  <button
                    key={pts}
                    onClick={() => setPointsToDeduct(pts)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300"
                  >
                    -{pts} แต้ม
                  </button>
                ))}
              </div>

              <button
                onClick={handleDeductPoints}
                disabled={member.points <= 0}
                className={`w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-1.5 ${
                  member.points > 0
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-[0.98]'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <MinusCircle size={18} /> ยืนยันการหัก/ตัดคะแนน (-
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
      <span className={`font-mono font-extrabold text-2xl ${color}`}>
        {value}
      </span>
      <span className="text-xs text-neutral-300 font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function OrdersFeed({
  menu,
  activeOrders,
  allOrders,
  advanceOrder,
  editOrder,
  now,
  historyFilter,
  setHistoryFilter,
  selectedDate,
  setSelectedDate,
  selectedMonth,
  setSelectedMonth,
}: {
  menu: MenuItem[];
  activeOrders: Order[];
  allOrders: Order[];
  advanceOrder: (id: string, status: OrderStatus) => void;
  editOrder: (
    id: string,
    updates: {
      customerName: string;
      memberPhoneCode: string;
      items: CartItem[];
      status: OrderStatus;
    }
  ) => void;
  now: number;
  historyFilter: 'today' | 'yesterday' | 'custom' | 'monthly' | 'all';
  setHistoryFilter: (
    filter: 'today' | 'yesterday' | 'custom' | 'monthly' | 'all'
  ) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}) {
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showSalesChart, setShowSalesChart] = useState<boolean>(false);

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
    } else if (historyFilter === 'monthly') {
      if (!selectedMonth) return [];
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthStart = new Date(year, month - 1, 1).getTime();
      const monthEnd = new Date(year, month, 0, 23, 59, 59, 999).getTime();
      startTime = monthStart;
      endTime = monthEnd;
    }

    return allOrders.filter((o) => {
      if (o.status === 'pending') return false;
      return o.createdAt >= startTime && o.createdAt <= endTime;
    });
  }, [allOrders, now, historyFilter, selectedDate, selectedMonth]);

  const pendingCount = activeOrders.length;
  const doneOrders = filteredHistory.filter((o) => o.status === 'done');
  const doneCount = doneOrders.length;
  const cancelCount = filteredHistory.filter(
    (o) => o.status === 'cancelled'
  ).length;

  const totalCups = useMemo(
    () =>
      doneOrders.reduce(
        (sum, o) =>
          sum + o.items.reduce((itemSum, item) => itemSum + item.qty, 0),
        0
      ),
    [doneOrders]
  );

  const totalRevenue = useMemo(
    () => doneOrders.reduce((sum, o) => sum + o.total, 0),
    [doneOrders]
  );

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
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
            label="Cups / แก้ว"
            value={`${totalCups} แก้ว`}
            color="text-cyan-300"
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
          <span className="text-neutral-300 px-2 flex items-center gap-1 font-bold">
            <Calendar size={14} className="text-amber-400" /> ตัวกรองประวัติ:
          </span>
          <button
            onClick={() => setHistoryFilter('today')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              historyFilter === 'today'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            วันนี้
          </button>
          <button
            onClick={() => setHistoryFilter('yesterday')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              historyFilter === 'yesterday'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            เมื่อวาน
          </button>
          <button
            onClick={() => setHistoryFilter('monthly')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              historyFilter === 'monthly'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            รายเดือน
          </button>
          <button
            onClick={() => setHistoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              historyFilter === 'all'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setHistoryFilter('custom')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              historyFilter === 'custom'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            เลือกวันเอง
          </button>

          {historyFilter === 'custom' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="ml-1 bg-white/[0.06] border border-amber-400/40 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            />
          )}

          {historyFilter === 'monthly' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="ml-1 bg-white/[0.06] border border-amber-400/40 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            />
          )}

          <button
            onClick={() => setShowSalesChart(true)}
            title="ดูกราฟยอดขายรายเดือน (Monthly Sales Chart)"
            className="ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-teal-500/20 border border-teal-400/40 text-teal-300 hover:bg-teal-500/30 transition-colors"
          >
            <BarChart3 size={14} /> กราฟยอดขาย
          </button>
        </div>
      </div>

      <h2 className="text-base font-extrabold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Clock size={18} /> ออเดอร์ที่กำลังรอทำ (Active Pending Orders)
      </h2>

      {activeOrders.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl text-neutral-400 text-base font-bold mb-8">
          ไม่มีออเดอร์ค้างอยู่ในขณะนี้
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {activeOrders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              advanceOrder={advanceOrder}
              onEdit={() => setEditingOrder(o)}
              now={now}
            />
          ))}
        </div>
      )}

      <h2 className="text-base font-extrabold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2 pt-4 border-t border-white/10">
        <Calendar size={18} /> ประวัติออเดอร์ย้อนหลัง (Order History Log)
      </h2>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl text-neutral-400 text-sm font-bold">
          ไม่พบประวัติออเดอร์ในช่วงเวลาที่เลือก
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistory.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              advanceOrder={advanceOrder}
              onEdit={() => setEditingOrder(o)}
              now={now}
              isHistory
            />
          ))}
        </div>
      )}

      {editingOrder && (
        <OrderEditModal
          order={editingOrder}
          menu={menu}
          onClose={() => setEditingOrder(null)}
          onSave={(updates) => {
            editOrder(editingOrder.id, updates);
            setEditingOrder(null);
          }}
        />
      )}

      {showSalesChart && (
        <SalesChartModal
          orders={allOrders}
          now={now}
          onClose={() => setShowSalesChart(false)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SALES CHART MODAL — กราฟยอดขายเพื่อเช็คช่วงพีค/ต่ำสุด               */
/* ------------------------------------------------------------------ */

const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  return `${THAI_MONTHS_SHORT[m - 1]} ${y}`;
}

function formatBaht(n: number): string {
  if (n >= 1000) return `฿${(n / 1000).toFixed(1)}k`;
  return `฿${n.toFixed(0)}`;
}

function SalesChartModal({
  orders,
  now,
  onClose,
}: {
  orders: Order[];
  now: number;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'monthly' | 'daily'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date(now).toISOString().slice(0, 7)
  );

  const doneOrders = useMemo(
    () => orders.filter((o) => o.status === 'done'),
    [orders]
  );

  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    doneOrders.forEach((o) => {
      const key = new Date(o.createdAt).toISOString().slice(0, 7);
      map[key] = (map[key] || 0) + o.total;
    });
    return Object.keys(map)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => ({ key, label: formatMonthLabel(key), total: map[key] }));
  }, [doneOrders]);

  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    doneOrders.forEach((o) => {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      if (key.startsWith(selectedMonth)) {
        map[key] = (map[key] || 0) + o.total;
      }
    });
    const [y, m] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const result: { key: string; label: string; total: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${selectedMonth}-${String(d).padStart(2, '0')}`;
      result.push({ key, label: String(d), total: map[key] || 0 });
    }
    return result;
  }, [doneOrders, selectedMonth]);

  const chartData = mode === 'monthly' ? monthlyData : dailyData;
  const maxVal = Math.max(0, ...chartData.map((d) => d.total));
  const nonZero = chartData.filter((d) => d.total > 0);
  const peakEntry =
    maxVal > 0 ? chartData.find((d) => d.total === maxVal) : undefined;
  const lowEntry = nonZero.length
    ? nonZero.reduce((a, b) => (a.total <= b.total ? a : b))
    : undefined;
  const periodTotal = chartData.reduce((s, d) => s + d.total, 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-3xl bg-[#0B0F14] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto shadow-[0_0_60px_-10px_rgba(0,0,0,0.85)]">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <BarChart3 size={18} className="text-teal-400" /> กราฟยอดขาย (Sales
            Chart)
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/[0.04] border border-white/10">
            <button
              onClick={() => setMode('monthly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mode === 'monthly'
                  ? 'bg-teal-400 text-black'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              รายเดือน (ทั้งหมด)
            </button>
            <button
              onClick={() => setMode('daily')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mode === 'daily'
                  ? 'bg-teal-400 text-black'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              รายวัน (เลือกเดือน)
            </button>
          </div>

          {mode === 'daily' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white/[0.06] border border-teal-400/40 text-teal-300 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
            />
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <div className="px-4 py-2.5 rounded-xl bg-[#0D1117] border border-white/10 flex flex-col">
            <span className="font-mono font-black text-lg text-teal-300">
              {formatBaht(periodTotal)}
            </span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wide">
              ยอดขายรวมในช่วงนี้
            </span>
          </div>
          {peakEntry && (
            <div className="px-4 py-2.5 rounded-xl bg-[#0D1117] border border-emerald-400/30 flex flex-col">
              <span className="font-mono font-black text-lg text-emerald-300">
                {formatBaht(peakEntry.total)}
              </span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wide">
                พีคสุด · {peakEntry.label}
              </span>
            </div>
          )}
          {lowEntry && (
            <div className="px-4 py-2.5 rounded-xl bg-[#0D1117] border border-rose-400/30 flex flex-col">
              <span className="font-mono font-black text-lg text-rose-300">
                {formatBaht(lowEntry.total)}
              </span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-wide">
                ต่ำสุด · {lowEntry.label}
              </span>
            </div>
          )}
        </div>

        {chartData.length === 0 || maxVal === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl text-neutral-400 text-sm font-bold">
            ยังไม่มีข้อมูลยอดขายที่เสร็จสิ้นในช่วงนี้
          </div>
        ) : (
          <div className="rounded-2xl bg-[#0D1117] border border-white/10 p-4 overflow-x-auto">
            <div className="flex items-end gap-1.5 h-56 min-w-fit">
              {chartData.map((d) => {
                const heightPct = maxVal > 0 ? (d.total / maxVal) * 100 : 0;
                const isPeak = peakEntry && d.key === peakEntry.key;
                const isLow = lowEntry && d.key === lowEntry.key && d.total > 0;
                return (
                  <div
                    key={d.key}
                    title={`${d.label}: ฿${d.total.toLocaleString()}`}
                    className="flex flex-col items-center justify-end shrink-0 h-full"
                    style={{ width: mode === 'monthly' ? '68px' : '26px' }}
                  >
                    {d.total > 0 && heightPct > 18 && (
                      <span className="text-[9px] font-mono font-bold text-neutral-300 mb-1 whitespace-nowrap">
                        {formatBaht(d.total)}
                      </span>
                    )}
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isPeak
                          ? 'bg-emerald-400'
                          : isLow
                          ? 'bg-rose-400'
                          : 'bg-teal-400/60'
                      }`}
                      style={{
                        height: `${d.total > 0 ? Math.max(heightPct, 4) : 1}%`,
                      }}
                    />
                    <span className="text-[9px] text-neutral-500 mt-1.5 font-mono whitespace-nowrap">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="mt-3 text-xs text-neutral-500">
          * นับเฉพาะออเดอร์ที่สถานะ "เสร็จสิ้น (Done)" เท่านั้น — แท่งสีเขียว =
          ช่วงที่ยอดขายสูงสุด, แท่งสีแดง = ช่วงที่ยอดขายต่ำสุด
        </p>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  advanceOrder,
  onEdit,
  now,
  isHistory = false,
}: {
  order: Order;
  advanceOrder: (id: string, status: OrderStatus) => void;
  onEdit: () => void;
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

  const [cashReceived, setCashReceived] = useState<string>('');
  const cashNum = parseFloat(cashReceived) || 0;
  const change = cashNum - order.total;

  function addCash(amount: number) {
    setCashReceived((prev) => String((parseFloat(prev) || 0) + amount));
  }

  function clearCash() {
    setCashReceived('');
  }

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
          <span className="font-mono text-xs text-neutral-400 font-bold">
            #{order.id.slice(-5)}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <User size={16} className="text-amber-400" />
            <span className="font-extrabold text-base text-white truncate max-w-[140px]">
              {order.customerName}
            </span>
          </div>
          {(order.redeemedPoints || 0) > 0 && (
            <span className="inline-flex items-center gap-1 mt-1 text-xs font-black text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-400/30">
              🎁 ใช้แต้มแลก {order.redeemedPoints} แต้ม · เมนูที่แลก ฿0
            </span>
          )}
          {order.memberPhoneCode && (
            <span className="inline-block mt-1 text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              สมาชิก #{order.memberPhoneCode} (+
              {order.earnedPoints || order.total / 10} แต้ม)
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-full border ${statusMeta.cls}`}
          >
            {statusMeta.label}
          </span>
          <button
            onClick={onEdit}
            title="แก้ไขออเดอร์นี้ (Edit order)"
            className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-teal-300 px-2 py-1 rounded-lg hover:bg-teal-400/10 border border-transparent hover:border-teal-400/30 transition-colors"
          >
            <Pencil size={12} /> แก้ไข
          </button>
        </div>
      </div>

      <div className="relative mt-3 space-y-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start text-xs">
            <div>
              <p className="font-black text-base text-white">
                {item.qty > 1 ? `${item.qty}× ` : ''}
                {item.nameTh}
              </p>
              <p className="text-xs text-neutral-300 font-medium">
                {item.name} · หวาน{' '}
                <span className={`font-bold ${sweetnessColor(item.sweetness)}`}>
                  {item.sweetness}%
                </span>
              </p>
            </div>
            <span className="font-mono text-neutral-200 font-extrabold text-sm">
              ฿{item.total}
            </span>
          </div>
        ))}
      </div>

      {order.note && (
        <div className="relative mt-3 p-3 rounded-xl bg-teal-500/10 border border-teal-400/20">
          <div className="text-[11px] font-bold text-teal-300 mb-1">
            ข้อความถึงบาริสต้า
          </div>
          <div className="text-sm text-neutral-200 whitespace-pre-wrap break-words">
            {order.note}
          </div>
        </div>
      )}

      <div className="relative mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="font-mono font-black text-amber-400 text-base">
          รวม ฿{order.total}
        </span>
        <span className="flex items-center gap-1 text-xs text-neutral-400 font-medium">
          <Clock size={12} />{' '}
          {isHistory ? fmtDate(order.createdAt) : timeAgo(order.createdAt, now)}
        </span>
      </div>

      {!isHistory && order.status === 'pending' && (
        <div className="relative mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
              <Wallet size={13} className="text-teal-400" />{' '}
              เงินสดที่ลูกค้าให้มา
            </label>
            {cashReceived !== '' && (
              <button
                onClick={clearCash}
                className="text-[10px] font-bold text-neutral-500 hover:text-rose-300 flex items-center gap-0.5"
              >
                <X size={11} /> ล้าง
              </button>
            )}
          </div>

          <input
            type="number"
            min={0}
            value={cashReceived}
            onChange={(e) => setCashReceived(e.target.value)}
            placeholder="0"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-lg font-mono font-black text-white placeholder:text-neutral-600 mb-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />

          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {[20, 50, 100, 500, 1000].map((bill) => (
              <button
                key={bill}
                onClick={() => addCash(bill)}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-bold text-neutral-300 hover:border-teal-400/50 hover:text-teal-300 transition-colors"
              >
                +{bill}
              </button>
            ))}
          </div>

          {cashReceived !== '' && (
            <div
              className={`rounded-xl px-3.5 py-2.5 flex items-center justify-between border ${
                change >= 0
                  ? 'bg-emerald-500/15 border-emerald-400/40'
                  : 'bg-rose-500/15 border-rose-400/40'
              }`}
            >
              <span
                className={`text-xs font-bold ${
                  change >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {change >= 0 ? 'เงินทอน (Change)' : 'ยังขาดอีก (Short by)'}
              </span>
              <span
                className={`font-mono font-black text-xl ${
                  change >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                ฿{Math.abs(change).toFixed(0)}
              </span>
            </div>
          )}
        </div>
      )}

      {!isHistory && order.status === 'pending' && (
        <div className="relative mt-4 flex gap-2">
          <button
            onClick={() => advanceOrder(order.id, 'cancelled')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-300 text-xs font-extrabold hover:bg-rose-500/25 transition-colors"
          >
            <XCircle size={15} /> Cancel / ยกเลิก
          </button>
          <button
            onClick={() => advanceOrder(order.id, 'done')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold hover:bg-emerald-500/25 transition-colors"
          >
            <CheckCircle2 size={15} /> Done & เพิ่มแต้ม
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ORDER EDIT MODAL — แก้ไขออเดอร์ย้อนหลัง (แม้กด Done ไปแล้ว)         */
/* ------------------------------------------------------------------ */

function OrderEditModal({
  order,
  menu,
  onClose,
  onSave,
}: {
  order: Order;
  menu: MenuItem[];
  onClose: () => void;
  onSave: (updates: {
    customerName: string;
    memberPhoneCode: string;
    items: CartItem[];
    status: OrderStatus;
  }) => void;
}) {
  const [customerName, setCustomerName] = useState<string>(order.customerName);
  const [memberPhoneCode, setMemberPhoneCode] = useState<string>(
    order.memberPhoneCode || ''
  );
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [items, setItems] = useState<CartItem[]>(
    order.items.map((i) => ({ ...i }))
  );
  const [addItemId, setAddItemId] = useState<string>('');

  const grandTotal = items.reduce((sum, i) => sum + i.total, 0);

  function updateQty(idx: number, delta: number) {
    setItems(
      (prev) =>
        prev
          .map((it, i) => {
            if (i !== idx) return it;
            const newQty = it.qty + delta;
            if (newQty <= 0) return null;
            return { ...it, qty: newQty, total: it.unitPrice * newQty };
          })
          .filter(Boolean) as CartItem[]
    );
  }

  function updateUnitPrice(idx: number, value: number) {
    const price = Math.max(0, value || 0);
    setItems((prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, unitPrice: price, total: price * it.qty } : it
      )
    );
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleAddItem() {
    const menuItem = menu.find((m) => m.id === addItemId);
    if (!menuItem) return;
    const newItem: CartItem = {
      cartId: `${menuItem.id}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)}`,
      itemId: menuItem.id,
      name: menuItem.name,
      nameTh: menuItem.nameTh,
      theme: menuItem.theme,
      sweetness: 100,
      qty: 1,
      unitPrice: menuItem.price,
      total: menuItem.price,
    };
    setItems((prev) => [...prev, newItem]);
    setAddItemId('');
  }

  function handleSave() {
    if (items.length === 0) {
      alert('ออเดอร์ต้องมีอย่างน้อย 1 รายการ กรุณาเพิ่มรายการก่อนบันทึก');
      return;
    }
    onSave({ customerName, memberPhoneCode, items, status });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-lg bg-[#0B0F14] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto shadow-[0_0_60px_-10px_rgba(0,0,0,0.85)]">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Pencil size={18} className="text-teal-400" /> แก้ไขออเดอร์ #
            {order.id.slice(-5)}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400"
          >
            <X size={18} />
          </button>
        </div>

        {(order.status === 'done' || order.status === 'cancelled') && (
          <p className="mb-4 text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/25 rounded-xl px-3 py-2">
            ⚠️ ออเดอร์นี้{' '}
            {order.status === 'done' ? 'ทำเสร็จแล้ว' : 'ถูกยกเลิกแล้ว'} —
            การแก้ไขจะคำนวณแต้มสะสมของสมาชิกใหม่ให้อัตโนมัติ (หักแต้มเดิม
            แล้วเติมแต้มใหม่ตามยอดที่แก้ไข)
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1.5">
              ชื่อลูกค้า
            </label>
            <div className="relative">
              <User
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-400 mb-1.5">
              เบอร์สมาชิก (4 หลัก)
            </label>
            <input
              value={memberPhoneCode}
              onChange={(e) =>
                setMemberPhoneCode(
                  e.target.value.replace(/\D/g, '').slice(0, 4)
                )
              }
              placeholder="เว้นว่างถ้าไม่ใช่สมาชิก"
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm font-mono text-amber-300 placeholder:text-neutral-600 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-neutral-400 mb-1.5">
            สถานะออเดอร์
          </label>
          <div className="flex gap-2">
            {(
              [
                { key: 'pending', label: 'รอดำเนินการ', cls: 'amber' },
                { key: 'done', label: 'เสร็จสิ้น', cls: 'emerald' },
                { key: 'cancelled', label: 'ยกเลิก', cls: 'rose' },
              ] as { key: OrderStatus; label: string; cls: string }[]
            ).map((s) => (
              <button
                key={s.key}
                onClick={() => setStatus(s.key)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold border transition-colors ${
                  status === s.key
                    ? s.cls === 'amber'
                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-300'
                      : s.cls === 'emerald'
                      ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-400/60 text-rose-300'
                    : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:border-white/25'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <label className="block text-xs font-bold text-neutral-400">
            รายการเครื่องดื่ม
          </label>
          <span className="text-xs font-mono text-neutral-500">
            {items.length} รายการ
          </span>
        </div>

        <div className="space-y-2 mb-3">
          {items.map((item, idx) => (
            <div
              key={item.cartId}
              className="rounded-xl bg-white/[0.03] border border-white/10 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-white truncate">
                    {item.nameTh}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {item.name} · หวาน {item.sweetness}%
                  </p>
                </div>
                <button
                  onClick={() => removeItem(idx)}
                  title="ลบรายการนี้"
                  className="shrink-0 p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 mt-2.5">
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1">
                  <button
                    onClick={() => updateQty(idx, -1)}
                    className="p-1 text-neutral-300 hover:text-white"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-5 text-center font-mono text-sm text-white">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateQty(idx, 1)}
                    className="p-1 text-neutral-300 hover:text-white"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <Tag size={13} className="text-neutral-500" />
                  <input
                    type="number"
                    min={0}
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateUnitPrice(idx, Number(e.target.value))
                    }
                    className="w-16 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                  />
                  <span className="text-xs text-neutral-500">/แก้ว</span>
                </div>

                <span className="font-mono font-extrabold text-amber-300 text-sm">
                  ฿{item.total}
                </span>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-6 text-xs font-bold text-rose-300 border border-dashed border-rose-500/30 rounded-xl">
              ไม่มีรายการ — กรุณาเพิ่มเมนูอย่างน้อย 1 รายการ
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-5">
          <select
            value={addItemId}
            onChange={(e) => setAddItemId(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <option value="">+ เพิ่มเมนูที่ถูกต้อง...</option>
            {menu.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nameTh} ({m.name}) · ฿{m.price}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddItem}
            disabled={!addItemId}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shrink-0 ${
              addItemId
                ? 'bg-teal-500/20 border border-teal-400/50 text-teal-300 hover:bg-teal-500/30'
                : 'bg-white/[0.03] border border-white/10 text-neutral-600 cursor-not-allowed'
            }`}
          >
            <Plus size={15} /> เพิ่ม
          </button>
        </div>

        <div className="flex items-center justify-between mb-5 pt-3 border-t border-white/10">
          <span className="text-sm text-neutral-400 font-bold">ยอดรวมใหม่</span>
          <span className="font-mono font-black text-2xl text-amber-400">
            ฿{grandTotal}
          </span>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-teal-400 to-teal-300 text-black font-black text-sm active:scale-[0.98] transition-transform shadow-[0_0_25px_-5px_rgba(45,212,191,0.6)]"
        >
          <Save size={17} /> บันทึกการแก้ไข (Save Changes)
        </button>
      </div>
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
      <p className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-1.5">
        <Zap size={16} className="text-teal-400" /> หากปิดการใช้งานเมนูใด
        ระบบจะทำการ <strong className="text-amber-300">ซ่อนเมنูนานั้น</strong>{' '}
        ออกจากหน้าของลูกค้าทันที
      </p>
      {categories.map((cat) => {
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        const items = menu.filter((m) => m.category === cat);
        return (
          <div key={cat} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-400/10 border border-teal-400/30 text-teal-300">
                <Icon size={16} />
              </span>
              <h2 className="text-base font-extrabold text-white">
                {meta.labelTh}
              </h2>
              <span className="text-xs text-neutral-400 font-mono">
                ({meta.label})
              </span>
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
                      className={`text-base font-black truncate ${
                        item.available
                          ? 'text-white'
                          : 'text-neutral-500 line-through'
                      }`}
                    >
                      {item.nameTh}
                    </p>
                    <p className="text-xs text-neutral-400 font-medium truncate">
                      {item.name}
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
        <p className="text-sm font-semibold text-neutral-300 flex items-center gap-1.5">
          <Pencil size={16} className="text-teal-400" />{' '}
          คลิกที่เมนูเพื่อแก้ไข/ลบ หรือคลิกปุ่มเพิ่มเมนูเพื่อสร้างรายการใหม่
        </p>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-black font-extrabold text-sm shadow-[0_0_15px_rgba(45,212,191,0.4)] transition-all active:scale-[0.98]"
        >
          <Plus size={18} /> เพิ่มเมนูใหม่ (Add New Menu)
        </button>
      </div>

      {categories.map((cat) => {
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        const items = menu.filter((m) => m.category === cat);
        return (
          <div key={cat} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-400/10 border border-teal-400/30 text-teal-300">
                <Icon size={16} />
              </span>
              <h2 className="text-base font-extrabold text-white">
                {meta.labelTh}
              </h2>
              <span className="text-xs text-neutral-400 font-mono">
                ({meta.label})
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setEditingItem(item)}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0D1117] p-3.5 cursor-pointer hover:border-teal-400/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-base font-black text-white truncate">
                      {item.nameTh}
                    </p>
                    <p className="text-xs text-neutral-400 font-medium truncate">
                      {item.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-amber-300 text-sm block">
                      ฿{item.price}
                    </span>
                    <span className="text-xs text-teal-400 flex items-center justify-end gap-1 mt-0.5">
                      <Pencil size={12} /> แก้ไข
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface MenuEditModalProps {
  item: MenuItem | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<MenuItem>) => void;
  onAdd: (newItem: Omit<MenuItem, 'id'>) => void;
  onDelete: (id: string) => void;
}

function MenuEditModal({
  item,
  isNew,
  onClose,
  onSave,
  onAdd,
  onDelete,
}: MenuEditModalProps) {
  const [nameTh, setNameTh] = useState(item?.nameTh || '');
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState<CategoryType>(
    item?.category || 'ICED COFFEE'
  );
  const [theme, setTheme] = useState<ThemeType>(item?.theme || 'blue');
  const [price, setPrice] = useState<number>(item?.price || 50);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isNew) {
      onAdd({
        name,
        nameTh,
        category,
        theme,
        price,
        available: true,
      });
    } else if (item) {
      onSave(item.id, {
        name,
        nameTh,
        category,
        theme,
        price,
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#0D1117] border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <h3 className="text-xl font-black text-white">
            {isNew ? 'เพิ่มเมนูใหม่ (Add Menu)' : 'แก้ไขเมนู (Edit Menu)'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              ชื่อภาษาไทย (Thai Name)
            </label>
            <input
              type="text"
              required
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              placeholder="เช่น อเมริกาโน่เย็น"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              ชื่อภาษาอังกฤษ (English Name)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น Iced Americano"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                หมวดหมู่ (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#161B22] border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
              >
                <option value="ICED COFFEE">ICED COFFEE</option>
                <option value="HOT COFFEE">HOT COFFEE</option>
                <option value="MATCHA & TEA">MATCHA & TEA</option>
                <option value="OTHERS">OTHERS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                ธีมสีปุ่ม (Theme)
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeType)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#161B22] border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
              >
                <option value="blue">Blue (Iced)</option>
                <option value="brown">Brown (Hot)</option>
                <option value="green">Green (Matcha)</option>
                <option value="gray">Gray (Others)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              ราคา (Price - บาท)
            </label>
            <input
              type="number"
              required
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm font-mono font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            {!isNew && item && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `คุณต้องการลบเมนู ${item.nameTh} ออกจากระบบใช่หรือไม่?`
                    )
                  ) {
                    onDelete(item.id);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-sm transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={16} /> ลบเมนู
              </button>
            )}

            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold text-sm transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-black font-black text-sm transition-all shadow-[0_0_15px_rgba(20,184,166,0.4)]"
              >
                บันทึก
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
