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
  PackageX,
  Bot,
  Send,
  Clock,
  CheckCircle2,
  Settings2,
  Plus,
  Minus,
  X,
  Radio,
  ToggleLeft,
  ToggleRight,
  Zap,
  ListChecks,
  Volume2,
  VolumeX,
  Pencil,
  Save,
  Tag,
  User,
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

type ThemeType = 'blue' | 'red' | 'teal' | 'green' | 'orange' | 'gray';
type CategoryType = 'ICED COFFEE' | 'HOT COFFEE' | 'MATCHA & TEA' | 'OTHERS';
type OrderStatus = 'pending' | 'robot' | 'done';

interface MenuItem {
  id: string;
  name: string;
  nameTh: string;
  category: CategoryType;
  theme: ThemeType;
  price: number;
  available: boolean;
}

interface Order {
  id: string;
  customerName: string;
  itemId: string;
  name: string;
  nameTh: string;
  theme: ThemeType;
  sweetness: number;
  qty: number;
  unitPrice: number;
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
  // ICED COFFEE — blue
  {
    id: 'ic01',
    name: 'Ice Americano',
    nameTh: 'อเมริกาโน่เย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 45,
  },
  {
    id: 'ic02',
    name: 'Ice Espresso',
    nameTh: 'เอสเพรสโซ่เย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 45,
  },
  {
    id: 'ic03',
    name: 'Ice Americano Honey',
    nameTh: 'อเมริกาโน่น้ำผึ้งเย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 55,
  },
  {
    id: 'ic04',
    name: 'Ice Americano Orange',
    nameTh: 'อเมริกาโน่ส้มเย็น',
    category: 'ICED COFFEE',
    theme: 'blue',
    price: 55,
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
    name: 'Americano Honey Orange',
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
    price: 60,
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
    price: 65,
  },

  // HOT COFFEE — red
  {
    id: 'hc01',
    name: 'Hot Americano',
    nameTh: 'อเมริกาโน่ร้อน',
    category: 'HOT COFFEE',
    theme: 'red',
    price: 40,
  },
  {
    id: 'hc02',
    name: 'Hot Espresso',
    nameTh: 'เอสเพรสโซ่ร้อน',
    category: 'HOT COFFEE',
    theme: 'red',
    price: 40,
  },
  {
    id: 'hc03',
    name: 'Hot Cappucino',
    nameTh: 'คาปูชิโน่ร้อน',
    category: 'HOT COFFEE',
    theme: 'red',
    price: 50,
  },
  {
    id: 'hc04',
    name: 'Hot Caramel Macchiato',
    nameTh: 'คาราเมลมัคคิอาโต้ร้อน',
    category: 'HOT COFFEE',
    theme: 'red',
    price: 60,
  },
  {
    id: 'hc05',
    name: 'Hot Mocha',
    nameTh: 'มอคค่าร้อน',
    category: 'HOT COFFEE',
    theme: 'red',
    price: 55,
  },
  {
    id: 'hc06',
    name: 'Hot Latte',
    nameTh: 'ลาเต้ร้อน',
    category: 'HOT COFFEE',
    theme: 'red',
    price: 50,
  },
  {
    id: 'hc07',
    name: 'Hot Americano Honey',
    nameTh: 'อเมริกาโน่น้ำผึ้งร้อน',
    category: 'HOT COFFEE',
    theme: 'red',
    price: 50,
  },

  // MATCHA & TEA — teal / green / orange
  {
    id: 'mt01',
    name: 'Iced Matcha Latte',
    nameTh: 'มัทฉะลาเต้เย็น',
    category: 'MATCHA & TEA',
    theme: 'teal',
    price: 65,
  },
  {
    id: 'mt02',
    name: 'Iced Matcha Coffee',
    nameTh: 'มัทฉะกาแฟ',
    category: 'MATCHA & TEA',
    theme: 'green',
    price: 65,
  },
  {
    id: 'mt03',
    name: 'Iced Matcha',
    nameTh: 'มัทฉะเย็น',
    category: 'MATCHA & TEA',
    theme: 'teal',
    price: 60,
  },
  {
    id: 'mt04',
    name: 'Iced Matcha Orange',
    nameTh: 'มัทฉะส้ม',
    category: 'MATCHA & TEA',
    theme: 'orange',
    price: 65,
  },
  {
    id: 'mt05',
    name: 'Lemon Tea',
    nameTh: 'ชามะนาว',
    category: 'MATCHA & TEA',
    theme: 'orange',
    price: 45,
  },
  {
    id: 'mt06',
    name: 'Peach Tea',
    nameTh: 'ชาพีช',
    category: 'MATCHA & TEA',
    theme: 'orange',
    price: 50,
  },
  {
    id: 'co01',
    name: 'Cocoa',
    nameTh: 'โกโก้',
    category: 'MATCHA & TEA',
    theme: 'gray',
    price: 55,
  },

