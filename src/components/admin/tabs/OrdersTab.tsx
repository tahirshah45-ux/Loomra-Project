import React, { useMemo } from 'react';
import {
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAdminState } from '../AdminContext';
import type { OrderStatus, Order } from '../types/admin.types';

const STATUS_OPTIONS: Array<OrderStatus | 'All' | 'Unconfirmed'> = [
  'All',
  'Unconfirmed',
  'Pending',
  'Confirmed',
  'Cancelled',
  'Packed',
  'Shipped',
  'Delivered',
  'Returned'
];

const PAYMENT_OPTIONS = ['All', 'Paid', 'Unpaid'];

const OrdersTab: React.FC = () => {
  const {
    orders,
    orderManagement,
    setOrderSearch,
    setOrderFilter,
    setSelectedOrders,
    setSelectedOrder,
    updateOrderStatus,
    deleteOrder
  } = useAdminState();

  const { orderSearch, orderFilter, selectedOrders, selectedOrder } = orderManagement;

  const cityOptions = useMemo(() => {
    const cities = Array.from(new Set(orders.map(order => order.city).filter(Boolean)));
    return ['All', ...cities];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const query = orderSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        [order.id, order.customerName, order.phone, order.city, order.address, order.paymentMethod, order.paymentStatus]
          .join(' ')
          .toLowerCase()
          .includes(query);

      const matchesCity = orderFilter.city === 'All' || order.city === orderFilter.city;
      const matchesStatus =
        orderFilter.status === 'All'
          ? true
          : orderFilter.status === 'Unconfirmed'
          ? !order.confirmed
          : order.status === orderFilter.status;
      const matchesPayment = orderFilter.payment === 'All' || order.paymentStatus === orderFilter.payment;

      return matchesSearch && matchesCity && matchesStatus && matchesPayment;
    });
  }, [orders, orderSearch, orderFilter]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + order.totalAmount, 0),
    [orders]
  );

  const pendingCount = useMemo(
    () => orders.filter(order => order.status === 'Pending').length,
    [orders]
  );

  const allVisibleSelected =
    filteredOrders.length > 0 && filteredOrders.every(order => selectedOrders.includes(order.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    await updateOrderStatus(order.id, status, `Status updated by admin`, false);
  };

  const formatStatusLabel = (status: OrderStatus | 'Unconfirmed') => {
    switch (status) {
      case 'Pending':
      case 'Unconfirmed':
        return 'bg-yellow-100 text-yellow-700';
      case 'Confirmed':
        return 'bg-sky-100 text-sky-700';
      case 'Packed':
        return 'bg-violet-100 text-violet-700';
      case 'Shipped':
        return 'bg-orange-100 text-orange-700';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-700';
      case 'Cancelled':
      case 'Returned':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1c1b1b]">Orders</h2>
          <p className="text-[#5e3f3a] mt-1 max-w-2xl">
            Review, filter, and update order status for your store in one place.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Total orders</p>
            <p className="mt-4 text-3xl font-bold text-[#1c1b1b]">{orders.length}</p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Pending</p>
            <p className="mt-4 text-3xl font-bold text-[#1c1b1b]">{pendingCount}</p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Revenue</p>
            <p className="mt-4 text-3xl font-bold text-[#1c1b1b]">Rs. {totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-[#fcfbfa] px-4 py-3">
            <Search size={18} className="text-neutral-400" />
            <input
              type="text"
              value={orderSearch}
              onChange={e => setOrderSearch(e.target.value)}
              placeholder="Search orders, customers, phone or city"
              className="w-full bg-transparent text-sm text-[#1c1b1b] placeholder:text-neutral-400 focus:outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</span>
              <select
                value={orderFilter.status}
                onChange={e => setOrderFilter({ ...orderFilter, status: e.target.value as OrderStatus | 'All' | 'Unconfirmed' })}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">City</span>
              <select
                value={orderFilter.city}
                onChange={e => setOrderFilter({ ...orderFilter, city: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              >
                {cityOptions.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Payment</span>
              <select
                value={orderFilter.payment}
                onChange={e => setOrderFilter({ ...orderFilter, payment: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              >
                {PAYMENT_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-left text-sm">
            <thead className="bg-[#fbfaf9] text-xs uppercase tracking-[0.3em] text-neutral-500">
              <tr>
                <th className="px-6 py-4">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-neutral-300 text-[#b30400] focus:ring-[#b30400]"
                    />
                  </label>
                </th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-[#f8f7f6] transition-colors">
                  <td className="px-6 py-4">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="h-4 w-4 rounded border-neutral-300 text-[#b30400] focus:ring-[#b30400]"
                      />
                    </label>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#1c1b1b] font-semibold">#{order.id}</td>
                  <td className="px-6 py-4 text-sm text-[#1c1b1b]">{order.customerName}</td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{order.city}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] ${formatStatusLabel(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#1c1b1b]">Rs. {order.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-300 hover:text-black"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-300 hover:text-black"
                        title="Delete order"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-neutral-400">
                    No orders match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedOrder && (
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Order Details</p>
              <h3 className="mt-2 text-2xl font-bold text-[#1c1b1b]">#{selectedOrder.id}</h3>
            </div>
            <button
              onClick={closeOrderDetails}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-300 hover:text-black"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400">Customer</p>
                  <p className="mt-3 text-sm text-[#1c1b1b]">{selectedOrder.customerName}</p>
                  <p className="text-sm text-neutral-500">{selectedOrder.phone}</p>
                </div>
                <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400">Delivery</p>
                  <p className="mt-3 text-sm text-[#1c1b1b]">{selectedOrder.address}</p>
                  <p className="text-sm text-neutral-500">{selectedOrder.city}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
                <p className="text-[10px] uppercase tracking-widest text-neutral-400">Products</p>
                <div className="mt-4 space-y-3">
                  {selectedOrder.products.map(item => (
                    <div key={`${selectedOrder.id}-${item.productId}`} className="flex items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-sm">
                      <div>
                        <p className="font-semibold text-[#1c1b1b]">{item.name}</p>
                        <p className="text-xs text-neutral-400">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#1c1b1b]">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
                <p className="text-[10px] uppercase tracking-widest text-neutral-400">Timeline</p>
                <div className="mt-4 space-y-3">
                  {selectedOrder.timeline.map(event => (
                    <div key={`${event.status}-${event.date}`} className="rounded-3xl bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3 text-sm text-neutral-500">
                        <span>{new Date(event.date).toLocaleString()}</span>
                        <span className="font-semibold text-[#1c1b1b]">{event.status}</span>
                      </div>
                      <p className="mt-2 text-sm text-neutral-600">{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
                <p className="text-[10px] uppercase tracking-widest text-neutral-400">Status</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-3xl border border-neutral-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">Current status</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] ${formatStatusLabel(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                      <select
                        value={selectedOrder.status}
                        onChange={e => handleStatusChange(selectedOrder, e.target.value as OrderStatus)}
                        className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
                      >
                        {STATUS_OPTIONS.filter(option => option !== 'All' && option !== 'Unconfirmed').map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-neutral-200 bg-white p-4">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400">Payment</p>
                    <p className="mt-3 text-sm text-[#1c1b1b]">{selectedOrder.paymentStatus} • {selectedOrder.paymentMethod}</p>
                    <p className="mt-2 text-sm text-neutral-500">Fulfillment: {selectedOrder.fulfillmentStatus}</p>
                  </div>

                  <div className="rounded-3xl border border-neutral-200 bg-white p-4">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400">Summary</p>
                    <div className="mt-4 space-y-2 text-sm text-neutral-600">
                      <div className="flex justify-between">
                        <span>Order total</span>
                        <span className="font-semibold text-[#1c1b1b]">Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tracking ID</span>
                        <span>{selectedOrder.trackingId ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Courier</span>
                        <span>{selectedOrder.courierName ?? 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400">Actions</p>
                    <h4 className="mt-2 text-sm font-semibold text-[#1c1b1b]">Quick activity</h4>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-[#b30400]" />
                </div>
                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => deleteOrder(selectedOrder.id)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                    Delete order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default OrdersTab;
