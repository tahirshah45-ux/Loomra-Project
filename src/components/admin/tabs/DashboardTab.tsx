import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Package,
  Server,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  Activity,
  ArrowRight,
  BarChart3,
  Wifi,
  Database,
  Cpu,
  AlertTriangle
} from 'lucide-react';
import { useAdminState } from '../AdminContext';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  actionLabel: string;
}

const DashboardTab: React.FC = () => {
  const {
    orders,
    products,
    apiHealth,
    settings,
    runResilienceTest,
    testGeminiConnection
  } = useAdminState();

  const [wizardSteps, setWizardSteps] = useState<WizardStep[]>([
    {
      id: 'payment',
      title: 'Connect payments',
      description: 'Activate your preferred payment gateway and start accepting orders.',
      completed: settings.whatsappEnabled,
      actionLabel: 'Verify Payment'
    },
    {
      id: 'inventory',
      title: 'Add inventory',
      description: 'Add products, update stock, and configure categories.',
      completed: products.length > 0,
      actionLabel: 'Review Inventory'
    },
    {
      id: 'shipping',
      title: 'Configure shipping',
      description: 'Set shipping costs, delivery zones, and fulfillment rules.',
      completed: settings.defaultShippingCost > 0,
      actionLabel: 'Update Shipping'
    },
    {
      id: 'confirmation',
      title: 'Review live orders',
      description: 'Confirm recent orders and monitor fulfillment status.',
      completed: orders.length > 0,
      actionLabel: 'View Orders'
    }
  ]);

  const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false);
  const [isTestingAiConnection, setIsTestingAiConnection] = useState(false);

  const totalSales = useMemo(
    () => orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    [orders]
  );

  const totalOrders = orders.length;
  const totalProducts = products.length;

  const averageOrderValue = useMemo(
    () => (totalOrders > 0 ? totalSales / totalOrders : 0),
    [totalOrders, totalSales]
  );

  const pendingOrders = useMemo(
    () => orders.filter(order => order.status === 'Pending' || order.status === 'Confirmed').length,
    [orders]
  );

  const lowStockCount = useMemo(
    () => products.filter(product => (product.stock ?? 0) > 0 && product.stock < 5).length,
    [products]
  );

  const healthScore = useMemo(() => {
    const total = apiHealth.mainGateway + apiHealth.supportAi + apiHealth.database;
    return Math.round(total / 3);
  }, [apiHealth]);

  const statusLabel = useMemo(() => {
    if (apiHealth.status === 'green') return 'Stable';
    if (apiHealth.status === 'yellow') return 'Degraded';
    return 'Critical';
  }, [apiHealth.status]);

  const handleToggleStep = (stepId: string) => {
    setWizardSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const handleRunHealthCheck = async () => {
    setIsRunningHealthCheck(true);
    try {
      await runResilienceTest();
    } finally {
      setIsRunningHealthCheck(false);
    }
  };

  const handleTestAiConnection = async () => {
    setIsTestingAiConnection(true);
    try {
      await testGeminiConnection();
    } finally {
      setIsTestingAiConnection(false);
    }
  };

  const completedSteps = wizardSteps.filter(step => step.completed).length;
  const wizardProgress = Math.round((completedSteps / wizardSteps.length) * 100);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1c1b1b]">Dashboard</h2>
          <p className="text-[#5e3f3a] mt-1 max-w-2xl">
            A quick overview of your store performance, system health, and onboarding progress.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRunHealthCheck}
            disabled={isRunningHealthCheck}
            className="inline-flex items-center gap-2 rounded-full border border-[#e10600] bg-[#b30400] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#8f0300] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Activity size={14} />
            {isRunningHealthCheck ? 'Checking...' : 'Run Health Check'}
          </button>
          <button
            onClick={handleTestAiConnection}
            disabled={isTestingAiConnection}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#1c1b1b] transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BarChart3 size={14} />
            {isTestingAiConnection ? 'Testing...' : 'Test AI Connection'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs uppercase tracking-[0.35em]">Total Sales</span>
            <DollarSign size={20} className="text-[#b30400]" />
          </div>
          <p className="mt-6 text-3xl font-bold text-[#1c1b1b]">Rs. {totalSales.toLocaleString()}</p>
          <p className="mt-2 text-sm text-neutral-500">Revenue from all completed orders</p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs uppercase tracking-[0.35em]">Orders</span>
            <ShoppingCart size={20} className="text-[#b30400]" />
          </div>
          <p className="mt-6 text-3xl font-bold text-[#1c1b1b]">{totalOrders}</p>
          <p className="mt-2 text-sm text-neutral-500">Orders placed so far</p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs uppercase tracking-[0.35em]">Active Products</span>
            <Package size={20} className="text-[#b30400]" />
          </div>
          <p className="mt-6 text-3xl font-bold text-[#1c1b1b]">{totalProducts}</p>
          <p className="mt-2 text-sm text-neutral-500">Products currently listed</p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs uppercase tracking-[0.35em]">Avg Order</span>
            <TrendingUp size={20} className="text-[#b30400]" />
          </div>
          <p className="mt-6 text-3xl font-bold text-[#1c1b1b]">Rs. {averageOrderValue.toFixed(0).toLocaleString()}</p>
          <p className="mt-2 text-sm text-neutral-500">Average order value across sales</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">System Health Monitor</p>
              <h3 className="mt-3 text-2xl font-bold text-[#1c1b1b]">{statusLabel} · {healthScore}%</h3>
            </div>
            <div className="rounded-full bg-[#b30400] px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-white">
              {apiHealth.status}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { label: 'Gateway', value: apiHealth.mainGateway, icon: Wifi },
              { label: 'Database', value: apiHealth.database, icon: Database },
              { label: 'AI Support', value: apiHealth.supportAi, icon: Cpu }
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-neutral-500">
                    <span>{item.label}</span>
                    <span className="font-semibold text-[#1c1b1b]">{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full ${item.value > 75 ? 'bg-emerald-500' : item.value > 40 ? 'bg-amber-400' : 'bg-red-500'}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={handleRunHealthCheck}
              disabled={isRunningHealthCheck}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b30400] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#8f0300] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Activity size={14} />
              {isRunningHealthCheck ? 'Checking...' : 'Run Diagnostic'}
            </button>
            <button
              onClick={handleTestAiConnection}
              disabled={isTestingAiConnection}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#1c1b1b] transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldCheck size={14} />
              {isTestingAiConnection ? 'Testing...' : 'Run AI Check'}
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Setup Wizard</p>
              <h3 className="mt-3 text-2xl font-bold text-[#1c1b1b]">Get your store ready</h3>
            </div>
            <div className="rounded-full bg-[#f6f3f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#5e3f3a]">
              {wizardProgress}% complete
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {wizardSteps.map(step => (
              <div key={step.id} className="rounded-3xl border border-neutral-200 bg-[#f9fafb] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-neutral-500">
                      {step.completed ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Clock size={14} className="text-[#b30400]" />}
                      <span>{step.title}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{step.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggleStep(step.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition ${step.completed ? 'bg-emerald-500 text-white' : 'border border-neutral-200 bg-white text-[#1c1b1b] hover:bg-neutral-100'}`}
                  >
                    {step.completed ? 'Completed' : step.actionLabel}
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl bg-[#f6f3f2] p-4 text-sm text-[#5e3f3a]">
            <div className="flex items-center gap-2 font-semibold uppercase tracking-[0.35em] text-[#5e3f3a]">
              <Zap size={16} />
              <span>Tip</span>
            </div>
            <p className="mt-2 leading-6">
              Complete each step to unlock the fastest path to launching your storefront. The wizard is fully interactive and persists during the session.
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Operations</p>
            <h3 className="mt-2 text-2xl font-bold text-[#1c1b1b]">Live performance</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f3f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#5e3f3a]">
            <Activity size={14} />
            {completedSteps} / {wizardSteps.length} steps dashboard
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
            <div className="flex items-center gap-3 text-neutral-500">
              <AlertTriangle size={18} className="text-[#d97706]" />
              <span className="text-sm font-semibold uppercase tracking-[0.25em]">Pending orders</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-[#1c1b1b]">{pendingOrders}</p>
            <p className="mt-2 text-sm text-neutral-500">Orders awaiting confirmation or shipment.</p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
            <div className="flex items-center gap-3 text-neutral-500">
              <Package size={18} className="text-[#b30400]" />
              <span className="text-sm font-semibold uppercase tracking-[0.25em]">Low stock</span>
            </div>
            <p className="mt-4 text-3xl font-bold text-[#1c1b1b]">{lowStockCount}</p>
            <p className="mt-2 text-sm text-neutral-500">Products with low inventory that need restocking.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardTab;