  // OTHERS — dark / gray
  {
    id: 'co02',
    name: 'Extra shot',
    nameTh: 'เพิ่มช็อต',
    category: 'OTHERS',
    theme: 'gray',
    price: 20,
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
    theme: 'red',
  },
  'MATCHA & TEA': {
    icon: Leaf,
    label: 'Matcha & Tea',
    labelTh: 'มัทฉะ & ชา',
    theme: 'teal',
  },
  OTHERS: { icon: Coffee, label: 'Others', labelTh: 'อื่นๆ', theme: 'gray' },
};

const THEME: Record<
  ThemeType,
  {
    border: string;
    borderStrong: string;
    bg: string;
    text: string;
    dot: string;
    solid: string;
    ring: string;
    grad: string;
  }
> = {
  blue: {
    border: 'border-sky-400/30',
    borderStrong: 'border-sky-400/70',
    bg: 'bg-sky-500/[0.08]',
    text: 'text-sky-300',
    dot: 'bg-sky-400',
    solid: 'bg-sky-500',
    ring: 'focus:ring-sky-400',
    grad: 'from-sky-500/20 to-sky-500/0',
  },
  red: {
    border: 'border-rose-400/30',
    borderStrong: 'border-rose-400/70',
    bg: 'bg-rose-500/[0.08]',
    text: 'text-rose-300',
    dot: 'bg-rose-400',
    solid: 'bg-rose-500',
    ring: 'focus:ring-rose-400',
    grad: 'from-rose-500/20 to-rose-500/0',
  },
  teal: {
    border: 'border-teal-400/30',
    borderStrong: 'border-teal-400/70',
    bg: 'bg-teal-500/[0.08]',
    text: 'text-teal-300',
    dot: 'bg-teal-400',
    solid: 'bg-teal-500',
    ring: 'focus:ring-teal-400',
    grad: 'from-teal-500/20 to-teal-500/0',
  },
  green: {
    border: 'border-emerald-400/30',
    borderStrong: 'border-emerald-400/70',
    bg: 'bg-emerald-500/[0.08]',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
    solid: 'bg-emerald-500',
    ring: 'focus:ring-emerald-400',
    grad: 'from-emerald-500/20 to-emerald-500/0',
  },
  orange: {
    border: 'border-amber-400/30',
    borderStrong: 'border-amber-400/70',
    bg: 'bg-amber-500/[0.08]',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    solid: 'bg-amber-500',
    ring: 'focus:ring-amber-400',
    grad: 'from-amber-500/20 to-amber-500/0',
  },
  gray: {
    border: 'border-neutral-400/30',
    borderStrong: 'border-neutral-400/70',
    bg: 'bg-neutral-500/[0.08]',
    text: 'text-neutral-300',
    dot: 'bg-neutral-400',
    solid: 'bg-neutral-500',
    ring: 'focus:ring-neutral-400',
    grad: 'from-neutral-500/20 to-neutral-500/0',
  },
};

const BUTTON_THEME: Record<
  ThemeType,
  { bg: string; bgHover: string; border: string; price: string; sub: string }
