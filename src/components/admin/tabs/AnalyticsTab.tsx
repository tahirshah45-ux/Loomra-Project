import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  BarChart,
  PieChart,
  Pie,
  Cell,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { Download, CalendarDays, BarChart3, CircleDollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useAdminState } from '../AdminContext';
import type { Order, OrderStatus } from '../types/admin.types';

const DATE_RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 }
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: '#fbbf24',
  Confirmed: '#38bdf8',
  Packed: '#a78bfa',
  Shipped: '#fb923c',
  Delivered: '#22c55e',
  Cancelled: '#ef4444',
  Returned: '#f43f5e'
};

const AnalyticsTab: React.FC = () => {
  const { orders, products, salesData, categoryData } = useAdminState();
  const [selectedRange, setSelectedRange] = useState(DATE_RANGES[1].label);
  const [customStart, setCustomStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().slice(0, 10);
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().slice(0, 10));

  const activeRange = DATE_RANGES.find(range => range.label === selectedRange);

  const dateWindow = useMemo(() => {
    const end = new Date(customEnd);
    const start = new Date(customStart);

    if (activeRange) {
      const today = new Date();
      const rangeStart = new Date(today);
      rangeStart.setDate(rangeStart.getDate() - activeRange.days + 1);
      return { start: rangeStart, end: today };
    }

    return { start, end };
  }, [activeRange, customStart, customEnd]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate >= dateWindow.start && orderDate <= dateWindow.end;
    });
  }, [orders, dateWindow]);

  const totalRevenue = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    [filteredOrders]
  );

  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const paidOrders = filteredOrders.filter(order => order.paymentStatus === 'Paid').length;
  const fulfillmentRate = totalOrders > 0 ? Math.round((filteredOrders.filter(order => order.fulfillmentStatus === 'Fulfilled').length / totalOrders) * 100) : 0;

  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach(order => {
      const key = new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      map.set(key, (map.get(key) || 0) + order.totalAmount);
    });
    return Array.from(map.entries()).map(([date, amount]) => ({ date, revenue: amount }));
  }, [filteredOrders]);

  const statusDistribution = useMemo(() => {
    const counts = orders.reduce<Record<OrderStatus, number>>(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {
        Pending: 0,
        Confirmed: 0,
        Cancelled: 0,
        Packed: 0,
        Shipped: 0,
        Delivered: 0,
        Returned: 0
      }
    );
    return Object.entries(counts).map(([status, value]) => ({ name: status, value }));
  }, [orders]);

  const categorySales = useMemo(() => {
    if (orders.length === 0) {
      return categoryData.map(item => ({ name: item.name, value: item.value }));
    }

    const categoryMap = new Map<string, number>();
    orders.forEach(order => {
      order.products.forEach(product => {
        const existingCategory = products.find(p => String(p.id) === String(product.productId))?.category || 'Other';
        categoryMap.set(existingCategory, (categoryMap.get(existingCategory) || 0) + product.quantity);
      });
    });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [orders, products, categoryData]);

  const topProducts = useMemo(() => {
    const productMap = new Map<string, number>();
    orders.forEach(order => {
      order.products.forEach(item => {
        productMap.set(item.name, (productMap.get(item.name) || 0) + item.quantity);
      });
    });

    return Array.from(productMap.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer', 'City', 'Amount', 'Payment', 'Status', 'Fulfillment', 'Date'];
    const rows = filteredOrders.map(order => [
      order.id,
      order.customerName,
      order.city,
      order.totalAmount,
      order.paymentStatus,
      order.status,
      order.fulfillmentStatus,
      new Date(order.date).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `orders-report-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1c1b1b]">Analytics</h2>
          <p className="text-[#5e3f3a] mt-1 max-w-2xl">
            Insightful sales reports and performance visualizations for your store.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded-full bg-[#b30400] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#8f0300]"
        >
          <Download size={16} />
          Export to CSV
        </button>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Date range</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {DATE_RANGES.map(range => (
                  <button
                    key={range.label}
                    onClick={() => setSelectedRange(range.label)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${selectedRange === range.label ? 'bg-[#b30400] text-white' : 'bg-[#f5f2f0] text-[#4b4950]'}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">From</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">To</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-neutral-200 bg-[#fcfbfa] px-4 py-3 text-sm outline-none"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Revenue</p>
              <p className="mt-4 text-3xl font-bold text-[#1c1b1b]">Rs. {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Orders</p>
              <p className="mt-4 text-3xl font-bold text-[#1c1b1b]">{totalOrders}</p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Avg order value</p>
              <p className="mt-4 text-3xl font-bold text-[#1c1b1b]">Rs. {Math.round(avgOrderValue).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-[#1c1b1b]">
            <CircleDollarSign size={20} />
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Revenue mix</p>
              <h3 className="text-xl font-semibold">Order performance</h3>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-4">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">Paid orders</p>
              <p className="mt-2 text-2xl font-semibold text-[#1c1b1b]">{paidOrders}</p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-4">
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">Fulfillment rate</p>
              <p className="mt-2 text-2xl font-semibold text-[#1c1b1b]">{fulfillmentRate}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-[#b30400]" />
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400">Revenue trend</p>
              <h3 className="text-xl font-semibold text-[#1c1b1b]">Sales velocity</h3>
            </div>
          </div>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByDay} margin={{ top: 8, right: 24, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b30400" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#b30400" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ece8e4" strokeDasharray="4 4" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#747474' }} />
                <YAxis tick={{ fontSize: 12, fill: '#747474' }} />
                <Tooltip formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#b30400" fill="url(#revenueGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <BarChart3 size={20} className="text-[#b30400]" />
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-400">Category demand</p>
                <h3 className="text-xl font-semibold text-[#1c1b1b]">Top categories</h3>
              </div>
            </div>
            <div className="mt-6 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySales} margin={{ top: 8, right: 0, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#ece8e4" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#747474' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#747474' }} />
                  <Tooltip formatter={(value: number) => [value, 'Units']} />
                  <Bar dataKey="value" fill="#b30400" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CalendarDays size={20} className="text-[#b30400]" />
              <div>
                <p className="text-xs uppercase tracking-widest text-neutral-400">Order status</p>
                <h3 className="text-xl font-semibold text-[#1c1b1b]">Status distribution</h3>
              </div>
            </div>
            <div className="mt-6 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                    {statusDistribution.map(entry => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name as OrderStatus] || '#cbd5e1'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`${value}`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Top products</p>
            <h3 className="text-xl font-semibold text-[#1c1b1b]">Best sellers</h3>
          </div>
          <div className="text-sm font-semibold text-neutral-500">Based on order quantities</div>
        </div>

        <div className="mt-6 grid gap-3">
          {topProducts.map(product => (
            <div key={product.name} className="flex items-center justify-between rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-4">
              <div>
                <p className="font-semibold text-[#1c1b1b]">{product.name}</p>
                <p className="text-sm text-neutral-500">{product.quantity} sold</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.35em] text-neutral-500">Qty</div>
            </div>
          ))}
          {topProducts.length === 0 && (
            <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-6 text-center text-sm text-neutral-500">
              No product sales available for the selected range.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsTab;
