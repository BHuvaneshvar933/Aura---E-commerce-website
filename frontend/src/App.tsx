import { useEffect, useState } from 'react'
import { Link, Navigate, Outlet, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { Activity, ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, CreditCard, FilePenLine, FolderTree, HelpCircle, Layers, MapPin, Package, Plus, RefreshCw, RotateCcw, Search, Server, Shield, ShoppingCart, SlidersHorizontal, Sparkles, XCircle, Zap } from 'lucide-react'
import { api, authStore, date, endpoints, message, money, type Category, type Product } from './lib'
import { CartDrawer, Footer, Header, Skeleton, Status, Toasts } from './components'
import { AdminHome, AdminOrders, AdminProducts, Coupons, Inventory } from './admin'

const q = { products: ['products'], categories: ['categories'], addresses: ['addresses'], orders: ['orders'], profile: ['profile'], adminProducts: ['admin-products'], adminOrders: ['admin-orders'], coupons: ['coupons'], inventory: ['inventory'], lowStock: ['low-stock'] }
const field = (label: string, name: string, type = 'text', required = true, value?: string | number) => <label className="field"><span>{label}</span><input name={name} type={type} defaultValue={value} required={required} /></label>
const clean = (form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries())

export function App() { return <><Header /><main><Routes><Route path="/" element={<Home />} /><Route path="/shop" element={<Shop />} /><Route path="/pricing" element={<PricingPage />} /><Route path="/product/:id" element={<ProductPage />} /><Route path="/privacy" element={<Privacy />} /><Route path="/terms" element={<Terms />} /><Route path="/contact" element={<Contact />} /><Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} /><Route path="/forgot-password" element={<Forgot />} /><Route path="/reset-password" element={<Reset />} /><Route path="/verify" element={<Verify />} /><Route path="/check-email" element={<CheckEmail />} /><Route element={<RequireAuth />}><Route path="/checkout" element={<Checkout />} /><Route path="/orders" element={<Orders />} /><Route path="/orders/:id" element={<OrderDetail />} /><Route path="/orders/:id/track" element={<TrackOrder />} /><Route path="/account" element={<Account />} /><Route path="/addresses" element={<Addresses />} /></Route><Route element={<RequireAdmin />}><Route path="/admin" element={<AdminHome />} /><Route path="/admin/products" element={<AdminProducts />} /><Route path="/admin/orders" element={<AdminOrders />} /><Route path="/admin/coupons" element={<Coupons />} /><Route path="/admin/inventory" element={<Inventory />} /></Route><Route path="*" element={<NotFound />} /></Routes></main><Footer /><CartDrawer /><Toasts /></> }

const featuredProductNames = ['Aura Signature Hoodie', 'Lumière Handbag', 'Velvet Evening Dress', 'Obsidian Sunglasses']
function Home() {
  const { data: products, isLoading } = useQuery({ queryKey: q.products, queryFn: endpoints.products });
  const { data: categories } = useQuery({ queryKey: q.categories, queryFn: endpoints.categories });
  const featuredProducts = [...(products || [])].sort((a, b) => {
    const aIndex = featuredProductNames.indexOf(a.name), bIndex = featuredProductNames.indexOf(b.name);
    return (aIndex === -1 ? featuredProductNames.length : aIndex) - (bIndex === -1 ? featuredProductNames.length : bIndex)
  });

  return <>
    <section className="hero">
      <div className="eyebrow"><Activity size={14} /> NEW COLLECTION DROP</div>
      <h1>Elevate your<br /><em>everyday.</em></h1>
      <p>AURA is a premium lifestyle brand redefining modern aesthetics. Explore our latest collection of curated fashion and accessories, designed for the bold and sophisticated.</p>
      <div className="hero-actions">
        <Link className="primary" to="/shop">Shop the Collection <ArrowRight size={17} /></Link>
        <Link className="outline" to="/pricing">Membership <ChevronRight size={17} /></Link>
      </div>
      <div className="system-strip">
        <span><b>01</b> STYLE</span>
        <span><b>02</b> ELEGANCE</span>
        <span><b>03</b> MODERN</span>
        <span><b>04</b> LUXURY</span>
      </div>
    </section>

    <section className="trusted-by">
      <span className="eyebrow">FEATURED IN</span>
      <div className="brand-logos">
        <span>VOGUE</span>
        <span>GQ</span>
        <span>BAZAAR</span>
        <span>ELLE</span>
        <span>ESQUIRE</span>
      </div>
    </section>

    <section className="features-section">
      <div className="features-header">
        <span className="eyebrow">OUR PHILOSOPHY</span>
        <h2>Crafted for the Modern Aesthete</h2>
        <p>We believe in quality over quantity, blending timeless design with contemporary silhouettes to create pieces that define an era.</p>
      </div>
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon"><Sparkles size={24} /></div>
          <h3>Premium Materials</h3>
          <p>Sourced from the finest mills globally, ensuring every garment feels as luxurious as it looks.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><Zap size={24} /></div>
          <h3>Dynamic Silhouettes</h3>
          <p>Designed to move with you, our fits are meticulously tailored for comfort without compromising style.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><Layers size={24} /></div>
          <h3>Sustainable Practices</h3>
          <p>Committed to ethical production, reducing our footprint while delivering uncompromising quality.</p>
        </div>
      </div>
    </section>

    <section className="home-section">
      <div className="section-title">
        <div><span className="eyebrow">CURATED SELECTION</span><h2>Signature Pieces.</h2></div>
        <Link to="/shop">Open catalog <ArrowRight size={16} /></Link>
      </div>
      <CategoryRail categories={categories || []} />
      {isLoading ? <Skeleton rows={4} /> : <ProductGrid products={featuredProducts} />}
    </section>

    <PricingSection isPreview={true} />
    <FAQSection />
    <CtaBanner />
  </>
}