> = {
  blue: {
    bg: 'bg-sky-200',
    bgHover: 'hover:bg-sky-300',
    border: 'border-sky-400',
    price: 'text-sky-800',
    sub: 'text-neutral-700',
  },
  red: {
    bg: 'bg-rose-200',
    bgHover: 'hover:bg-rose-300',
    border: 'border-rose-400',
    price: 'text-rose-800',
    sub: 'text-neutral-700',
  },
  teal: {
    bg: 'bg-teal-200',
    bgHover: 'hover:bg-teal-300',
    border: 'border-teal-400',
    price: 'text-teal-800',
    sub: 'text-neutral-700',
  },
  green: {
    bg: 'bg-emerald-200',
    bgHover: 'hover:bg-emerald-300',
    border: 'border-emerald-400',
    price: 'text-emerald-800',
    sub: 'text-neutral-700',
  },
  orange: {
    bg: 'bg-amber-200',
    bgHover: 'hover:bg-amber-300',
    border: 'border-amber-400',
    price: 'text-amber-800',
    sub: 'text-neutral-700',
  },
  gray: {
    bg: 'bg-neutral-300',
    bgHover: 'hover:bg-neutral-400',
    border: 'border-neutral-500',
    price: 'text-neutral-800',
    sub: 'text-neutral-700',
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
  return `${m}m ago`;
}

function fmtClock(d: Date): string {
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
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

/* ------------------------------------------------------------------ */
/*  AUDIO / SOUND SIMULATION                                         */
/* ------------------------------------------------------------------ */

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
    gain = 0.08
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
      tone(660, 0, 0.1);
      tone(880, 0.1, 0.12);
    },
    playIncoming: () => {
      tone(880, 0, 0.09);
      tone(880, 0.14, 0.09);
    },
    playDone: () => {
      tone(660, 0, 0.09);
      tone(880, 0.1, 0.09);
      tone(1100, 0.2, 0.15);
    },
  };
}

/* ------------------------------------------------------------------ */
/*  MAIN APP                                                          */
/* ------------------------------------------------------------------ */

