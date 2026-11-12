/**
 * ApexPOS - Multi-language (Arabic / English) Engine
 */
const translations = {
    en: {
        appName: "ApexPOS Pro",
        tagline: "Standalone Retail & Inventory Management",
        pos: "Point of Sale",
        dashboard: "Dashboard",
        products: "Products",
        orders: "Sales History",
        customers: "Customers",
        reports: "Reports & Profit",
        settings: "Settings",
        searchPlaceholder: "Scan barcode or search product (F2)...",
        allCategories: "All Categories",
        cartTitle: "Current Cart",
        cartEmpty: "Cart is empty. Scan barcode or click an item.",
        holdCart: "Hold Cart",
        heldCarts: "Held Carts",
        clearCart: "Clear",
        item: "Item",
        qty: "Qty",
        price: "Price",
        subtotal: "Subtotal",
        tax: "VAT",
        discount: "Discount",
        total: "Total Payable",
        payNow: "Charge / Pay (F9)",
        cash: "Cash",
        card: "Credit/Debit Card",
        wallet: "Digital Wallet",
        debt: "Customer Credit / Due",
        amountReceived: "Amount Received",
        change: "Change Due",
        completeSale: "Confirm & Print Receipt",
        cancel: "Cancel",
        stock: "In Stock",
        lowStock: "Low Stock",
        outOfStock: "Out of Stock",
        customer: "Customer",
        walkInCustomer: "Walk-in Customer",
        invoiceNo: "Invoice #",
        date: "Date",
        cashier: "Cashier",
        todaySales: "Today's Sales",
        todayProfit: "Net Profit Today",
        ordersToday: "Orders Today",
        totalProducts: "Total Inventory Items",
        printReceipt: "Print Receipt",
        barcodeGenerator: "Barcode Generator",
        generateLabels: "Print Barcode Labels",
        addProduct: "Add New Product",
        productName: "Product Name",
        category: "Category",
        costPrice: "Cost Price",
        sellingPrice: "Selling Price",
        barcode: "Barcode",
        sku: "SKU",
        minStockAlert: "Min Alert Qty",
        save: "Save",
        actions: "Actions",
        status: "Status",
        completed: "Completed",
        profit: "Profit",
        currency: "EGP",
        receiptHeader: "Tax Invoice / Receipt",
        thankYou: "Thank you for shopping with us!"
    },
    ar: {
        appName: "إيبكس كاشير برو",
        tagline: "نظام نقاط البيع وإدارة المخزون المستقل",
        pos: "نقطة البيع (الكاشير)",
        dashboard: "لوحة التحكم",
        products: "المنتجات والمخزون",
        orders: "سجل المبيعات",
        customers: "العملاء والآجل",
        reports: "التقارير والأرباح",
        settings: "إعدادات المتجر",
        searchPlaceholder: "امسح الباركود أو ابحث عن منتج (F2)...",
        allCategories: "جميع الأقسام",
        cartTitle: "سلة المشتريات",
        cartEmpty: "السلة فارغة. امسح الباركود أو اختر صنفاً.",
        holdCart: "تعليق الطلب",
        heldCarts: "الطلبات المعلقة",
        clearCart: "تفريغ",
        item: "الصنف",
        qty: "الكمية",
        price: "السعر",
        subtotal: "المجموع الفرعي",
        tax: "ضريبة القيمة المضافة",
        discount: "الخصم",
        total: "الإجمالي المطلوب",
        payNow: "دفع / محاسبة (F9)",
        cash: "نقدي (كاش)",
        card: "بطاقة بنكية",
        wallet: "محفظة إلكترونية",
        debt: "آجل / على الحساب",
        amountReceived: "المبلغ المدفوع",
        change: "المتبقي للعميل",
        completeSale: "تأكيد وطباعة الإيصال",
        cancel: "إلغاء",
        stock: "المخزون",
        lowStock: "مخزون منخفض",
        outOfStock: "نفد من المخزن",
        customer: "العميل",
        walkInCustomer: "عميل نقدي عابر",
        invoiceNo: "رقم الفاتورة",
        date: "التاريخ",
        cashier: "الكاشير",
        todaySales: "مبيعات اليوم",
        todayProfit: "صافي ربح اليوم",
        ordersToday: "فواتير اليوم",
        totalProducts: "إجمالي الأصناف",
        printReceipt: "طباعة الفاتورة",
        barcodeGenerator: "طباعة الباركود",
        generateLabels: "طباعة ملصقات الباركود",
        addProduct: "إضافة صنف جديد",
        productName: "اسم الصنف",
        category: "القسم",
        costPrice: "سعر الشراء (التكلفة)",
        sellingPrice: "سعر البيع",
        barcode: "الباركود",
        sku: "رمز الصنف (SKU)",
        minStockAlert: "حد التنبيه للنقص",
        save: "حفظ",
        actions: "إجراءات",
        status: "الحالة",
        completed: "مكتمل",
        profit: "الربح",
        currency: "ج.م",
        receiptHeader: "فاتورة ضريبية مبسطة",
        thankYou: "شكراً لتسوقكم معنا ونسعد بزيارتكم!"
    }
};

class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem('apexpos_lang') || 'ar';
        this.init();
    }

    init() {
        this.applyLanguage(this.currentLang);
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('apexpos_lang', lang);
            this.applyLanguage(lang);
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
        }
    }

    toggleLanguage() {
        const nextLang = this.currentLang === 'ar' ? 'en' : 'ar';
        this.setLanguage(nextLang);
    }

    applyLanguage(lang) {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.placeholder = translations[lang][key];
                } else {
                    el.textContent = translations[lang][key];
                }
            }
        });
    }

    t(key) {
        return translations[this.currentLang][key] || key;
    }
}

window.i18n = new I18nManager();