function CategoryRail({ categories }: { categories: Category[] }) { return <div className="category-rail">{categories.map((c) => <Link to={`/shop?category=${c.id}`} key={c.id}><FolderTree size={19} /><span>{c.name}</span><small>{c.sub_categories?.length || 0} groups</small></Link>)}</div> }
function ProductGrid({ products }: { products: Product[] }) { return <div className="product-grid">{products.map((p, i) => <article className="product-card" key={p.id}><div className={`product-art art-${i % 4}`}><span>{p.name.slice(0, 1)}</span><small>{p.stock_quantity} units available</small></div><div className="product-info"><code>SKU / {p.slug}</code><h3>{p.name}</h3><p>{p.description || 'Product details available in the catalog.'}</p><div><strong>{money(p.price)}</strong><Link to={`/product/${p.id}`}>View <ArrowRight size={15} /></Link></div></div></article>)}</div> }

function PricingSection({ isPreview = false }: { isPreview?: boolean }) {
  return <section className="pricing-section">
    <div className="pricing-header">
      <span className="eyebrow">AURA MEMBERSHIP</span>
      <h2>Exclusive Access, Elevated Experience</h2>
      <p>Join the AURA collective to unlock early access, private styling sessions, and member-only events.</p>
    </div>
    <div className="pricing-grid">
      <div className="pricing-card">
        <div className="card-head">
          <h3>Insider</h3>
          <p className="card-desc">For those beginning their journey with AURA.</p>
          <div className="price-row"><strong>Complimentary</strong></div>
        </div>
        <ul>
          <li><CheckCircle2 size={16} /> Seasonal lookbooks</li>
          <li><CheckCircle2 size={16} /> Standard shipping</li>
          <li><CheckCircle2 size={16} /> Style newsletters</li>
        </ul>
        <Link className="outline full" to="/register">Join for free</Link>
      </div>

      <div className="pricing-card featured">
        <span className="popular-badge">MOST POPULAR</span>
        <div className="card-head">
          <h3>Lumière Club</h3>
          <p className="card-desc">Elevate your wardrobe with premium benefits.</p>
          <div className="price-row"><strong>₹2,499</strong><span>/ year</span></div>
        </div>
        <ul>
          <li><CheckCircle2 size={16} /> Everything in Insider</li>
          <li><CheckCircle2 size={16} /> 48-hour early access to drops</li>
          <li><CheckCircle2 size={16} /> Free expedited shipping</li>
          <li><CheckCircle2 size={16} /> Anniversary gifts</li>
        </ul>
        <Link className="primary full" to="/register">Upgrade to Lumière</Link>
      </div>

      <div className="pricing-card">
        <div className="card-head">
          <h3>Obsidian Tier</h3>
          <p className="card-desc">The ultimate bespoke fashion experience.</p>
          <div className="price-row"><strong>Custom</strong><span>invitation only</span></div>
        </div>
        <ul>
          <li><CheckCircle2 size={16} /> Personal styling concierge</li>
          <li><CheckCircle2 size={16} /> Made-to-measure alterations</li>
          <li><CheckCircle2 size={16} /> Private event invitations</li>
          <li><CheckCircle2 size={16} /> VIP dedicated support</li>
        </ul>
        <Link className="outline full" to="/contact">Request invitation</Link>
      </div>
    </div>
  </section>
}

