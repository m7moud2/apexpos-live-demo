/**
 * ApexPOS - High-Speed POS Terminal Controller
 */
class POSTerminal {
    constructor() {
        this.products = [];
        this.categories = [];
        this.customers = [];
        this.settings = {};
        this.cart = [];
        this.selectedCategory = 'all';
        this.discount = 0;
        this.discountType = 'fixed'; // 'fixed' or 'percent'
        this.taxRate = 14;
        this.customerId = null;
        this.paymentMethod = 'cash';
        this.heldOrderId = null;
        this.heldOrders = [];
        this.barcodeBuffer = '';
        this.barcodeTime = 0;

        this.init();
    }

    async init() {
        await this.loadCatalog();
        this.setupBarcodeGunListener();
        this.setupKeyboardShortcuts();
        this.renderCategories();
        this.renderProducts();
        this.renderCart();
        this.loadHeldOrders();

        window.addEventListener('languageChanged', () => {
            this.renderCategories();
            this.renderProducts();
            this.renderCart();
        });
    }

    async loadCatalog() {
        try {
            const res = await fetch('api.php?action=get_catalog');
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    this.products = data.products || [];
                    this.categories = data.categories || [];
                    this.customers = data.customers || [];
                    this.settings = data.settings || {};
                    this.taxRate = parseFloat(this.settings.tax_rate || 14);
                    return;
                }
            }
        } catch (e) {
            console.log('Running in offline/demo client mode:', e);
        }

        // Demo fallback data if opened without PHP server (e.g. static preview on Netlify)
        this.useDemoData();
    }

    useDemoData() {
        this.categories = [
            { id: 1, name_en: 'Beverages', name_ar: 'مشروبات وعصائر', icon: '☕', color: '#0284c7' },
            { id: 2, name_en: 'Snacks & Sweets', name_ar: 'وجبات خفيفة وحلويات', icon: '🍪', color: '#f59e0b' },
            { id: 3, name_en: 'Dairy & Breakfast', name_ar: 'ألبان وأجبان', icon: '🧀', color: '#10b981' },
            { id: 4, name_en: 'Household & Cleaning', name_ar: 'منظفات وعناية منزلية', icon: '🧴', color: '#8b5cf6' },
            { id: 5, name_en: 'Personal Care', name_ar: 'عناية شخصية', icon: '🧼', color: '#ec4899' },
            { id: 6, name_en: 'Stationery & Tech', name_ar: 'أدوات مكتبية وإلكترونيات', icon: '🔌', color: '#64748b' }
        ];

        this.products = [
            { id: 1, category_id: 1, name_en: 'Espresso Roast Coffee 250g', name_ar: 'بن قهوة إسبريسو 250 جم', barcode: '622100100101', sku: 'BEV-001', cost_price: 95.0, selling_price: 140.0, stock_qty: 45, image: '☕' },
            { id: 2, category_id: 1, name_en: 'Mineral Water 1.5L', name_ar: 'مياه معدنية 1.5 لتر', barcode: '622100100102', sku: 'BEV-002', cost_price: 6.0, selling_price: 10.0, stock_qty: 120, image: '💧' },
            { id: 3, category_id: 1, name_en: 'Fresh Orange Juice 1L', name_ar: 'عصير برتقال طبيعي 1 لتر', barcode: '622100100103', sku: 'BEV-003', cost_price: 25.0, selling_price: 38.0, stock_qty: 30, image: '🍊' },
            { id: 4, category_id: 1, name_en: 'Green Tea Box 50 Bags', name_ar: 'شاي أخضر 50 كيس', barcode: '622100100104', sku: 'BEV-004', cost_price: 32.0, selling_price: 50.0, stock_qty: 50, image: '🍵' },
            { id: 5, category_id: 2, name_en: 'Dark Chocolate 85% 100g', name_ar: 'شوكولاتة داكنة 85% 100 جم', barcode: '622100200201', sku: 'SNK-001', cost_price: 35.0, selling_price: 55.0, stock_qty: 60, image: '🍫' },
            { id: 6, category_id: 2, name_en: 'Salted Roasted Almonds 150g', name_ar: 'لوز محمص ومملح 150 جم', barcode: '622100200202', sku: 'SNK-002', cost_price: 60.0, selling_price: 95.0, stock_qty: 25, image: '🥜' },
            { id: 7, category_id: 2, name_en: 'Potato Chips Barbecue', name_ar: 'شيبسي بطاطس بالباربكيو', barcode: '622100200203', sku: 'SNK-003', cost_price: 9.0, selling_price: 15.0, stock_qty: 80, image: '🥔' },
            { id: 8, category_id: 2, name_en: 'Oat Cookies with Honey', name_ar: 'بسكويت شوفان بالعسل', barcode: '622100200204', sku: 'SNK-004', cost_price: 18.0, selling_price: 28.0, stock_qty: 40, image: '🍪' },
            { id: 9, category_id: 3, name_en: 'Full Cream Milk 1L', name_ar: 'حليب كامل الدسم 1 لتر', barcode: '622100300301', sku: 'DIR-001', cost_price: 28.0, selling_price: 40.0, stock_qty: 55, image: '🥛' },
            { id: 10, category_id: 3, name_en: 'Greek Yogurt 170g', name_ar: 'زبادي يوناني 170 جم', barcode: '622100300302', sku: 'DIR-002', cost_price: 15.0, selling_price: 24.0, stock_qty: 40, image: '🥣' },
            { id: 11, category_id: 3, name_en: 'Cheddar Cheese Block 200g', name_ar: 'جبنة شيدر قالب 200 جم', barcode: '622100300303', sku: 'DIR-003', cost_price: 50.0, selling_price: 78.0, stock_qty: 20, image: '🧀' },
            { id: 12, category_id: 4, name_en: 'Dishwashing Liquid 1L', name_ar: 'سائل غسيل الأطباق 1 لتر', barcode: '622100400401', sku: 'HSD-001', cost_price: 22.0, selling_price: 35.0, stock_qty: 35, image: '🧴' },
            { id: 13, category_id: 4, name_en: 'Multipurpose Cleaner 750ml', name_ar: 'منظف متعدد الأغراض 750 مل', barcode: '622100400402', sku: 'HSD-002', cost_price: 30.0, selling_price: 48.0, stock_qty: 18, image: '🧽' },
            { id: 14, category_id: 5, name_en: 'Herbal Toothpaste 100ml', name_ar: 'معجون أسنان بالأعشاب 100 مل', barcode: '622100500501', sku: 'PER-001', cost_price: 26.0, selling_price: 42.0, stock_qty: 30, image: '🪥' },
            { id: 15, category_id: 5, name_en: 'Hydrating Body Wash 400ml', name_ar: 'غسول جسم مرطب 400 مل', barcode: '622100500502', sku: 'PER-002', cost_price: 45.0, selling_price: 75.0, stock_qty: 15, image: '🧼' },
            { id: 16, category_id: 6, name_en: 'Fast Charge Type-C Cable 1.5m', name_ar: 'كابل شحن سريع Type-C 1.5م', barcode: '622100600601', sku: 'TEC-001', cost_price: 35.0, selling_price: 70.0, stock_qty: 25, image: '🔌' },
            { id: 17, category_id: 6, name_en: 'Wireless Optical Mouse', name_ar: 'ماوس بصري لاسلكي', barcode: '622100600602', sku: 'TEC-002', cost_price: 90.0, selling_price: 160.0, stock_qty: 12, image: '🖱️' }
        ];

        this.customers = [
            { id: 1, name: 'General Customer (عميل عام)', phone: '', balance: 0 },
            { id: 2, name: 'Ahmed Mostafa (أحمد مصطفى)', phone: '01015554321', balance: 0 },
            { id: 3, name: 'Sara Ibrahim (سارة إبراهيم)', phone: '01128889012', balance: 120 }
        ];

        this.settings = {
            store_name: 'Apex Retail & Mart',
            store_name_ar: 'متجر إيبكس للتجزئة',
            phone: '+20 100 234 5678',
            tax_number: 'EG-984-721-002',
            currency_symbol: 'EGP',
            currency_symbol_ar: 'ج.م',
            tax_rate: '14',
            receipt_paper_size: '80mm'
        };
        this.taxRate = 14;
    }

    setupBarcodeGunListener() {
        document.addEventListener('keydown', (e) => {
            // Ignore if user is typing inside modal inputs
            if (e.target.tagName === 'INPUT' && e.target.id !== 'pos-search-input') {
                return;
            }

            const now = Date.now();
            if (now - this.barcodeTime > 100) {
                this.barcodeBuffer = '';
            }
            this.barcodeTime = now;

            if (e.key === 'Enter') {
                if (this.barcodeBuffer.length >= 4) {
                    this.scanBarcode(this.barcodeBuffer.trim());
                    this.barcodeBuffer = '';
                    e.preventDefault();
                }
            } else if (e.key.length === 1) {
                this.barcodeBuffer += e.key;
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                const search = document.getElementById('pos-search-input');
                if (search) search.focus();
            } else if (e.key === 'F9') {
                e.preventDefault();
                if (this.cart.length > 0) {
                    this.openPaymentModal();
                }
            } else if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    scanBarcode(code) {
        const prod = this.products.find(p => p.barcode === code);
        if (prod) {
            window.posAudio.beep();
            this.addToCart(prod.id);
            this.showToast(`✓ ${this.getProdName(prod)}`, 'success');
        } else {
            window.posAudio.error();
            this.showToast(`صنف غير معروف: ${code}`, 'error');
        }
    }

    getProdName(p) {
        return window.i18n.currentLang === 'ar' ? (p.name_ar || p.name_en) : (p.name_en || p.name_ar);
    }

    getCurrency() {
        return window.i18n.currentLang === 'ar' ? (this.settings.currency_symbol_ar || 'ج.م') : (this.settings.currency_symbol || 'EGP');
    }

    renderCategories() {
        const container = document.getElementById('pos-categories');
        if (!container) return;

        const isAr = window.i18n.currentLang === 'ar';
        let html = `
            <button onclick="terminal.filterCategory('all')" 
                class="px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shadow-sm ${this.selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-white text-slate-700 hover:bg-slate-100'}">
                ${window.i18n.t('allCategories')}
            </button>
        `;

        this.categories.forEach(cat => {
            const active = this.selectedCategory === String(cat.id);
            const name = isAr ? cat.name_ar : cat.name_en;
            html += `
                <button onclick="terminal.filterCategory('${cat.id}')" 
                    class="px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shadow-sm ${active ? 'bg-blue-600 text-white shadow-blue-500/30' : 'bg-white text-slate-700 hover:bg-slate-100'}">
                    ${cat.icon ? `<span class="mr-1 ml-1">${cat.icon}</span>` : ''} ${name}
                </button>
            `;
        });

        container.innerHTML = html;
    }

    filterCategory(catId) {
        this.selectedCategory = catId;
        this.renderCategories();
        this.renderProducts();
    }

    renderProducts() {
        const grid = document.getElementById('pos-product-grid');
        if (!grid) return;

        const searchQuery = (document.getElementById('pos-search-input')?.value || '').toLowerCase().trim();
        const curr = this.getCurrency();

        let filtered = this.products.filter(p => {
            const matchesCat = this.selectedCategory === 'all' || String(p.category_id) === this.selectedCategory;
            const matchesSearch = !searchQuery || 
                (p.name_en && p.name_en.toLowerCase().includes(searchQuery)) ||
                (p.name_ar && p.name_ar.includes(searchQuery)) ||
                (p.barcode && p.barcode.includes(searchQuery)) ||
                (p.sku && p.sku.toLowerCase().includes(searchQuery));
            return matchesCat && matchesSearch;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-16 text-center text-slate-400">
                    <p class="text-4xl mb-2">🔍</p>
                    <p class="text-base font-medium">لم يتم العثور على أصناف مطابقة</p>
                </div>
            `;
            return;
        }

        let html = '';
        filtered.forEach(p => {
            const isLowStock = p.stock_qty <= (p.min_stock_alert || 5);
            const isOut = p.stock_qty <= 0;
            const name = this.getProdName(p);

            html += `
                <div onclick="terminal.addToCart(${p.id})" 
                    class="group relative bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all active:scale-95 ${isOut ? 'opacity-60 pointer-events-none' : ''}">
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-3xl">${p.image || '📦'}</span>
                            <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${isOut ? 'bg-red-100 text-red-700' : isLowStock ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}">
                                ${isOut ? window.i18n.t('outOfStock') : `${p.stock_qty} ${window.i18n.t('stock')}`}
                            </span>
                        </div>
                        <h4 class="font-bold text-slate-800 text-sm line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                            ${name}
                        </h4>
                        <p class="text-xs text-slate-400 mt-1 font-mono">${p.barcode || p.sku || ''}</p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span class="text-base font-black text-blue-600">
                            ${parseFloat(p.selling_price).toFixed(2)} <span class="text-xs font-normal text-slate-500">${curr}</span>
                        </span>
                        <button class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            +
                        </button>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    addToCart(productId) {
        const prod = this.products.find(p => p.id === productId);
        if (!prod) return;

        if (prod.stock_qty <= 0) {
            window.posAudio.error();
            this.showToast('عذراً، هذا الصنف نفد من المخزون', 'error');
            return;
        }

        const existing = this.cart.find(item => item.id === productId);
        if (existing) {
            if (existing.qty >= prod.stock_qty) {
                window.posAudio.error();
                this.showToast('تم الوصول للحد الأقصى المتوفر في المخزن', 'error');
                return;
            }
            existing.qty += 1;
        } else {
            this.cart.push({
                id: prod.id,
                name_en: prod.name_en,
                name_ar: prod.name_ar,
                barcode: prod.barcode,
                cost_price: prod.cost_price,
                price: parseFloat(prod.selling_price),
                qty: 1,
                max_stock: prod.stock_qty
            });
        }

        window.posAudio.beep();
        this.renderCart();
    }

    updateQty(index, delta) {
        if (!this.cart[index]) return;
        const item = this.cart[index];
        const newQty = item.qty + delta;

        if (newQty <= 0) {
            this.cart.splice(index, 1);
        } else if (newQty > item.max_stock) {
            window.posAudio.error();
            this.showToast('لا توجد كمية كافية بالمخزن', 'error');
            return;
        } else {
            item.qty = newQty;
        }

        window.posAudio.beep();
        this.renderCart();
    }

    removeItem(index) {
        this.cart.splice(index, 1);
        this.renderCart();
    }

    clearCart() {
        if (this.cart.length === 0) return;
        this.cart = [];
        this.discount = 0;
        this.heldOrderId = null;
        this.renderCart();
    }

    getTotals() {
        const subtotal = this.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        let discountAmt = 0;
        if (this.discountType === 'percent') {
            discountAmt = round2(subtotal * (this.discount / 100));
        } else {
            discountAmt = Math.min(subtotal, this.discount);
        }

        const taxable = Math.max(0, subtotal - discountAmt);
        const taxAmt = round2(taxable * (this.taxRate / 100));
        const total = round2(taxable + taxAmt);

        return { subtotal, discountAmt, taxAmt, total };
    }

    renderCart() {
        const container = document.getElementById('cart-items-container');
        const emptyState = document.getElementById('cart-empty-state');
        const badge = document.getElementById('cart-items-count');
        const curr = this.getCurrency();

        if (badge) {
            const count = this.cart.reduce((acc, i) => acc + i.qty, 0);
            badge.textContent = count;
        }

        if (this.cart.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (container) container.innerHTML = '';
            this.updateSummaryDisplay(0, 0, 0, 0);
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        let html = '';
        this.cart.forEach((item, idx) => {
            const name = window.i18n.currentLang === 'ar' ? (item.name_ar || item.name_en) : (item.name_en || item.name_ar);
            const lineTotal = (item.price * item.qty).toFixed(2);

            html += `
                <div class="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-slate-300 transition-all">
                    <div class="flex-1 min-w-0">
                        <h5 class="text-sm font-bold text-slate-800 truncate">${name}</h5>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs font-semibold text-blue-600">${item.price.toFixed(2)} ${curr}</span>
                            <span class="text-xs text-slate-400">×</span>
                            <span class="text-xs font-bold text-slate-700">${item.qty}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                            <button onclick="terminal.updateQty(${idx}, -1)" class="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-200 transition-all flex items-center justify-center text-sm shadow-sm">-</button>
                            <span class="w-8 text-center font-bold text-sm text-slate-800">${item.qty}</span>
                            <button onclick="terminal.updateQty(${idx}, 1)" class="w-7 h-7 rounded-lg bg-white text-slate-700 font-bold hover:bg-slate-200 transition-all flex items-center justify-center text-sm shadow-sm">+</button>
                        </div>
                        <span class="w-20 text-end font-black text-sm text-slate-900">${lineTotal} ${curr}</span>
                        <button onclick="terminal.removeItem(${idx})" class="w-7 h-7 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all">×</button>
                    </div>
                </div>
            `;
        });

        if (container) container.innerHTML = html;

        const totals = this.getTotals();
        this.updateSummaryDisplay(totals.subtotal, totals.discountAmt, totals.taxAmt, totals.total);
    }

    updateSummaryDisplay(subtotal, discount, tax, total) {
        const curr = this.getCurrency();
        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = `${val.toFixed(2)} ${curr}`;
        };

        setTxt('cart-subtotal-val', subtotal);
        setTxt('cart-discount-val', discount);
        setTxt('cart-tax-val', tax);
        setTxt('cart-total-val', total);

        const payBtn = document.getElementById('btn-pay-now');
        if (payBtn) {
            payBtn.disabled = this.cart.length === 0;
            payBtn.textContent = `${window.i18n.t('payNow')} (${total.toFixed(2)} ${curr})`;
        }
    }

    // --- Hold / Suspend Cart (تعليق الطلبات) ---
    async holdCurrentCart() {
        if (this.cart.length === 0) return;
        const cartName = prompt(window.i18n.currentLang === 'ar' ? 'أدخل اسم أو ملاحظة للطلب المعلق (مثال: طاولة 4 أو اسم العميل):' : 'Enter a name for held cart:', `Order ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
        if (!cartName) return;

        const totals = this.getTotals();
        const heldItem = {
            id: Date.now(),
            cart_name: cartName,
            cart_data: [...this.cart],
            total: totals.total,
            created_at: new Date().toLocaleTimeString()
        };

        // Try API
        try {
            await fetch('api.php?action=hold_cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart_name: cartName,
                    cart: this.cart,
                    subtotal: totals.subtotal,
                    total: totals.total
                })
            });
        } catch (e) {
            // Local fallback
        }

        this.heldOrders.push(heldItem);
        localStorage.setItem('apexpos_held_orders', JSON.stringify(this.heldOrders));
        this.clearCart();
        this.updateHeldOrdersBadge();
        this.showToast('تم تعليق الطلب بنجاح', 'success');
    }

    loadHeldOrders() {
        const saved = localStorage.getItem('apexpos_held_orders');
        if (saved) {
            try { this.heldOrders = JSON.parse(saved); } catch (e) {}
        }
        this.updateHeldOrdersBadge();
    }

    updateHeldOrdersBadge() {
        const badge = document.getElementById('held-orders-badge');
        if (badge) {
            badge.textContent = this.heldOrders.length;
            badge.classList.toggle('hidden', this.heldOrders.length === 0);
        }
    }

    openHeldOrdersModal() {
        const modal = document.getElementById('held-orders-modal');
        const list = document.getElementById('held-orders-list');
        if (!modal || !list) return;

        const curr = this.getCurrency();
        if (this.heldOrders.length === 0) {
            list.innerHTML = `<p class="py-8 text-center text-slate-400">لا توجد طلبات معلقة حالياً</p>`;
        } else {
            let html = '';
            this.heldOrders.forEach((h, idx) => {
                const count = h.cart_data.reduce((a, b) => a + b.qty, 0);
                html += `
                    <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                        <div>
                            <h4 class="font-bold text-slate-800">${h.cart_name}</h4>
                            <p class="text-xs text-slate-500 mt-1">${count} أصناف • ${h.total.toFixed(2)} ${curr} • ${h.created_at}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="terminal.resumeHeldOrder(${idx})" class="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all">
                                استرجاع ومتابعة
                            </button>
                            <button onclick="terminal.deleteHeldOrder(${idx})" class="px-3 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-bold hover:bg-red-200 transition-all">
                                حذف
                            </button>
                        </div>
                    </div>
                `;
            });
            list.innerHTML = html;
        }

        modal.classList.remove('hidden');
    }

    resumeHeldOrder(idx) {
        const held = this.heldOrders[idx];
        if (!held) return;

        if (this.cart.length > 0) {
            if (!confirm('سيتم استبدال السلة الحالية بالسلة المسترجعة، هل تود المتابعة؟')) return;
        }

        this.cart = [...held.cart_data];
        this.heldOrderId = held.id;
        this.heldOrders.splice(idx, 1);
        localStorage.setItem('apexpos_held_orders', JSON.stringify(this.heldOrders));
        this.updateHeldOrdersBadge();
        this.renderCart();
        this.closeAllModals();
        this.showToast('تم استرجاع السلة المعلقة', 'success');
    }

    deleteHeldOrder(idx) {
        this.heldOrders.splice(idx, 1);
        localStorage.setItem('apexpos_held_orders', JSON.stringify(this.heldOrders));
        this.updateHeldOrdersBadge();
        this.openHeldOrdersModal();
    }

    // --- Payment & Checkout Modal ---
    openPaymentModal() {
        const totals = this.getTotals();
        if (totals.total <= 0) return;

        const modal = document.getElementById('payment-modal');
        const amountDisplay = document.getElementById('pay-modal-total-amount');
        const tenderInput = document.getElementById('tender-amount-input');
        const curr = this.getCurrency();

        if (amountDisplay) amountDisplay.textContent = `${totals.total.toFixed(2)} ${curr}`;
        if (tenderInput) {
            tenderInput.value = totals.total.toFixed(2);
            tenderInput.focus();
            tenderInput.select();
        }

        this.updateChangeCalculation();
        if (modal) modal.classList.remove('hidden');
    }

    setQuickTender(amount) {
        const tenderInput = document.getElementById('tender-amount-input');
        if (tenderInput) {
            tenderInput.value = amount;
            this.updateChangeCalculation();
        }
    }

    updateChangeCalculation() {
        const totals = this.getTotals();
        const tenderInput = document.getElementById('tender-amount-input');
        const changeDisplay = document.getElementById('pay-modal-change-amount');
        const curr = this.getCurrency();

        const paid = parseFloat(tenderInput?.value || 0);
        const change = Math.max(0, paid - totals.total);
        if (changeDisplay) {
            changeDisplay.textContent = `${change.toFixed(2)} ${curr}`;
        }
    }

    setPaymentMethod(method) {
        this.paymentMethod = method;
        document.querySelectorAll('.pay-method-btn').forEach(btn => {
            const active = btn.dataset.method === method;
            btn.classList.toggle('border-blue-600', active);
            btn.classList.toggle('bg-blue-50', active);
            btn.classList.toggle('text-blue-600', active);
        });
    }

    async completeCheckout() {
        const totals = this.getTotals();
        const tenderInput = document.getElementById('tender-amount-input');
        const paid = parseFloat(tenderInput?.value || totals.total);

        const orderData = {
            invoice_no: 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
            created_at: new Date().toLocaleString(),
            cashier: 'Admin',
            items: [...this.cart],
            subtotal: totals.subtotal,
            discount: totals.discountAmt,
            tax_rate: this.taxRate,
            tax_amount: totals.taxAmt,
            total: totals.total,
            amount_paid: paid,
            change: Math.max(0, paid - totals.total),
            payment_method: this.paymentMethod
        };

        // Try API
        try {
            const res = await fetch('api.php?action=checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart: this.cart,
                    discount_amount: totals.discountAmt,
                    payment_method: this.paymentMethod,
                    amount_paid: paid,
                    held_order_id: this.heldOrderId
                })
            });
            if (res.ok) {
                const apiRes = await res.json();
                if (apiRes.success && apiRes.order) {
                    Object.assign(orderData, apiRes.order);
                }
            }
        } catch (e) {
            console.log('Processed in offline demo mode:', e);
        }

        // Deduct local quantities
        this.cart.forEach(item => {
            const prod = this.products.find(p => p.id === item.id);
            if (prod) prod.stock_qty -= item.qty;
        });

        window.posAudio.cashRegister();
        this.closeAllModals();
        this.clearCart();
        this.renderProducts();

        // Show receipt preview & print option
        this.showReceiptModal(orderData);
    }

    showReceiptModal(order) {
        const modal = document.getElementById('receipt-modal');
        const container = document.getElementById('printable-receipt');
        if (!modal || !container) return;

        const curr = this.getCurrency();
        const storeName = window.i18n.currentLang === 'ar' ? (this.settings.store_name_ar || 'متجر إيبكس للتجزئة') : (this.settings.store_name || 'Apex Retail');

        let rowsHtml = '';
        order.items.forEach(it => {
            const name = window.i18n.currentLang === 'ar' ? (it.name_ar || it.name_en) : (it.name_en || it.name_ar);
            const lineSub = (it.price * it.qty).toFixed(2);
            rowsHtml += `
                <div class="flex justify-between py-1 text-xs border-b border-dashed border-slate-200">
                    <div class="flex-1">
                        <div class="font-bold">${name}</div>
                        <div class="text-[10px] text-slate-500">${it.qty} × ${it.price.toFixed(2)}</div>
                    </div>
                    <div class="font-mono font-bold">${lineSub}</div>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="text-center pb-3 border-b border-dashed border-slate-300">
                <h2 class="text-base font-black uppercase tracking-wider">${storeName}</h2>
                <p class="text-[11px] text-slate-600 mt-0.5">${this.settings.address || 'Cairo, Egypt'}</p>
                <p class="text-[11px] text-slate-600">Tel: ${this.settings.phone || '+20 100 234 5678'}</p>
                <p class="text-[11px] font-mono font-bold mt-1">Tax ID: ${this.settings.tax_number || 'EG-984-721-002'}</p>
            </div>

            <div class="py-2 text-[11px] border-b border-dashed border-slate-300 flex justify-between">
                <div>
                    <div><strong>Inv:</strong> ${order.invoice_no}</div>
                    <div><strong>Cashier:</strong> ${order.cashier || 'Admin'}</div>
                </div>
                <div class="text-end">
                    <div><strong>Date:</strong> ${order.created_at}</div>
                    <div><strong>Method:</strong> ${order.payment_method.toUpperCase()}</div>
                </div>
            </div>

            <div class="py-2">
                ${rowsHtml}
            </div>

            <div class="pt-2 border-t border-dashed border-slate-300 text-xs space-y-1">
                <div class="flex justify-between">
                    <span>Subtotal:</span>
                    <span class="font-mono">${order.subtotal.toFixed(2)} ${curr}</span>
                </div>
                ${order.discount > 0 ? `
                <div class="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span class="font-mono">-${order.discount.toFixed(2)} ${curr}</span>
                </div>` : ''}
                <div class="flex justify-between">
                    <span>VAT (${order.tax_rate}%):</span>
                    <span class="font-mono">${order.tax_amount.toFixed(2)} ${curr}</span>
                </div>
                <div class="flex justify-between text-sm font-black pt-1 border-t border-slate-800">
                    <span>TOTAL:</span>
                    <span class="font-mono">${order.total.toFixed(2)} ${curr}</span>
                </div>
                <div class="flex justify-between pt-1 text-[11px] text-slate-600">
                    <span>Paid:</span>
                    <span class="font-mono">${order.amount_paid.toFixed(2)} ${curr}</span>
                </div>
                <div class="flex justify-between text-[11px] text-slate-600">
                    <span>Change Due:</span>
                    <span class="font-mono font-bold text-slate-900">${order.change.toFixed(2)} ${curr}</span>
                </div>
            </div>

            <div class="mt-4 pt-3 border-t border-dashed border-slate-300 text-center">
                <!-- QR Code representation -->
                <div class="flex justify-center mb-2">
                    <div class="w-20 h-20 bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono p-1 text-center rounded">
                        [QR: ZATCA / Tax Ready]
                    </div>
                </div>
                <p class="text-[11px] font-bold">${window.i18n.t('thankYou')}</p>
                <p class="text-[9px] text-slate-500 mt-1">${this.settings.receipt_footer || 'Return within 14 days with original receipt.'}</p>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    printReceipt() {
        window.print();
    }

    closeAllModals() {
        document.querySelectorAll('.app-modal').forEach(m => m.classList.add('hidden'));
    }

    showToast(msg, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm text-white flex items-center gap-2 transition-all transform translate-y-4 opacity-0 ${type === 'error' ? 'bg-red-600' : 'bg-slate-900'}`;
        toast.innerHTML = msg;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-4', 'opacity-0');
        });

        setTimeout(() => {
            toast.classList.add('translate-y-4', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
}

function round2(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

window.terminal = new POSTerminal();