export default function App() {
  const [view, setView] = useState<'customer' | 'barista'>(getViewFromURL);
  const [menu, setMenu] = useState<MenuItem[]>(
    INITIAL_MENU_ITEMS.map((m) => ({ ...m, available: true }))
  );
  const [customerName, setCustomerName] = useState<string>('');
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
  const sound = useOrderSound(soundOn);

  // Sync Orders with Firebase Realtime Database
  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedOrders: Order[] = Object.keys(data).map((key) => ({
          ...data[key],
          id: key,
        }));
        // Sort newest first
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
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  function openModal(item: MenuItem) {
    if (!item.available) return;
    setModalItem(item);
    setSweetness(100);
    setQty(1);
  }

  function closeModal() {
    setModalItem(null);
  }

  function sendOrder() {
    if (!modalItem) return;
    const name = customerName.trim() || 'Guest';

    const newOrderData = {
      customerName: name,
      itemId: modalItem.id,
      name: modalItem.name,
      nameTh: modalItem.nameTh,
      theme: modalItem.theme,
      sweetness,
      qty,
      unitPrice: modalItem.price,
      total: modalItem.price * qty,
      createdAt: Date.now(),
      status: 'pending',
    };

    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);
    set(newOrderRef, newOrderData);

    setToast(`Order sent for ${name} — ${modalItem.name}`);
    setModalItem(null);
    sound.playSent();
  }

  function advanceOrder(id: string, status: OrderStatus) {
    const orderRef = ref(db, `orders/${id}`);
    update(orderRef, { status });
    if (status === 'done') sound.playDone();
  }

  function toggleStock(id: string) {
    setMenu((prev) =>
      prev.map((m) => (m.id === id ? { ...m, available: !m.available } : m))
    );
  }

  function updateMenuItem(id: string, updates: Partial<MenuItem>) {
    setMenu((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    setEditingItem(null);
    setToast(`Menu item updated — ${updates.name || ''}`);
  }

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== 'done'),
    [orders]
  );
  const doneOrders = useMemo(
    () => orders.filter((o) => o.status === 'done'),
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
        />
      ) : (
        <BaristaView
          menu={menu}
          toggleStock={toggleStock}
          baristaTab={baristaTab}
          setBaristaTab={setBaristaTab}
          activeOrders={activeOrders}
          doneOrders={doneOrders}
          advanceOrder={advanceOrder}
          now={now}
          sound={sound}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          updateMenuItem={updateMenuItem}
        />
      )}

      {modalItem && (
        <CustomizeModal
          item={modalItem}
          sweetness={sweetness}
          setSweetness={setSweetness}
          qty={qty}
          setQty={setQty}
          onClose={closeModal}
          onSend={sendOrder}
        />
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] px-4 py-3 rounded-xl bg-[#0D1117] border border-emerald-400/40 shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] flex items-center gap-2 text-sm">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CUSTOMER VIEW                                                     */
/* ------------------------------------------------------------------ */

interface CustomerViewProps {
  menu: MenuItem[];
  customerName: string;
  setCustomerName: (name: string) => void;
  openModal: (item: MenuItem) => void;
  soundOn: boolean;
  setSoundOn: (val: boolean) => void;
}

function CustomerView({
  menu,
  customerName,
  setCustomerName,
  openModal,
  soundOn,
  setSoundOn,
}: CustomerViewProps) {
  return (
    <div className="max-w-md mx-auto px-4 pb-24">
      <div className="pt-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight leading-tight text-neutral-50">
              Cof N&apos; Rob <span className="text-amber-400">Coffee Bar</span>
            </h1>
          </div>
          <button
            onClick={() => setSoundOn(!soundOn)}
            title={soundOn ? 'Mute order sounds' : 'Enable order sounds'}
            className="shrink-0 p-2 rounded-lg bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-neutral-200"
          >
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>

        <div className="relative mt-4">
          <div className="relative">
            <User
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400"
            />
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name · ใส่ชื่อของคุณ"
              maxLength={40}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0D1117] border border-white/10 text-sm font-semibold text-neutral-50 placeholder:text-neutral-500 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        const t = THEME[meta.theme];
        const items = menu.filter((m) => m.category === cat);
        return (
          <div key={cat} className="mb-6">
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-lg ${t.bg} ${t.text}`}
              >
                <Icon size={13} />
              </span>
              <h2 className="text-sm font-semibold text-neutral-200">
                {meta.label}
              </h2>
              <span className="text-xs text-neutral-500">{meta.labelTh}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {items.map((item) => (
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
  if (!item.available) {
    return (
      <button
        disabled
        className="relative text-left rounded-2xl p-3 border border-white/5 bg-white/[0.03] cursor-not-allowed overflow-hidden min-h-[92px]"
      >
        <div className="grayscale opacity-40">
          <p className="text-lg font-extrabold leading-tight text-black">
            {item.name}
          </p>
          <p className="text-sm font-bold text-black/70 mt-0.5">
            {item.nameTh}
          </p>
          <p className="text-sm mt-2 font-mono font-bold text-black/60">
            ฿{item.price}
          </p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-neutral-900 border border-rose-500/50 text-rose-300 text-xs font-bold rotate-[-6deg]">
            <PackageX size={13} /> Sold Out / หมด
          </span>
        </div>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-2xl p-3 border-2 ${bt.border} ${bt.bg} ${bt.bgHover} active:scale-[0.97] transition-transform min-h-[92px] shadow-sm`}
    >
      <p className="text-lg font-extrabold leading-tight text-black">
        {item.name}
      </p>
      <p className="text-sm font-bold text-black/80 mt-0.5">{item.nameTh}</p>
      <p className={`text-sm mt-2 font-mono font-extrabold ${bt.price}`}>
        ฿{item.price}
      </p>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  CUSTOMIZE MODAL                                                   */
/* ------------------------------------------------------------------ */

interface CustomizeModalProps {
  item: MenuItem;
  sweetness: number;
  setSweetness: (val: number) => void;
  qty: number;
  setQty: (val: number) => void;
  onClose: () => void;
  onSend: () => void;
}

function CustomizeModal({
  item,
  sweetness,
  setSweetness,
  qty,
  setQty,
  onClose,
  onSend,
}: CustomizeModalProps) {
  const t = THEME[item.theme];
  const total = item.price * qty;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-sm bg-[#0B0F14] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto shadow-[0_0_60px_-10px_rgba(0,0,0,0.8)]">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-lg font-bold text-neutral-50">{item.name}</h3>
            <p className="text-xs text-neutral-400">{item.nameTh}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400"
          >
            <X size={16} />
          </button>
        </div>
        <span
          className={`inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded-full ${t.bg} ${t.text} border ${t.border}`}
        >
          ฿{item.price} / cup
        </span>

        {/* Sweetness */}
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
            className="w-full accent-amber-400 h-2"
          />
          <div className="flex flex-wrap gap-1.5 mt-3">
            {SWEET_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setSweetness(p.value)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium border transition-colors ${
                  sweetness === p.value
                    ? 'bg-amber-500 border-amber-400 text-black'
                    : 'bg-white/[0.03] border-white/10 text-neutral-300 hover:border-white/30'
                }`}
              >
                {p.label} <span className="opacity-70">{p.labelTh}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-300">
            Quantity · จำนวน
          </span>
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-2 py-1">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="p-1 text-neutral-300 hover:text-white"
            >
              <Minus size={14} />
            </button>
            <span className="w-5 text-center font-mono text-sm">{qty}</span>
            <button
              onClick={() => setQty(Math.min(10, qty + 1))}
              className="p-1 text-neutral-300 hover:text-white"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Total + send */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-neutral-400">Total · ยอดรวม</span>
          <span className="font-mono font-bold text-xl text-amber-400">
            ฿{total}
          </span>
        </div>
        <button
          onClick={onSend}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold text-sm active:scale-[0.98] transition-transform shadow-[0_0_25px_-5px_rgba(245,158,11,0.6)]"
        >
          <Send size={16} /> Send Order · ส่งออเดอร์
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BARISTA VIEW                                                      */
/* ------------------------------------------------------------------ */

interface BaristaViewProps {
  menu: MenuItem[];
  toggleStock: (id: string) => void;
  baristaTab: 'orders' | 'stock' | 'editor';
  setBaristaTab: (tab: 'orders' | 'stock' | 'editor') => void;
  activeOrders: Order[];
  doneOrders: Order[];
  advanceOrder: (id: string, status: OrderStatus) => void;
  now: number;
  sound: ReturnType<typeof useOrderSound>;
  soundOn: boolean;
  setSoundOn: (val: boolean) => void;
  editingItem: MenuItem | null;
  setEditingItem: (item: MenuItem | null) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
}

function BaristaView({
  menu,
  toggleStock,
  baristaTab,
  setBaristaTab,
  activeOrders,
  doneOrders,
  advanceOrder,
  now,
  sound,
  soundOn,
  setSoundOn,
  editingItem,
  setEditingItem,
  updateMenuItem,
}: BaristaViewProps) {
  const [clock, setClock] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef<boolean>(false);

  useEffect(() => {
    const pendingIds = activeOrders
      .filter((o) => o.status === 'pending')
      .map((o) => o.id);
    const hasNew = pendingIds.some((id) => !seenIds.current.has(id));
    if (hasNew && initialized.current) sound?.playIncoming();
    pendingIds.forEach((id) => seenIds.current.add(id));
    initialized.current = true;
  }, [activeOrders, sound]);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      <div className="pt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Bot size={20} className="text-teal-400" /> Cof N&apos; Rob —
            Barista Display Dashboard
          </h1>
          <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
            <Radio size={11} className="text-emerald-400 animate-pulse" /> Live
            feed synced with customer terminals
            <span className="ml-2 px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-400/30 text-teal-300 text-[10px] font-mono">
              ?view=barista
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-neutral-400 flex items-center gap-1.5">
            <Clock size={13} /> {fmtClock(clock)}
          </span>
          <button
            onClick={() => setSoundOn(!soundOn)}
            title={soundOn ? 'Mute order sounds' : 'Enable order sounds'}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-neutral-400 hover:text-neutral-200"
          >
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 mt-5 rounded-xl bg-white/[0.04] border border-white/10 w-fit">
        <button
          onClick={() => setBaristaTab('orders')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium ${
            baristaTab === 'orders'
              ? 'bg-teal-400 text-black'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ListChecks size={14} /> Live Orders
        </button>
        <button
          onClick={() => setBaristaTab('stock')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium ${
            baristaTab === 'stock'
              ? 'bg-teal-400 text-black'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Settings2 size={14} /> Manage Menu Stock
        </button>
        <button
          onClick={() => setBaristaTab('editor')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium ${
            baristaTab === 'editor'
              ? 'bg-teal-400 text-black'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Pencil size={14} /> Editable Menu &amp; Price Manager
        </button>
      </div>

      {baristaTab === 'orders' && (
        <OrdersFeed
          activeOrders={activeOrders}
          doneOrders={doneOrders}
          advanceOrder={advanceOrder}
          now={now}
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
    <div className="px-3 py-2 rounded-xl bg-[#0D1117] border border-white/10 flex flex-col items-center min-w-[70px]">
      <span className={`font-mono font-bold text-lg ${color}`}>{value}</span>
      <span className="text-[10px] text-neutral-500 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function OrdersFeed({
  activeOrders,
  doneOrders,
  advanceOrder,
  now,
}: {
  activeOrders: Order[];
  doneOrders: Order[];
  advanceOrder: (id: string, status: OrderStatus) => void;
  now: number;
}) {
  const pending = activeOrders.filter((o) => o.status === 'pending').length;
  const robot = activeOrders.filter((o) => o.status === 'robot').length;

  return (
    <div className="mt-5">
      <div className="flex gap-2.5 mb-5">
        <StatChip label="Pending" value={pending} color="text-amber-300" />
        <StatChip label="Robot Arm" value={robot} color="text-sky-300" />
        <StatChip
          label="Done Today"
          value={doneOrders.length}
          color="text-emerald-300"
        />
      </div>

      {activeOrders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl text-neutral-500 text-sm">
          No active orders — waiting for the next scan.
          <div className="text-xs mt-1">ไม่มีออเดอร์ที่กำลังดำเนินการ</div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
    </div>
  );
}

function OrderCard({
  order,
  advanceOrder,
  now,
}: {
  order: Order;
  advanceOrder: (id: string, status: OrderStatus) => void;
  now: number;
}) {
  const t = THEME[order.theme];
  const statusMeta = {
    pending: {
      label: 'PENDING',
      labelTh: 'รอดำเนินการ',
      cls: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    },
    robot: {
      label: 'ROBOT ARM',
      labelTh: 'แขนกลกำลังทำ',
      cls: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
    },
    done: {
      label: 'DONE',
      labelTh: 'เสร็จสิ้น',
      cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    },
  }[order.status];

  return (
    <div
      className={`relative rounded-2xl border ${t.border} bg-[#0D1117] p-4 overflow-hidden`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-b ${t.grad} pointer-events-none`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <span className="font-mono text-xs text-neutral-500">
            #{order.id.slice(-5)}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <User size={13} className="text-amber-400" />
            <span className="font-semibold text-sm truncate max-w-[140px]">
              {order.customerName}
            </span>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusMeta.cls}`}
        >
          {statusMeta.label}
        </span>
      </div>

      <div className="relative mt-3">
        <p className="text-sm font-semibold text-neutral-50 leading-tight">
          {order.qty > 1 ? `${order.qty}× ` : ''}
          {order.name}
        </p>
        <p className="text-xs text-neutral-400">{order.nameTh}</p>
      </div>

      <div className="relative mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wide">
            Sweetness
          </span>
          <span
            className={`font-mono font-bold ${sweetnessColor(order.sweetness)}`}
          >
            {order.sweetness}%
          </span>
        </div>
        <span className="flex items-center gap-1 text-[11px] text-neutral-500">
          <Clock size={11} /> {timeAgo(order.createdAt, now)}
        </span>
      </div>

      <div className="relative mt-4 flex gap-2">
        {order.status !== 'robot' && order.status !== 'done' && (
          <button
            onClick={() => advanceOrder(order.id, 'robot')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-500/15 border border-sky-400/40 text-sky-300 text-xs font-semibold hover:bg-sky-500/25"
          >
            <Bot size={13} /> Send to Robot Arm
          </button>
        )}
        {order.status !== 'done' && (
          <button
            onClick={() => advanceOrder(order.id, 'done')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25"
          >
            <CheckCircle2 size={13} /> Done
          </button>
        )}
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
  return (
    <div className="mt-5">
      <p className="text-xs text-neutral-500 mb-4 flex items-center gap-1.5">
        <Zap size={12} className="text-teal-400" /> Toggle an item off to mark
        it Sold Out instantly across all customer terminals.
      </p>
      {CATEGORY_ORDER.map((cat) => {
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        const t = THEME[meta.theme];
        const items = menu.filter((m) => m.category === cat);
        return (
          <div key={cat} className="mb-6">
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-lg ${t.bg} ${t.text}`}
              >
                <Icon size={13} />
              </span>
              <h2 className="text-sm font-semibold text-neutral-200">
                {meta.label}
              </h2>
              <span className="text-xs text-neutral-500">{meta.labelTh}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${
                    item.available
                      ? `${THEME[item.theme].border} bg-[#0D1117]`
                      : 'border-rose-500/30 bg-rose-500/[0.04]'
                  }`}
                >
                  <div className="min-w-0">
                    <p
                      className={`text-[13px] font-semibold truncate ${
                        item.available
                          ? 'text-neutral-50'
                          : 'text-neutral-500 line-through'
                      }`}
                    >
                      {item.name}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {item.nameTh}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleStock(item.id)}
                    className="shrink-0 flex items-center gap-1"
                    title={item.available ? 'Mark Sold Out' : 'Mark Available'}
                  >
                    {item.available ? (
                      <ToggleRight size={30} className="text-emerald-400" />
                    ) : (
                      <ToggleLeft size={30} className="text-neutral-600" />
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
    <div className="mt-5">
      <p className="text-xs text-neutral-500 mb-4 flex items-center gap-1.5">
        <Pencil size={12} className="text-teal-400" /> Click any item to edit
        its English/Thai name, price, or stock status. Saved changes sync to the
        Customer View instantly.
      </p>
      {CATEGORY_ORDER.map((cat) => {
        const meta = CATEGORY_META[cat];
        const Icon = meta.icon;
        const t = THEME[meta.theme];
        const items = menu.filter((m) => m.category === cat);
        return (
          <div key={cat} className="mb-6">
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className={`flex items-center justify-center w-6 h-6 rounded-lg ${t.bg} ${t.text}`}
              >
                <Icon size={13} />
              </span>
              <h2 className="text-sm font-semibold text-neutral-200">
                {meta.label}
              </h2>
              <span className="text-xs text-neutral-500">{meta.labelTh}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setEditingItem(item)}
                  className={`text-left flex items-center justify-between gap-2 rounded-2xl border p-3 hover:border-white/30 transition-colors ${
                    item.available
                      ? `${THEME[item.theme].border} bg-[#0D1117]`
                      : 'border-rose-500/30 bg-rose-500/[0.04]'
                  }`}
                >
                  <div className="min-w-0">
                    <p
                      className={`text-[13px] font-semibold truncate ${
                        item.available
                          ? 'text-neutral-50'
                          : 'text-neutral-500 line-through'
                      }`}
                    >
                      {item.name}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {item.nameTh}
                    </p>
                    <p className="text-[11px] font-mono font-semibold text-amber-300 mt-1">
                      ฿{item.price}
                    </p>
                  </div>
                  <Pencil size={14} className="shrink-0 text-neutral-500" />
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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-sm bg-[#0B0F14] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 max-h-[92vh] overflow-y-auto shadow-[0_0_60px_-10px_rgba(0,0,0,0.8)]">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-base font-bold text-neutral-50 flex items-center gap-2">
            <Pencil size={16} className="text-teal-400" /> Edit Menu Item
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400"
          >
            <X size={16} />
          </button>
        </div>

        <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
          English Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm text-neutral-50 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />

        <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
          Thai Name · ชื่อภาษาไทย
        </label>
        <input
          value={nameTh}
          onChange={(e) => setNameTh(e.target.value)}
          className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm text-neutral-50 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />

        <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
          Price (THB) · ราคา
        </label>
        <div className="relative mb-4">
          <Tag
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 pl-9 pr-3 py-2.5 text-sm font-mono text-neutral-50 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
          Stock Status · สถานะสินค้า
        </label>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAvailable(true)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border ${
              available
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'bg-white/[0.03] border-white/10 text-neutral-500'
            }`}
          >
            <CheckCircle2 size={14} /> Available
          </button>
          <button
            onClick={() => setAvailable(false)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border ${
              !available
                ? 'bg-rose-500/20 border-rose-400/50 text-rose-300'
                : 'bg-white/[0.03] border-white/10 text-neutral-500'
            }`}
          >
            <PackageX size={14} /> Sold Out
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-teal-300 text-black font-semibold text-sm active:scale-[0.98] transition-transform shadow-[0_0_25px_-5px_rgba(45,212,191,0.6)]"
        >
          <Save size={16} /> Save Changes · บันทึกการเปลี่ยนแปลง
        </button>
      </div>
    </div>
  );
}