function PricingPage() {
  return <section className="page">
    <div className="page-heading">
      <div>
        <span className="eyebrow">AURA MEMBERSHIP</span>
        <h1>Join the<br />collective.</h1>
      </div>
      <Link className="primary" to="/contact">Contact concierge <ArrowRight size={16} /></Link>
    </div>
    <PricingSection />
    <FAQSection />
    <CtaBanner />
  </section>
}

function FAQSection() {
  const faqs = [
    { q: 'How do I care for my AURA garments?', a: 'Each piece comes with a specific care label. Generally, we recommend dry cleaning for structural pieces and cold washing for knits to preserve the fabric integrity.' },
    { q: 'What is your return policy?', a: 'We accept returns within 14 days of delivery for unworn, unwashed items with tags attached. Custom or altered pieces are non-refundable.' },
    { q: 'Do you offer international shipping?', a: 'Yes, we ship worldwide. Shipping costs and delivery times vary depending on the destination.' },
    { q: 'Can I book a private fitting?', a: 'Obsidian tier members can book private fittings through their concierge. Other customers can request appointments at our flagship locations subject to availability.' },
  ];
  return <section className="faq-section">
    <div className="faq-header">
      <span className="eyebrow">CLIENT SERVICES</span>
      <h2>Frequently Asked Questions</h2>
      <p>Everything you need to know about shopping with AURA.</p>
    </div>
    <div className="faq-grid">
      {faqs.map((f) => <article key={f.q} className="faq-card">
        <h3>{f.q}</h3>
        <p>{f.a}</p>
      </article>)}
    </div>
  </section>
}

function CtaBanner() {
  return <section className="cta-banner">
    <span className="eyebrow">THE LATEST DROPS</span>
    <h2>Redefine your wardrobe.</h2>
    <p>Discover pieces that seamlessly transition from day to night, crafted with uncompromising quality.</p>
    <div className="cta-buttons">
      <Link className="primary" to="/shop">Shop the Collection <ArrowRight size={16} /></Link>
      <Link className="outline" to="/register">Create an Account <ChevronRight size={16} /></Link>
    </div>
  </section>
}

function Shop() { const [params, setParams] = useSearchParams(); const categoryId = params.get('category') || ''; const [search, setSearch] = useState(''); const [debounced, setDebounced] = useState(''); useEffect(() => { const t = setTimeout(() => setDebounced(search.trim()), 300); return () => clearTimeout(t) }, [search]); const { data: categories } = useQuery({ queryKey: q.categories, queryFn: endpoints.categories }); const searching = debounced.length > 0; const { data, isLoading, isError } = useQuery({ queryKey: searching ? ['product-search', debounced] : q.products, queryFn: () => searching ? endpoints.searchProducts(debounced) : endpoints.products() }); const activeCategory = categories?.find((c) => c.id === categoryId); const found = (data || []).filter((p) => !categoryId || p.category_id === categoryId); return <section className="page"><div className="page-heading"><div><span className="eyebrow">BOUTIQUE / COLLECTION</span><h1>Discover your<br />next statement.</h1></div><div className="search"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pieces" /></div></div>{categories && categories.length > 0 && <div className="category-rail"><button className={!categoryId ? 'active' : ''} onClick={() => setParams({})}>All</button>{categories.map((c) => <button key={c.id} className={categoryId === c.id ? 'active' : ''} onClick={() => setParams({ category: c.id })}>{c.name}</button>)}</div>}<div className="catalog-toolbar"><span>{found.length} pieces {searching ? `matched "${debounced}"` : 'in collection'}{activeCategory ? ` for ${activeCategory.name}` : ''}</span><button><SlidersHorizontal size={16} /> Filters</button></div>{isLoading ? <Skeleton rows={8} /> : isError ? <ApiError /> : found.length === 0 ? <Empty title="No matches found." text="Try a different search term or category." to="/shop" label="Reset" /> : <ProductGrid products={found} />}</section> }
function ProductPage() { const { id = '' } = useParams(); const { data: p, isLoading } = useQuery({ queryKey: ['product', id], queryFn: () => endpoints.product(id) }); const qc = useQueryClient(), toast = authStore((s) => s.toast); const add = useMutation({ mutationFn: () => api.post('/api/v1/cart/items', { product_id: id, quantity: 1 }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['cart'] }); toast('Added to cart.'); authStore.getState().toggleCart() }, onError: (e) => toast(message(e), 'error') }); if (isLoading) return <section className="page"><Skeleton rows={6} /></section>; if (!p) return <NotFound />; return <section className="page"><Link className="back" to="/shop"><ArrowLeft size={16} /> Catalog</Link><div className="product-detail"><div className="product-visual"><span>{p.name.slice(0, 1)}</span><code>INVENTORY / {p.stock_quantity} UNITS</code></div><div><span className="eyebrow">PRODUCT / {p.slug}</span><h1>{p.name}</h1><strong className="price">{money(p.price)}</strong><p>{p.description || 'No product description was supplied.'}</p><div className="stock-line"><span className={p.stock_quantity ? 'dot good' : 'dot bad'} />{p.stock_quantity ? `${p.stock_quantity} units currently available` : 'Out of stock'}</div><button className="primary" disabled={!p.stock_quantity || add.isPending} onClick={() => add.mutate()}><ShoppingCart size={17} /> Add to cart</button><dl className="specs">{Object.entries(p.attributes || {}).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>)}</dl></div></div></section> }

function LegalPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: { title: string; text: string }[] }) { return <section className="page legal-page"><div className="legal-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{intro}</p><small>Last updated: August 14, 2026</small></div><div className="legal-sections">{sections.map((section) => <article key={section.title}><h2>{section.title}</h2><p>{section.text}</p></article>)}</div></section> }
function Privacy() { return <LegalPage eyebrow="LEGAL / PRIVACY" title="Privacy policy." intro="This policy explains how AURA handles your information when you use our services." sections={[{ title: 'Data collection', text: 'We collect account, order, and device information needed to provide a tailored shopping experience and process your transactions securely.' }, { title: 'Cookie policy', text: 'We use essential cookies for maintaining your session and preferences. Optional analytics help us improve our offerings.' }, { title: 'Security', text: 'We employ industry-standard encryption and security practices to protect your personal information.' }]} /> }
function Terms() { return <LegalPage eyebrow="LEGAL / TERMS" title="Terms of service." intro="These terms govern your use of the AURA website and services." sections={[{ title: 'Use of service', text: 'You may use our platform only in compliance with applicable laws. Unauthorized use or interference with the site is prohibited.' }, { title: 'Accounts', text: 'You are responsible for maintaining the confidentiality of your account credentials.' }, { title: 'Purchases', text: 'All orders are subject to availability and confirmation of the order price.' }]} /> }
function Contact() { return <section className="page contact-page"><div className="legal-heading"><span className="eyebrow">CLIENT CARE / CONTACT</span><h1>Reach out to us.</h1><p>For styling advice, order inquiries, or bespoke services, our concierge team is here to assist.</p></div><div className="contact-grid"><article className="contact-card"><code>CONCIERGE SERVICES</code><a href="mailto:concierge@aura-lifestyle.com">concierge@aura-lifestyle.com</a><p>We aim to respond to all inquiries within 24 hours.</p><dl><div><dt>Hours</dt><dd>Monday–Saturday, 10:00–20:00</dd></div><div><dt>Services</dt><dd>Orders, styling, and general inquiries</dd></div></dl></article><form className="contact-form" action="mailto:concierge@aura-lifestyle.com" method="post" encType="text/plain"><label className="field"><span>Your email</span><input type="email" name="email" autoComplete="email" required /></label><label className="field"><span>Message</span><textarea name="message" placeholder="How can we assist you today?" required /></label><button className="primary" type="submit">Send Message <ArrowRight size={17} /></button></form></div></section> }

function AuthShell({ title, note, children }: { title: string; note: string; children: React.ReactNode }) { return <section className="auth"><div className="auth-aside"><div><h2>AURA</h2><p>Step into a world of curated aesthetics and premium lifestyle.</p></div></div><div className="auth-form"><span className="eyebrow">CLIENT PORTAL</span><h1>{title}</h1><p>{note}</p>{children}</div></section> }
function Login() { const nav = useNavigate(), toast = authStore((s) => s.toast); const submit = useMutation({ mutationFn: (data: any) => api.post('/auth/login', new URLSearchParams({ username: data.username, password: data.password }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }), onSuccess: async ({ data }) => { try { authStore.setState({ access: data.access_token, refresh: data.refresh_token }); localStorage.setItem('refresh_token', data.refresh_token); const user = await endpoints.me(); authStore.getState().setSession(user, data); nav(user.is_admin ? '/admin' : '/shop') } catch (e) { authStore.getState().clear(); toast(message(e), 'error') } }, onError: (e) => toast(message(e), 'error') }); return <AuthShell title="Sign in." note="Your shopping session and admin access share one identity."><form onSubmit={(e) => { e.preventDefault(); submit.mutate(clean(e.currentTarget)) }}><>{field('Email or username', 'username')}{field('Password', 'password', 'password')}</><button className="primary full">{submit.isPending ? 'Checking credentials…' : 'Sign in'} <ArrowRight size={17} /></button></form><div className="auth-links"><Link to="/forgot-password">Forgot password?</Link><span>New here? <Link to="/register">Create an account</Link></span></div></AuthShell> }
function Register() { const nav = useNavigate(), toast = authStore((s) => s.toast); const reg = useMutation({ mutationFn: (d: any) => api.post('/auth/register', d), onSuccess: (_, d) => nav(`/check-email?email=${encodeURIComponent(d.email)}`), onError: (e) => toast(message(e), 'error') }); return <AuthShell title="Create an account." note="We’ll send a verification link before your session can be activated."><form onSubmit={(e) => { e.preventDefault(); reg.mutate(clean(e.currentTarget)) }} className="two-col">{field('Full name', 'full_name', 'text', false)}{field('Phone number', 'phone_number', 'tel', false)}{field('Email', 'email', 'email')}{field('Username', 'username')}{field('Password', 'password', 'password')}<button className="primary full">Create & verify <ArrowRight size={17} /></button></form><div className="auth-links"><span>Already registered? <Link to="/login">Sign in</Link></span></div></AuthShell> }
function CheckEmail() { const [params] = useSearchParams(), toast = authStore((s) => s.toast); const resend = useMutation({ mutationFn: () => api.post('/auth/resend-verification', undefined, { params: { email: params.get('email') } }), onSuccess: () => toast('Verification message sent.') }); return <AuthShell title="Check your inbox." note={`We sent a verification link to ${params.get('email') || 'your email address'}. Activate your account, then come back to sign in.`}><button className="outline full" onClick={() => resend.mutate()}>Resend verification <RefreshCw size={16} /></button><div className="auth-links"><Link to="/login">Return to sign in</Link></div></AuthShell> }
function Forgot() { return <PasswordAction title="Reset your password." note="Tell us where to send the reset link." url="/auth/forgot-password" fields={[['Email', 'email', 'email']]} /> }
function Reset() { const [params] = useSearchParams(); return <PasswordAction title="Set a new password." note="Choose a strong password to secure your account." url="/auth/reset-password" fields={[["Email", "email", "email"], ['New password', 'new_password', 'password']]} extra={{ token: params.get('token') || '' }} /> }
function PasswordAction({ title, note, url, fields, extra = {} }: any) { const nav = useNavigate(), toast = authStore((s) => s.toast); const mutation = useMutation({ mutationFn: (d: any) => api.post(url, d), onSuccess: () => { toast('Request completed.'); nav('/login') }, onError: (e) => toast(message(e), 'error') }); return <AuthShell title={title} note={note}><form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ ...clean(e.currentTarget), ...extra }) }}>{fields.map(([l, n, t]: string[]) => field(l, n, t))}<button className="primary full">Continue <ArrowRight size={17} /></button></form></AuthShell> }
function Verify() { const [params] = useSearchParams(), toast = authStore((s) => s.toast); const query = useQuery({ queryKey: ['verify', params.get('token')], queryFn: () => api.get('/auth/verify', { params: { token: params.get('token') } }), retry: false }); useEffect(() => { if (query.isSuccess) toast('Email verified. You can sign in now.') }, [query.isSuccess]); return <AuthShell title={query.isSuccess ? 'Email verified.' : 'Verifying email…'} note={query.isError ? message(query.error) : 'Your account activation is being confirmed by the identity service.'}><Link className="primary full" to="/login">Continue to sign in <ArrowRight size={17} /></Link></AuthShell> }

