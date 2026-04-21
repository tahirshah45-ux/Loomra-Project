import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  CheckCircle2,
  X,
  Zap,
  RefreshCcw
} from 'lucide-react';
import { useAdminState } from '../AdminContext';
import type { Product } from '../types/admin.types';

const CATEGORY_OPTIONS = ['All', 'CAPS', 'TEES', 'Hoodies', 'Accessories'];
const STATUS_OPTIONS = ['All', 'Active', 'Draft'];

interface ProductFormValues {
  id: string | number;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  status: 'Active' | 'Draft';
  img: string;
  description: string;
  tags: string;
  sizeStock: {
    S: number;
    M: number;
    L: number;
    XL: number;
  };
}

const defaultFormValues: ProductFormValues = {
  id: `new-${Date.now()}`,
  name: '',
  category: 'CAPS',
  price: 0,
  stock: 0,
  sku: '',
  status: 'Active',
  img: '',
  description: '',
  tags: '',
  sizeStock: { S: 0, M: 0, L: 0, XL: 0 }
};

const ProductsTab: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    generateAIProductData
  } = useAdminState();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeProduct, setActiveProduct] = useState<ProductFormValues>(defaultFormValues);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = [product.name, product.category, product.sku]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const lowStockCount = useMemo(
    () => products.filter(product => (product.stock ?? 0) > 0 && product.stock < 5).length,
    [products]
  );

  const activeProductsCount = useMemo(
    () => products.filter(product => product.status === 'Active').length,
    [products]
  );

  const openNewProductForm = () => {
    setActiveProduct({ ...defaultFormValues, id: `new-${Date.now()}` });
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const openEditProductForm = (product: Product) => {
    setActiveProduct({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      sku: String(product.sku),
      status: product.status,
      img: product.img,
      description: product.description,
      tags: product.tags.join(', '),
      sizeStock: product.sizeStock
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setIsEditing(false);
    setActiveProduct({ ...defaultFormValues, id: `new-${Date.now()}` });
  };

  const handleFormChange = (key: keyof ProductFormValues, value: string | number | { S: number; M: number; L: number; XL: number }) => {
    setActiveProduct(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveProduct = async () => {
    const productPayload: Product = {
      id: activeProduct.id,
      name: activeProduct.name,
      category: activeProduct.category,
      price: activeProduct.price,
      img: activeProduct.img,
      images: activeProduct.img ? [activeProduct.img] : [],
      videoUrl: '',
      description: activeProduct.description,
      colors: [
        {
          name: activeProduct.category,
          hex: '#000000',
          images: activeProduct.img ? [activeProduct.img] : [],
          isActive: true
        }
      ],
      seo: {
        title: activeProduct.name,
        description: activeProduct.description,
        slug: activeProduct.name.toLowerCase().replace(/\s+/g, '-'),
        altText: `${activeProduct.name} image`,
        keywords: activeProduct.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        image: activeProduct.img
      },
      stock: activeProduct.stock,
      sizeStock: activeProduct.sizeStock,
      sku: activeProduct.sku,
      status: activeProduct.status,
      seoScore: 0,
      tags: activeProduct.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    if (isEditing) {
      updateProduct(productPayload);
    } else {
      addProduct(productPayload);
    }

    closeForm();
  };

  const handleGenerateAI = async () => {
    if (!activeProduct.name) return;
    setIsGeneratingAI(true);
    try {
      await generateAIProductData(activeProduct.name);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1c1b1b]">Products</h2>
          <p className="text-[#5e3f3a] mt-1 max-w-2xl">
            Manage your catalog, update inventory, and generate product descriptions with AI.
          </p>
        </div>
        <button
          onClick={openNewProductForm}
          className="inline-flex items-center gap-2 rounded-full bg-[#b30400] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#8f0300]"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Total products</p>
              <p className="mt-4 text-3xl font-bold text-[#1c1b1b]">{products.length}</p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Active</p>
              <p className="mt-4 text-3xl font-bold text-[#1c1b1b]">{activeProductsCount}</p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-[#fcfbfa] p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">Low stock</p>
              <p className="mt-4 text-3xl font-bold text-[#1c1b1b]">{lowStockCount}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">AI Product Generation</p>
              <h3 className="mt-2 text-2xl font-bold text-[#1c1b1b]">Generate product copy</h3>
            </div>
            <Sparkles size={24} className="text-[#b30400]" />
          </div>
          <p className="mt-4 text-sm text-neutral-500">
            Use AI to generate ideas and product descriptions for your latest catalog additions.
          </p>
          <button
            disabled={isGeneratingAI || !activeProduct.name}
            onClick={handleGenerateAI}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#1c1b1b] transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Zap size={14} />
            {isGeneratingAI ? 'Generating...' : 'Generate Description'}
          </button>
        </section>
      </div>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-[#fcfbfa] px-4 py-3">
            <Search size={18} className="text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search products, SKU, or category"
              className="w-full bg-transparent text-sm text-[#1c1b1b] placeholder:text-neutral-400 focus:outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Category</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              >
                {CATEGORY_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
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
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-[#f8f7f6] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.img} alt={product.name} className="h-12 w-12 rounded-2xl object-cover" />
                      <div>
                        <p className="font-semibold text-[#1c1b1b]">{product.name}</p>
                        <p className="text-xs text-neutral-400">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{product.category}</td>
                  <td className="px-6 py-4 text-sm text-[#1c1b1b]">Rs. {product.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-[#1c1b1b]">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] ${product.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditProductForm(product)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-300 hover:text-black"
                        title="Edit product"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-300 hover:text-black"
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-400">
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isFormOpen && (
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-400">{isEditing ? 'Edit product' : 'Create product'}</p>
              <h3 className="mt-2 text-2xl font-bold text-[#1c1b1b]">{isEditing ? 'Update catalog item' : 'Add a new product'}</h3>
            </div>
            <button
              onClick={closeForm}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#1c1b1b] transition hover:bg-neutral-100"
            >
              <X size={14} />
              Close
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Product Name</span>
              <input
                type="text"
                value={activeProduct.name}
                onChange={e => handleFormChange('name', e.target.value)}
                className="mt-2 w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Category</span>
              <select
                value={activeProduct.category}
                onChange={e => handleFormChange('category', e.target.value)}
                className="mt-2 w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              >
                {CATEGORY_OPTIONS.filter(option => option !== 'All').map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Price</span>
              <input
                type="number"
                value={activeProduct.price}
                onChange={e => handleFormChange('price', Number(e.target.value))}
                className="mt-2 w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Stock</span>
              <input
                type="number"
                value={activeProduct.stock}
                onChange={e => handleFormChange('stock', Number(e.target.value))}
                className="mt-2 w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">SKU</span>
              <input
                type="text"
                value={activeProduct.sku}
                onChange={e => handleFormChange('sku', e.target.value)}
                className="mt-2 w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Image URL</span>
              <input
                type="text"
                value={activeProduct.img}
                onChange={e => handleFormChange('img', e.target.value)}
                className="mt-2 w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Description</span>
              <textarea
                value={activeProduct.description}
                onChange={e => handleFormChange('description', e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none resize-none"
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Tags</span>
              <input
                type="text"
                value={activeProduct.tags}
                onChange={e => handleFormChange('tags', e.target.value)}
                placeholder="comma, separated, tags"
                className="mt-2 w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Status</span>
              <select
                value={activeProduct.status}
                onChange={e => handleFormChange('status', e.target.value as 'Active' | 'Draft')}
                className="mt-2 w-full rounded-3xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none"
              >
                {['Active', 'Draft'].map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
              <button
                type="button"
                onClick={handleSaveProduct}
                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#b30400] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#8f0300]"
              >
                <CheckCircle2 size={16} />
                {isEditing ? 'Save changes' : 'Add product'}
              </button>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={!activeProduct.name || isGeneratingAI}
                className="inline-flex items-center justify-center gap-2 rounded-3xl border border-neutral-200 bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-[#1c1b1b] transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGeneratingAI ? <RefreshCcw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate AI
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductsTab;