function RequireAuth() { return authStore((s) => s.user) ? <Outlet /> : <Navigate to="/login" replace /> }
function RequireAdmin() { const u = authStore((s) => s.user); return u?.is_admin ? <Outlet /> : <Navigate to="/" replace /> }

function Checkout() { const { data: addresses, isLoading } = useQuery({ queryKey: q.addresses, queryFn: endpoints.addresses }); const [selected, setSelected] = useState(''); const [coupon, setCoupon] = useState(''); const toast = authStore((s) => s.toast); const checkout = useMutation({ mutationFn: () => api.post('/api/v1/orders/checkout', { address_id: selected, coupon_code: coupon || undefined }), onSuccess: ({ data }) => { const Razorpay = (window as any).Razorpay; const pd = data.payment_details || {}; if (!Razorpay) { toast('Order confirmed.', 'success'); return } new Razorpay({ key: pd.key || import.meta.env.VITE_RAZORPAY_KEY_ID, order_id: pd.razorpay_order_id, amount: pd.amount, currency: pd.currency || 'INR', name: 'AURA Lifestyle', handler: (response: any) => verify.mutate(response) }).open() }, onError: (e) => toast(message(e), 'error') }); const nav = useNavigate(); const verify = useMutation({ mutationFn: (data: any) => api.post('/api/v1/orders/verify-payment', data), onSuccess: ({ data }) => { toast('Payment verified. Order confirmed.'); nav(`/orders/${data.id || data.order_id}`) }, onError: (e) => toast(message(e), 'error') }); return <section className="page checkout"><Link className="back" to="/shop"><ArrowLeft size={16} /> Continue Shopping</Link><div className="page-heading"><div><span className="eyebrow">SECURE CHECKOUT</span><h1>Delivery details.</h1></div></div>{isLoading ? <Skeleton rows={3} /> : <><div className="address-list">{(addresses || []).map((a) => <button className={`address-card ${selected === a.id ? 'selected' : ''}`} onClick={() => setSelected(a.id)} key={a.id}><MapPin size={19} /><b>{a.full_name}{a.is_default && <small> DEFAULT</small>}</b><span>{a.house_no}, {a.area}, {a.city}, {a.state} — {a.pincode}</span><span>{a.phone_number}</span></button>)}<Link className="add-address" to="/addresses"><Plus /> Add a new address</Link></div><div className="checkout-action"><label className="field"><span>Promo code (optional)</span><input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="AURA20" /></label><button className="primary" disabled={!selected || checkout.isPending} onClick={() => checkout.mutate()}><CreditCard size={17} /> {checkout.isPending ? 'Processing…' : 'Proceed to Payment'}</button></div></>}</section> }
function Orders() { const { data, isLoading, isError } = useQuery({ queryKey: q.orders, queryFn: endpoints.orders }); return <section className="page"><div className="page-heading"><div><span className="eyebrow">YOUR PURCHASES</span><h1>Order History.</h1></div></div>{isLoading ? <Skeleton rows={5} /> : isError ? <ApiError /> : !data?.length ? <Empty title="No orders yet." text="Your recent purchases will appear here." to="/shop" label="Explore Collection" /> : <div className="data-table order-table"><div className="table-head"><span>ORDER ID</span><span>DATE</span><span>STATUS</span><span>TOTAL</span><span /></div>{data.map((o) => <div className="table-row" key={o.id}><code>{o.id.slice(0, 8)}…</code><span>{date(o.created_at)}</span><Status value={o.status} /><code>{money(o.total_price)}</code><Link to={`/orders/${o.id}`}>View <ArrowRight size={14} /></Link></div>)}</div>}</section> }
function OrderDetail() { const { id = '' } = useParams(), qc = useQueryClient(), toast = authStore((s) => s.toast); const { data: order, isLoading } = useQuery({ queryKey: ['order', id], queryFn: () => endpoints.order(id) }); const cancel = useMutation({ mutationFn: () => api.patch(`/api/v1/orders/${id}/cancel`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['order', id] }); qc.invalidateQueries({ queryKey: q.orders }); toast('Order cancelled.') }, onError: (e) => toast(message(e), 'error') }); if (isLoading) return <section className="page"><Skeleton /></section>; if (!order) return <NotFound />; return <section className="page"><Link className="back" to="/orders"><ArrowLeft size={16} /> Back to Orders</Link><div className="order-header"><div><span className="eyebrow">ORDER DETAILS</span><h1><code>#{order.id.slice(0, 8)}</code></h1><p>Placed on {date(order.created_at)}</p></div><Status value={order.status} /></div><div className="receipt-grid"><div className="receipt"><h3>Items</h3>{order.items.map((i) => <div className="receipt-item" key={i.product_id}><span><b>{i.product_name}</b><small>Qty: {i.quantity}</small></span><code>{money(i.price_at_purchase * i.quantity)}</code></div>)}<strong>Total <code>{money(order.total_price)}</code></strong></div><aside className="order-actions"><Link className="primary full" to={`/orders/${id}/track`}><Activity size={17} /> Track Order</Link>{['pending', 'paid', 'processing'].includes(order.status.toLowerCase()) && <button className="outline full danger" onClick={() => cancel.mutate()}><XCircle size={17} /> Cancel Order</button>}</aside></div></section> }
function TrackOrder() { const { id = '' } = useParams(), reduced = useReducedMotion(), toast = authStore((s) => s.toast); const [status, setStatus] = useState('pending'); const { data: order } = useQuery({ queryKey: ['order', id], queryFn: () => endpoints.order(id) }); useEffect(() => { if (order) setStatus(order.status) }, [order]); useEffect(() => { const token = authStore.getState().access; if (!token) return; const base = (import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000').replace(/\/$/, ''); const ws = new WebSocket(`${base}/api/v1/ws/orders/${id}?token=${token}`); ws.onmessage = (event) => { try { const data = JSON.parse(event.data); if (data.status || data.type === 'status_update') { setStatus(data.status || data.new_status); toast(`Order is now ${data.status || data.new_status}.`) } } catch { /* Ignore malformed WebSocket messages. */ } }; const heartbeat = setInterval(() => ws.readyState === WebSocket.OPEN && ws.send('ping'), 25_000); return () => { clearInterval(heartbeat); ws.close() } }, [id]); const stages = ['pending', 'paid', 'processing', 'shipped', 'delivered']; const idx = stages.indexOf(status.toLowerCase()); return <section className="page tracking"><Link className="back" to={`/orders/${id}`}><ArrowLeft size={16} /> Order Details</Link><span className="eyebrow"><Activity size={14} /> TRACKING</span><h1>Order Status.</h1><p className="tracking-id">#{id.slice(0, 8)}</p><div className="timeline">{stages.map((s, i) => <motion.div key={s} className={`stage ${i <= idx ? 'complete' : ''} ${status.toLowerCase() === 'cancelled' ? 'cancelled' : ''}`} initial={false} animate={{ opacity: i <= idx ? 1 : .35, y: i === idx && !reduced ? [0, -5, 0] : 0 }} transition={{ duration: .45 }}><div className="stage-mark">{i < idx ? <Check size={16} /> : <span>{String(i + 1).padStart(2, '0')}</span>}</div><div><Status value={s} /><h3>{s === 'pending' ? 'Order Placed' : s === 'paid' ? 'Payment Confirmed' : s === 'processing' ? 'Preparing to Ship' : s === 'shipped' ? 'On the Way' : 'Delivered'}</h3></div></motion.div>)}</div>{status.toLowerCase() === 'cancelled' && <div className="cancel-note">This order was cancelled.</div>}</section> }

function Account() { const user = authStore((s) => s.user); const qc = useQueryClient(), toast = authStore((s) => s.toast); const edit = useMutation({ mutationFn: (d: any) => api.patch('/api/v1/users/me', d), onSuccess: ({ data }) => { authStore.getState().setSession(data); qc.invalidateQueries({ queryKey: q.profile }); toast('Profile updated.') }, onError: (e) => toast(message(e), 'error') }); if (!user) return null; return <section className="page account"><div className="page-heading"><div><span className="eyebrow">MY ACCOUNT</span><h1>Profile Settings.</h1></div><Link className="outline" to="/addresses"><MapPin size={16} /> Addresses</Link></div><form className="profile-form" onSubmit={(e) => { e.preventDefault(); edit.mutate(clean(e.currentTarget)) }}><div className="profile-avatar">{user.username.slice(0, 1).toUpperCase()}</div><div><h2>{user.full_name || user.username}</h2><p>{user.is_admin ? 'AURA Administrator' : 'AURA Member'}</p></div><div className="form-grid">{field('Full name', 'full_name', 'text', false, user.full_name)}{field('Email', 'email', 'email', false, user.email)}{field('Phone number', 'phone_number', 'tel', false, user.phone_number)}<button className="primary">Save Changes</button></div></form></section> }
function Addresses() { const list = useQuery({ queryKey: q.addresses, queryFn: endpoints.addresses }); const [edit, setEdit] = useState<any>(); return <section className="page"><div className="page-heading"><div><span className="eyebrow">ADDRESS BOOK</span><h1>Saved Addresses.</h1></div><button className="primary" onClick={() => setEdit({})}><Plus size={16} /> Add New</button></div>{list.isLoading ? <Skeleton rows={4} /> : <div className="addresses">{list.data?.map((a) => <AddressCard key={a.id} address={a} edit={() => setEdit(a)} />)}{!list.data?.length && <Empty title="No addresses saved." text="Add a delivery address to expedite checkout." />}</div>}{edit && <AddressForm address={edit} close={() => setEdit(undefined)} />}</section> }
function AddressCard({ address, edit }: any) { const qc = useQueryClient(), toast = authStore((s) => s.toast); const action = useMutation({ mutationFn: (mode: string) => mode === 'default' ? api.patch(`/api/v1/addresses/${address.id}/default`) : api.delete(`/api/v1/addresses/${address.id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: q.addresses }); toast('Address updated.') }, onError: (e) => toast(message(e), 'error') }); return <article className="address-entry"><MapPin /><div><b>{address.full_name} {address.is_default && <small>DEFAULT</small>}</b><p>{address.house_no}, {address.area}, {address.city}, {address.state} — {address.pincode}<br />{address.phone_number}</p></div><div><button className="text-btn" onClick={edit}>Edit</button>{!address.is_default && <button className="text-btn" onClick={() => action.mutate('default')}>Set Default</button>}<button className="text-btn danger" onClick={() => action.mutate('delete')}>Delete</button></div></article> }
function AddressForm({ address, close }: any) { const qc = useQueryClient(), toast = authStore((s) => s.toast); const mutation = useMutation({ mutationFn: (d: any) => address.id ? api.patch(`/api/v1/addresses/${address.id}`, d) : api.post('/api/v1/addresses/', d), onSuccess: () => { qc.invalidateQueries({ queryKey: q.addresses }); toast('Address saved.'); close() }, onError: (e) => toast(message(e), 'error') }); return <div className="modal-layer"><form className="modal-form wide" onSubmit={(e) => { e.preventDefault(); mutation.mutate(clean(e.currentTarget)) }}><button className="modal-close" type="button" onClick={close}>×</button><span className="eyebrow">DELIVERY</span><h2>{address.id ? 'Edit Address' : 'New Address'}</h2><div className="two-col">{field('Full name', 'full_name', 'text', true, address.full_name)}{field('Phone number', 'phone_number', 'tel', true, address.phone_number)}{field('Apartment / Suite', 'house_no', 'text', true, address.house_no)}{field('Street / Area', 'area', 'text', true, address.area)}{field('City', 'city', 'text', true, address.city)}{field('State', 'state', 'text', true, address.state)}{field('Postal Code', 'pincode', 'text', true, address.pincode)}<label className="field"><span>Address type</span><select name="address_type" defaultValue={address.address_type || 'home'}><option value="home">Home</option><option value="office">Office</option><option value="other">Other</option></select></label></div><button className="primary full">Save Address</button></form></div> }
function Empty({ title, text, to, label }: { title: string; text: string; to?: string; label?: string }) { return <div className="empty"><Package size={26} /><h3>{title}</h3><p>{text}</p>{to && <Link className="primary" to={to}>{label} <ArrowRight size={15} /></Link>}</div> }
function ApiError() { return <div className="empty"><RotateCcw size={26} /><h3>Connection Error</h3><p>We are unable to reach the servers at this moment. Please try again later.</p></div> }
function NotFound() { return <section className="page"><Empty title="Page Not Found." text="The page you are looking for does not exist." to="/" label="Return Home" /></section> }
