// =============================================
// Auto Part - Main Application JavaScript
// =============================================

const API_BASE = '/api';
let currentPage = 1;
let searchTimeout = null;
let cachedStockAlerts = [];
let currentAlertFilter = 'all';

// =============================================
// MOCK DATA (داتای وەهمی و تاقیکردنەوە)
// =============================================
const INITIAL_CATEGORIES = [
  { id: 1, name: 'فلتەرەکان', description: 'فلتەری هەوا، ڕۆن، بەنزین و تەبرێت', product_count: 4 },
  { id: 2, name: 'سیستەمی بریک', description: 'پەدی بریک، دیسک، دەبل و ڕۆنی بریک', product_count: 4 },
  { id: 3, name: 'بزوێنەر و مەکینە', description: 'پلاک، قایش، پەمپ و ڕۆڵە', product_count: 4 },
  { id: 4, name: 'سەسپانسیۆن و جامپەر', description: 'دەبڵ، جامپەر، بۆڵبرین و بەستەر', product_count: 3 },
  { id: 5, name: 'کارەبایی و باتری', description: 'باتری، دینەمۆ، سویچ و لایت', product_count: 3 },
  { id: 6, name: 'سێرڤس و زەیت', description: 'زەیتی مەکینە، زەیتی گێڕ و هایدرۆلیک', product_count: 2 },
  { id: 7, name: 'گێڕ و کلەچ', description: 'دیسک و پلێت، کلەچ کیت و فلایویل', product_count: 2 },
  { id: 8, name: 'ساردکەرەوە و ڕادیاتۆر', description: 'ڕادیاتۆر، وەتەرپەمپ، تێرمۆستات و پانکە', product_count: 2 }
];

const INITIAL_COMPANIES = [
  { id: 1, name: 'کۆمپانیای ئەڵمان پارت', phone: '0750 445 1234', address: 'هەولێر - شەقامی ١٠٠ مەتری، بەرامبەر پیشەسازی باشوور' },
  { id: 2, name: 'کۆمپانیای گۆڵدن ئۆتۆ', phone: '0770 152 7890', address: 'سلێمانی - شەقامی بازنەیی مەلیک مەحمود' },
  { id: 3, name: 'کۆمپانیای داهێنەر بۆ هاوردە', phone: '0750 889 6543', address: 'دهۆک - پیشەسازی نوێ' },
  { id: 4, name: 'کۆمپانیای یابانی پارت', phone: '0770 334 9911', address: 'هەولێر - پیشەسازی باکوور' },
  { id: 5, name: 'کۆمپانیای کۆریا سپێر پارت', phone: '0750 711 2233', address: 'سلێمانی - ناوچەی پیشەسازی کانی گۆمە' }
];

const INITIAL_PRODUCTS = [
  // فلتەرەکان
  { id: 1, name: 'فلتەری هەوا تۆیۆتا کۆرۆڵا', category_id: 1, category_name: 'فلتەرەکان', model: 'Corolla 2018-2023', part_number: 'AF-TY-17801', barcode: '8934500112', quantity: 28, buy_price_iqd: 7500, sell_price_iqd: 11000, buy_price_usd: 5.00, sell_price_usd: 7.50, min_stock: 6, location: 'A-01-01', description: 'فلتەری هەوای ئەسڵی جۆری تۆیۆتا' },
  { id: 2, name: 'فلتەری زەیت هیۆندای و کیا', category_id: 1, category_name: 'فلتەرەکان', model: 'Elantra / Tucson / Sportage', part_number: 'OF-HY-26300', barcode: '8934500113', quantity: 4, buy_price_iqd: 4500, sell_price_iqd: 7000, buy_price_usd: 3.00, sell_price_usd: 4.75, min_stock: 8, location: 'A-01-02', description: 'فلتەری ڕۆنی مەکینەی فابریکە - لە کەمی دایە!' },
  { id: 3, name: 'فلتەری بەنزین نیسان سەنی', category_id: 1, category_name: 'فلتەرەکان', model: 'Sunny 2015-2022', part_number: 'FF-NS-16400', barcode: '8934500114', quantity: 0, buy_price_iqd: 12000, sell_price_iqd: 18000, buy_price_usd: 8.00, sell_price_usd: 12.00, min_stock: 5, location: 'A-01-03', description: 'فلتەری تانکی بەنزین - تەواو بووە لە مەخزەن!' },
  { id: 4, name: 'فلتەری تەبرێت (کابینە) کامری', category_id: 1, category_name: 'فلتەرەکان', model: 'Camry 2020+', part_number: 'CF-TY-87139', barcode: '8934500115', quantity: 18, buy_price_iqd: 6000, sell_price_iqd: 9500, buy_price_usd: 4.00, sell_price_usd: 6.50, min_stock: 5, location: 'A-01-04', description: 'فلتەری کەشوهەوای ناو ئۆتۆمۆبێل' },

  // سیستەمی بریک
  { id: 5, name: 'پەدی بریکی پێشەوە تۆیۆتا لاندکرۆزەر', category_id: 2, category_name: 'سیستەمی بریک', model: 'Land Cruiser V8 2016-2021', part_number: 'BP-LC-04465', barcode: '8934500201', quantity: 3, buy_price_iqd: 38000, sell_price_iqd: 55000, buy_price_usd: 25.50, sell_price_usd: 37.00, min_stock: 5, location: 'B-02-01', description: 'پەدی سیرامیک کوالیتی بەرز - لە کەمی دایە' },
  { id: 6, name: 'دیسکی بریکی پێشەوە کیا سپۆرتاج', category_id: 2, category_name: 'سیستەمی بریک', model: 'Sportage 2018-2022', part_number: 'BD-KI-51712', barcode: '8934500202', quantity: 8, buy_price_iqd: 32000, sell_price_iqd: 48000, buy_price_usd: 21.50, sell_price_usd: 32.00, min_stock: 4, location: 'B-02-02', description: 'دیسکی پۆڵا بەهێزکراو' },
  { id: 7, name: 'پەدی بریکی دواوە هیۆندای ئەکسێنت', category_id: 2, category_name: 'سیستەمی بریک', model: 'Accent 2017-2023', part_number: 'BP-HY-58302', barcode: '8934500203', quantity: 0, buy_price_iqd: 14000, sell_price_iqd: 22000, buy_price_usd: 9.50, sell_price_usd: 15.00, min_stock: 6, location: 'B-02-03', description: 'پەدی تێرمی دواوە - سفر دانە ماوە' },
  { id: 8, name: 'ڕۆنی بریک DOT4 بۆش ئەڵمانی', category_id: 2, category_name: 'سیستەمی بریک', model: 'Universal (گشتی)', part_number: 'BF-BS-004', barcode: '8934500204', quantity: 35, buy_price_iqd: 5000, sell_price_iqd: 8000, buy_price_usd: 3.50, sell_price_usd: 5.50, min_stock: 10, location: 'B-02-04', description: 'قوتوی 1 لیتری پلەی یەک' },

  // بزوێنەر و مەکینە
  { id: 9, name: 'سپارک پلەگ (پلاک) لیزەری NGK', category_id: 3, category_name: 'بزوێنەر و مەکینە', model: 'Toyota / Nissan 4-Cyl', part_number: 'SP-NGK-6994', barcode: '8934500301', quantity: 80, buy_price_iqd: 4000, sell_price_iqd: 7000, buy_price_usd: 2.75, sell_price_usd: 4.75, min_stock: 20, location: 'C-03-01', description: 'پلاکی ئیریدیۆم تەمەن درێژ' },
  { id: 10, name: 'قایشی تایمینگ ئۆپترا و ئاڤیۆ', category_id: 3, category_name: 'بزوێنەر و مەکینە', model: 'Optra / Aveo 1.6', part_number: 'TB-GM-96814', barcode: '8934500302', quantity: 2, buy_price_iqd: 18000, sell_price_iqd: 28000, buy_price_usd: 12.00, sell_price_usd: 19.00, min_stock: 5, location: 'C-03-02', description: 'قایشی سەرەکی مەکینە گەیتس ئەسڵی - کەمە' },
  { id: 11, name: 'پەمپی بەنزینی ناو تانکی کامری', category_id: 3, category_name: 'بزوێنەر و مەکینە', model: 'Camry / Avalon 2012-2017', part_number: 'FP-TY-23220', barcode: '8934500303', quantity: 0, buy_price_iqd: 45000, sell_price_iqd: 65000, buy_price_usd: 30.00, sell_price_usd: 44.00, min_stock: 3, location: 'C-03-03', description: 'پەمپی بەنزین تەواو ئەسڵی - نەماوە' },
  { id: 12, name: 'وەتەر پەمپ نیسان ئاڵتیما', category_id: 3, category_name: 'بزوێنەر و مەکینە', model: 'Altima 2.5L 2013-2019', part_number: 'WP-NS-21010', barcode: '8934500304', quantity: 5, buy_price_iqd: 28000, sell_price_iqd: 42000, buy_price_usd: 19.00, sell_price_usd: 28.50, min_stock: 3, location: 'C-03-04', description: 'وەتەرپەمپی ئاو مەکینە' },

  // سەسپانسیۆن و جامپەر
  { id: 13, name: 'دەبڵ و جامپەری پێشەوە هیۆندای ئیلانترا', category_id: 4, category_name: 'سەسپانسیۆن و جامپەر', model: 'Elantra 2016-2020', part_number: 'SH-HY-54651', barcode: '8934500401', quantity: 1, buy_price_iqd: 42000, sell_price_iqd: 60000, buy_price_usd: 28.00, sell_price_usd: 40.00, min_stock: 4, location: 'D-04-01', description: 'تەنها 1 دانە ماوە لە مەخزەن - ئاگاداری!' },
  { id: 14, name: 'بۆڵبرینی ویلی پێشەوە تۆیۆتا یارس', category_id: 4, category_name: 'سەسپانسیۆن و جامپەر', model: 'Yaris 2015-2021', part_number: 'WB-TY-43560', barcode: '8934500402', quantity: 12, buy_price_iqd: 16000, sell_price_iqd: 25000, buy_price_usd: 11.00, sell_price_usd: 17.00, min_stock: 4, location: 'D-04-02', description: 'بۆڵبرینی ژاپۆنی کۆیۆ' },
  { id: 15, name: 'بۆشەکانی ئەکسل و جۆینت تۆیۆتا', category_id: 4, category_name: 'سەسپانسیۆن و جامپەر', model: 'Corolla / RAV4', part_number: 'BS-TY-48654', barcode: '8934500403', quantity: 24, buy_price_iqd: 6000, sell_price_iqd: 10000, buy_price_usd: 4.00, sell_price_usd: 7.00, min_stock: 8, location: 'D-04-03', description: 'لاستیکی قۆڵەکانی ئەکسل' },

  // کارەبایی و باتری
  { id: 16, name: 'باتری ڤارتا 70 ئەمپێر ئەڵمانی', category_id: 5, category_name: 'کارەبایی و باتری', model: 'European / Asian Standard', part_number: 'BT-VR-70AH', barcode: '8934500501', quantity: 7, buy_price_iqd: 95000, sell_price_iqd: 125000, buy_price_usd: 64.00, sell_price_usd: 84.00, min_stock: 5, location: 'E-05-01', description: 'باتری گەرەنتی ١ ساڵ' },
  { id: 17, name: 'دینەمۆی شەحن تۆیۆتا هایلوکس', category_id: 5, category_name: 'کارەبایی و باتری', model: 'Hilux D-4D / 2.7', part_number: 'AL-TY-27060', barcode: '8934500502', quantity: 0, buy_price_iqd: 11000, sell_price_iqd: 155000, buy_price_usd: 75.00, sell_price_usd: 105.00, min_stock: 2, location: 'E-05-02', description: 'دینەمۆی گەورە - نەماوە لە مەخزەن' },
  { id: 18, name: 'لایتی پێشەوە LED تۆیۆتا پرادۆ', category_id: 5, category_name: 'کارەبایی و باتری', model: 'Prado 2018-2022', part_number: 'HL-PR-81110', barcode: '8934500503', quantity: 4, buy_price_iqd: 180000, sell_price_iqd: 240000, buy_price_usd: 122.00, sell_price_usd: 162.00, min_stock: 2, location: 'E-05-03', description: 'جووت لایتی ئەسڵی زینۆن' },

  // سێرڤس و زەیت
  { id: 19, name: 'زەیتی مەکینە مۆبیڵ وەن 5W30', category_id: 6, category_name: 'سێرڤس و زەیت', model: 'Universal Synthetic', part_number: 'OL-MB-5W30', barcode: '8934500601', quantity: 45, buy_price_iqd: 14000, sell_price_iqd: 20000, buy_price_usd: 9.50, sell_price_usd: 13.50, min_stock: 15, location: 'F-06-01', description: 'قوتوی 1 لیتری فول سینتەتیک' },
  { id: 20, name: 'زەیتی گێڕ تۆیۆتا WS ئەسڵی', category_id: 6, category_name: 'سێرڤس و زەیت', model: 'Toyota Automatic Transmission', part_number: 'TF-TY-08886', barcode: '8934500602', quantity: 3, buy_price_iqd: 17000, sell_price_iqd: 26000, buy_price_usd: 11.50, sell_price_usd: 17.50, min_stock: 10, location: 'F-06-02', description: 'ڕۆنی گێڕی تۆیۆتا - زۆر کەم ماوە!' },

  // گێڕ و کلەچ
  { id: 21, name: 'کلەچ کیت (دیسک و پلێت) نیسان پیکاب', category_id: 7, category_name: 'گێڕ و کلەچ', model: 'Nissan Pickup D22', part_number: 'CK-NS-30001', barcode: '8934500701', quantity: 2, buy_price_iqd: 85000, sell_price_iqd: 120000, buy_price_usd: 58.00, sell_price_usd: 81.00, min_stock: 3, location: 'G-07-01', description: 'کیتێکی تەواو ڤالیۆ فەرەنسی - لە کەمی دایە' },
  { id: 22, name: 'فلایویل تۆیۆتا هایس گاز', category_id: 7, category_name: 'گێڕ و کلەچ', model: 'Hiace 2KD Engine', part_number: 'FW-TY-13405', barcode: '8934500702', quantity: 0, buy_price_iqd: 135000, sell_price_iqd: 180000, buy_price_usd: 92.00, sell_price_usd: 122.00, min_stock: 2, location: 'G-07-02', description: 'فلایویلی مەکینە - تەواوبووە' },

  // ساردکەرەوە و ڕادیاتۆر
  { id: 23, name: 'ڕادیاتۆری ئاو تۆیۆتا کامری', category_id: 8, category_name: 'ساردکەرەوە و ڕادیاتۆر', model: 'Camry 2.5 2018-2023', part_number: 'RD-TY-16400', barcode: '8934500801', quantity: 6, buy_price_iqd: 65000, sell_price_iqd: 92000, buy_price_usd: 44.00, sell_price_usd: 62.00, min_stock: 3, location: 'H-08-01', description: 'ڕادیاتۆری ئەلەمنیۆم دوو لولە' },
  { id: 24, name: 'تێرمۆستات مەکینە هیۆندای سۆناتا', category_id: 8, category_name: 'ساردکەرەوە و ڕادیاتۆر', model: 'Sonata / Optima 2.4', part_number: 'TH-HY-25500', barcode: '8934500802', quantity: 15, buy_price_iqd: 8000, sell_price_iqd: 13000, buy_price_usd: 5.50, sell_price_usd: 9.00, min_stock: 5, location: 'H-08-02', description: 'تێرمۆستاتی پلەی 82C' }
];

// Helper functions for Local Storage
function getLocalData(key, defaultData) {
  try {
    const saved = localStorage.getItem('autopart_' + key);
    if (!saved) {
      localStorage.setItem('autopart_' + key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(saved);
  } catch (e) {
    return defaultData;
  }
}

function setLocalData(key, data) {
  try {
    localStorage.setItem('autopart_' + key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

// Transparent Mock API Handler
function handleMockApi(endpoint, method, data) {
  let products = getLocalData('products', INITIAL_PRODUCTS);
  let categories = getLocalData('categories', INITIAL_CATEGORIES);
  let companies = getLocalData('companies', INITIAL_COMPANIES);

  // Parse path and query
  const [path, queryString] = endpoint.split('?');
  const params = new URLSearchParams(queryString || '');

  // 0. Authentication Handler (Mock / Offline fallback)
  if (path === '/auth/login' && method === 'POST') {
    const username = (data && data.username ? data.username.trim() : '');
    const password = (data && data.password ? data.password.trim() : '');
    if (username === 'admin' && password === '1234') {
      const mockUser = { id: 1, username: 'admin', fullName: 'ئەدمینی سەرەکی', role: 'admin' };
      return {
        success: true,
        message: 'چوونەژوورەوە سەرکەوتوو بوو',
        token: 'mock-jwt-token-autopart-2026',
        user: mockUser
      };
    } else {
      return {
        success: false,
        message: 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە!'
      };
    }
  }

  if (path === '/auth/me') {
    return {
      success: true,
      user: { id: 1, username: 'admin', fullName: 'ئەدمینی سەرەکی', role: 'admin' }
    };
  }

  if (path === '/auth/logout') {
    return { success: true, message: 'دەرچوون سەرکەوتوو بوو' };
  }

  // 1. Dashboard Stats
  if (path === '/dashboard/stats') {
    const totalProducts = products.length;
    const totalCategories = categories.length;
    const totalQuantity = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
    const lowStock = products.filter(p => Number(p.quantity) > 0 && Number(p.quantity) <= Number(p.min_stock)).length;
    const outOfStock = products.filter(p => Number(p.quantity) === 0).length;
    const totalValueIQD = products.reduce((sum, p) => sum + ((Number(p.quantity) || 0) * (Number(p.sell_price_iqd) || 0)), 0);
    const totalValueUSD = products.reduce((sum, p) => sum + ((Number(p.quantity) || 0) * (Number(p.sell_price_usd) || 0)), 0);

    return {
      success: true,
      data: {
        totalProducts,
        totalCategories,
        totalQuantity,
        lowStock,
        outOfStock,
        totalAlerts: lowStock + outOfStock,
        totalValueIQD,
        totalValueUSD
      }
    };
  }

  // 2. Stock Alerts Report
  if (path === '/dashboard/stock-alerts') {
    const alerts = products
      .filter(p => Number(p.quantity) <= Number(p.min_stock))
      .sort((a, b) => Number(a.quantity) - Number(b.quantity));
    return { success: true, data: alerts };
  }

  // 3. Products List & Operations
  if (path === '/products') {
    if (method === 'GET') {
      const search = (params.get('search') || '').toLowerCase().trim();
      const category_id = params.get('category_id');
      const stock_status = params.get('stock_status');
      const page = parseInt(params.get('page') || '1');
      const limit = parseInt(params.get('limit') || '15');

      let filtered = products.filter(p => {
        if (search) {
          const matchName = (p.name || '').toLowerCase().includes(search);
          const matchPart = (p.part_number || '').toLowerCase().includes(search);
          const matchModel = (p.model || '').toLowerCase().includes(search);
          const matchBarcode = (p.barcode || '').toLowerCase().includes(search);
          if (!matchName && !matchPart && !matchModel && !matchBarcode) return false;
        }
        if (category_id && String(p.category_id) !== String(category_id)) return false;
        if (stock_status === 'in_stock' && !(p.quantity > p.min_stock)) return false;
        if (stock_status === 'low_stock' && !(p.quantity > 0 && p.quantity <= p.min_stock)) return false;
        if (stock_status === 'out_of_stock' && p.quantity !== 0) return false;
        return true;
      });

      const total = filtered.length;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + limit);

      return {
        success: true,
        data: paginated,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
      };
    }

    if (method === 'POST') {
      const cat = categories.find(c => String(c.id) === String(data.category_id));
      const newProduct = {
        id: Date.now(),
        ...data,
        category_name: cat ? cat.name : 'گشتی'
      };
      products.unshift(newProduct);
      setLocalData('products', products);
      return { success: true, message: 'بەرهەم زیادکرا', data: newProduct };
    }
  }

  // Single Product operations: /products/:id
  const productMatch = path.match(/^\/products\/(\d+)$/);
  if (productMatch) {
    const id = parseInt(productMatch[1]);
    const index = products.findIndex(p => p.id === id);

    if (method === 'GET') {
      return { success: true, data: products[index] || {} };
    }
    if (method === 'PUT') {
      if (index !== -1) {
        const cat = categories.find(c => String(c.id) === String(data.category_id));
        products[index] = { ...products[index], ...data, category_name: cat ? cat.name : products[index].category_name };
        setLocalData('products', products);
      }
      return { success: true, message: 'بەرهەم نوێکرایەوە', data: products[index] };
    }
    if (method === 'DELETE') {
      products = products.filter(p => p.id !== id);
      setLocalData('products', products);
      return { success: true, message: 'بەرهەم سڕایەوە' };
    }
  }

  // 4. Categories: /categories
  if (path === '/categories') {
    if (method === 'GET') {
      const enriched = categories.map(c => ({
        ...c,
        product_count: products.filter(p => String(p.category_id) === String(c.id)).length
      }));
      return { success: true, data: enriched };
    }
    if (method === 'POST') {
      const newCat = { id: Date.now(), ...data, product_count: 0 };
      categories.push(newCat);
      setLocalData('categories', categories);
      return { success: true, message: 'جۆر زیادکرا', data: newCat };
    }
  }

  const categoryMatch = path.match(/^\/categories\/(\d+)$/);
  if (categoryMatch) {
    const id = parseInt(categoryMatch[1]);
    if (method === 'PUT') {
      const idx = categories.findIndex(c => c.id === id);
      if (idx !== -1) {
        categories[idx] = { ...categories[idx], ...data };
        setLocalData('categories', categories);
      }
      return { success: true, message: 'جۆر نوێکرایەوە' };
    }
    if (method === 'DELETE') {
      categories = categories.filter(c => c.id !== id);
      setLocalData('categories', categories);
      return { success: true, message: 'جۆر سڕایەوە' };
    }
  }

  // 5. Companies / Suppliers: /suppliers
  if (path === '/suppliers') {
    if (method === 'GET') {
      return { success: true, data: companies };
    }
    if (method === 'POST') {
      const newCompany = { id: Date.now(), ...data };
      companies.push(newCompany);
      setLocalData('companies', companies);
      return { success: true, message: 'کۆمپانیا زیادکرا', data: newCompany };
    }
  }

  const companyMatch = path.match(/^\/suppliers\/(\d+)$/);
  if (companyMatch) {
    const id = parseInt(companyMatch[1]);
    if (method === 'PUT') {
      const idx = companies.findIndex(c => c.id === id);
      if (idx !== -1) {
        companies[idx] = { ...companies[idx], ...data };
        setLocalData('companies', companies);
      }
      return { success: true, message: 'کۆمپانیا نوێکرایەوە' };
    }
    if (method === 'DELETE') {
      companies = companies.filter(c => c.id !== id);
      setLocalData('companies', companies);
      return { success: true, message: 'کۆمپانیا سڕایەوە' };
    }
  }

  return { success: true, data: [] };
}

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
  updateDate();
  const isAuthenticated = checkAuthState();
  if (isAuthenticated) {
    initExchangeRate();
    loadDashboard();
    loadCategoriesDropdown();
  }
});

// ---- Date Display ----
function updateDate() {
  const now = new Date();
  const options = { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  };
  document.getElementById('currentDate').textContent = now.toLocaleDateString('ku', options) || now.toLocaleDateString('ar-IQ', options);
}
setInterval(updateDate, 60000);

// ---- Page Navigation ----
function switchPage(page) {
  document.querySelectorAll('.page-section').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  
  document.getElementById(`page-${page}`).style.display = 'block';
  document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');

  const titles = {
    dashboard: '📊 داشبۆرد',
    products: '⚙️ بەرهەمەکان',
    categories: '📁 جۆرەکان',
    suppliers: '🏢 کۆمپانیاکان'
  };
  document.getElementById('pageTitle').textContent = titles[page] || page;

  if (page === 'dashboard') loadDashboard();
  else if (page === 'products') loadProducts();
  else if (page === 'categories') loadCategories();
  else if (page === 'suppliers') loadSuppliers();
}

function openReportsPage() {
  switchPage('dashboard');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelector('.nav-item[data-page="reports"]').classList.add('active');
  document.getElementById('pageTitle').textContent = '📑 ڕاپۆرتەکان';
  openDashboardReport('products');
}

// ---- API Helper with transparent Mock Fallback ----
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('autopart_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers
    };
    if (data) options.body = JSON.stringify(data);
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (!response.ok) {
      if (response.status === 401 && endpoint !== '/auth/login') {
        handleLogout(false);
      }
      if (endpoint === '/auth/login') {
        const result = await response.json().catch(() => ({}));
        return { success: false, message: result.message || 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە!' };
      }
      return handleMockApi(endpoint, method, data);
    }
    const json = await response.json();
    if (!json.success && endpoint !== '/auth/login') {
      return handleMockApi(endpoint, method, data);
    }
    return json;
  } catch (err) {
    return handleMockApi(endpoint, method, data);
  }
}

// ---- Format Numbers ----
function formatNumber(num) {
  return Number(num || 0).toLocaleString('en-US');
}

function formatPrice(num) {
  return Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatPriceUSD(num) {
  return '$' + Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ---- Toast Notifications ----
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-30px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---- Modal Controls ----
function openModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
  }
});

// ===========================
// DASHBOARD
// ===========================
async function loadDashboard() {
  try {
    const [result, alertsResult, categoriesResult] = await Promise.all([
      apiCall('/dashboard/stats'),
      apiCall('/dashboard/stock-alerts'),
      apiCall('/categories')
    ]);
    const d = result.data;
    
    document.getElementById('statTotalProducts').textContent = formatNumber(d.totalProducts);
    document.getElementById('statTotalCategories').textContent = formatNumber(d.totalCategories);
    
    const totalAlerts = d.totalAlerts || ((d.lowStock || 0) + (d.outOfStock || 0));
    document.getElementById('statStockAlerts').textContent = formatNumber(totalAlerts);
    document.getElementById('statLowStock').textContent = formatNumber(d.lowStock);
    document.getElementById('statOutOfStock').textContent = formatNumber(d.outOfStock);
    
    document.getElementById('statTotalQuantity').textContent = formatNumber(d.totalQuantity);
    document.getElementById('statTotalValueIQD').textContent = formatPrice(d.totalValueIQD) + ' IQD';
    document.getElementById('statTotalValueUSD').textContent = formatPriceUSD(d.totalValueUSD);

    cachedStockAlerts = alertsResult.data || [];
    renderCategoryOverview(categoriesResult.data || []);
    renderDashboardAlertPreview(cachedStockAlerts);
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

function renderCategoryOverview(categories) {
  const container = document.getElementById('categoryBars');
  if (!categories.length) {
    container.innerHTML = '<div class="dashboard-empty">هیچ جۆرێک نییە</div>';
    return;
  }

  const maxCount = Math.max(...categories.map(c => Number(c.product_count) || 0), 1);
  container.innerHTML = categories.map(c => {
    const count = Number(c.product_count) || 0;
    const width = Math.max((count / maxCount) * 100, count ? 8 : 0);
    return `
      <div class="category-bar-item">
        <div class="category-bar-label"><span>${escapeHtml(c.name)}</span><strong>${formatNumber(count)}</strong></div>
        <div class="category-bar-track"><div class="category-bar-fill" style="width:${width}%"></div></div>
      </div>`;
  }).join('');
}

function renderDashboardAlertPreview(items) {
  const tbody = document.getElementById('dashboardAlertPreviewBody');
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="dashboard-empty">🎉 هیچ ئاگاداریەکی ستۆک نییە</td></tr>';
    return;
  }

  tbody.innerHTML = items.slice(0, 5).map(p => {
    const isOut = Number(p.quantity) === 0;
    const status = isOut
      ? '<span class="badge badge-danger">🚫 نەماوە</span>'
      : '<span class="badge badge-warning">⚠️ لە کەمی دایە</span>';
    return `
      <tr>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td>${escapeHtml(p.category_name || '-')}</td>
        <td>${formatNumber(p.quantity)} دانە</td>
        <td>${formatNumber(p.min_stock)} دانە</td>
        <td>${status}</td>
      </tr>`;
  }).join('');
}

async function openInlineStockAlertReport() {
  await openDashboardReport('stock');
}

let currentDashboardReport = 'stock';

async function openDashboardReport(type = 'stock') {
  currentDashboardReport = type;
  document.querySelectorAll('.dashboard-report-btn').forEach(btn => btn.classList.remove('active'));
  const reportButton = document.getElementById(`reportBtn${type.charAt(0).toUpperCase() + type.slice(1)}`);
  if (reportButton) reportButton.classList.add('active');

  try {
    document.getElementById('dashboardStockReport').style.display = 'block';

    if (type === 'stock') {
      const result = await apiCall('/dashboard/stock-alerts');
      cachedStockAlerts = result.data || [];
      const outCount = cachedStockAlerts.filter(p => Number(p.quantity) === 0).length;
      const lowCount = cachedStockAlerts.filter(p => Number(p.quantity) > 0 && Number(p.quantity) <= Number(p.min_stock)).length;
      document.getElementById('dashboardReportTitle').textContent = '📑 ئاگاداری کەمی و نەماوی ستۆک';
      document.getElementById('dashboardReportBanner').style.display = 'flex';
      document.getElementById('dashboardStockFilters').style.display = 'flex';
      document.getElementById('inlineAlertCountAll').textContent = cachedStockAlerts.length;
      document.getElementById('inlineAlertCountOut').textContent = outCount;
      document.getElementById('inlineAlertCountLow').textContent = lowCount;
      filterInlineAlertReport('all');
    } else if (type === 'products') {
      const result = await apiCall('/products?limit=1000');
      document.getElementById('dashboardReportTitle').textContent = '📦 راپۆرتی هەموو بەرهەمەکان';
      document.getElementById('dashboardReportBanner').style.display = 'none';
      document.getElementById('dashboardStockFilters').style.display = 'none';
      renderProductsReport(result.data || []);
    } else if (type === 'quantity') {
      const result = await apiCall('/products?limit=1000');
      document.getElementById('dashboardReportTitle').textContent = '🔢 راپۆرتی کۆی دانەی بەرهەمەکان';
      document.getElementById('dashboardReportBanner').style.display = 'none';
      document.getElementById('dashboardStockFilters').style.display = 'none';
      renderQuantityReport(result.data || []);
    } else if (type === 'categories') {
      const result = await apiCall('/categories');
      document.getElementById('dashboardReportTitle').textContent = '📁 راپۆرتی هەموو جۆرەکان';
      document.getElementById('dashboardReportBanner').style.display = 'none';
      document.getElementById('dashboardStockFilters').style.display = 'none';
      renderCategoriesReport(result.data || []);
    } else if (type === 'suppliers') {
      const result = await apiCall('/suppliers');
      document.getElementById('dashboardReportTitle').textContent = '🏢 راپۆرتی هەموو کۆمپانیاکان';
      document.getElementById('dashboardReportBanner').style.display = 'none';
      document.getElementById('dashboardStockFilters').style.display = 'none';
      renderSuppliersReport(result.data || []);
    }

    setTimeout(() => document.getElementById('dashboardStockReport').scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  } catch (err) {
    showToast('هەڵە لە بارکردنی ڕاپۆرت', 'error');
  }
}

function closeInlineStockAlertReport() {
  document.getElementById('dashboardStockReport').style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterInlineAlertReport(type) {
  document.querySelectorAll('.dashboard-inline-report .alert-filter-btn').forEach(btn => btn.classList.remove('active'));
  const activeId = type === 'out' ? 'inlineBtnAlertOut' : type === 'low' ? 'inlineBtnAlertLow' : 'inlineBtnAlertAll';
  document.getElementById(activeId).classList.add('active');

  let list = cachedStockAlerts;
  if (type === 'out') list = cachedStockAlerts.filter(p => Number(p.quantity) === 0);
  if (type === 'low') list = cachedStockAlerts.filter(p => Number(p.quantity) > 0 && Number(p.quantity) <= Number(p.min_stock));
  renderInlineStockAlertTable(list);
}

function renderInlineStockAlertTable(items) {
  const tbody = document.getElementById('inlineStockAlertTableBody');
  document.querySelector('#inlineStockAlertTable thead').innerHTML = `
    <tr>
      <th>#</th><th>بەرهەم</th><th>ژمارەی پارچە</th><th>جۆر</th>
      <th>ماوە لە ستۆک</th><th>کەمترین ستۆک</th><th>دۆخ</th>
      <th>نرخی کڕین</th><th>شوێن</th><th>کردار</th>
    </tr>`;
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="10" class="dashboard-empty">🎉 هیچ بەرهەمێک لەم دۆخەدا نییە</td></tr>';
    return;
  }

  tbody.innerHTML = items.map((p, index) => {
    const isOut = Number(p.quantity) === 0;
    const status = isOut
      ? '<span class="badge badge-danger">🚫 نەماوە</span>'
      : '<span class="badge badge-warning">⚠️ لە کەمی دایە</span>';
    return `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(p.name)}</strong><br><small>${escapeHtml(p.model || '')}</small></td>
        <td style="direction:ltr;text-align:right">${escapeHtml(p.part_number || p.barcode || '-')}</td>
        <td>${escapeHtml(p.category_name || '-')}</td>
        <td><strong style="color:${isOut ? 'var(--danger)' : 'var(--warning-dark)'}">${formatNumber(p.quantity)} دانە</strong></td>
        <td>${formatNumber(p.min_stock)} دانە</td>
        <td>${status}</td>
        <td>${formatPrice(p.buy_price_iqd)} IQD</td>
        <td>${escapeHtml(p.location || '-')}</td>
        <td><button class="btn btn-primary btn-sm" onclick="editProduct(${p.id})">✏️ نوێکردنەوە</button></td>
      </tr>`;
  }).join('');
}

function renderProductsReport(items) {
  document.querySelector('#inlineStockAlertTable thead').innerHTML = `
    <tr>
      <th>#</th><th>بەرهەم</th><th>جۆر</th><th>مۆدێل</th><th>ژمارەی پارچە</th>
      <th>دانە</th><th>نرخی کڕین (IQD)</th><th>نرخی فرۆشتن (IQD)</th>
      <th>نرخی کڕین ($)</th><th>نرخی فرۆشتن ($)</th><th>شوێن</th>
    </tr>`;
  const tbody = document.getElementById('inlineStockAlertTableBody');
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="11" class="dashboard-empty">هیچ بەرهەمێک نەدۆزرایەوە</td></tr>';
    return;
  }
  tbody.innerHTML = items.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(p.name)}</strong></td>
      <td>${escapeHtml(p.category_name || '-')}</td>
      <td>${escapeHtml(p.model || '-')}</td>
      <td style="direction:ltr;text-align:right">${escapeHtml(p.part_number || p.barcode || '-')}</td>
      <td><strong>${formatNumber(p.quantity)} دانە</strong></td>
      <td>${formatPrice(p.buy_price_iqd)} IQD</td>
      <td>${formatPrice(p.sell_price_iqd)} IQD</td>
      <td>${formatPriceUSD(p.buy_price_usd)}</td>
      <td>${formatPriceUSD(p.sell_price_usd)}</td>
      <td>${escapeHtml(p.location || '-')}</td>
    </tr>`).join('');
}

function renderQuantityReport(items) {
  document.querySelector('#inlineStockAlertTable thead').innerHTML = `
    <tr>
      <th>#</th><th>بەرهەم</th><th>جۆر</th><th>مۆدێل</th>
      <th>کۆی دانە</th><th>کەمترین ستۆک</th><th>دۆخ</th>
    </tr>`;
  const tbody = document.getElementById('inlineStockAlertTableBody');
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="dashboard-empty">هیچ بەرهەمێک نەدۆزرایەوە</td></tr>';
    return;
  }

  const sortedItems = [...items].sort((a, b) => Number(b.quantity) - Number(a.quantity));
  tbody.innerHTML = sortedItems.map((p, i) => {
    const quantity = Number(p.quantity) || 0;
    const minStock = Number(p.min_stock) || 0;
    const status = quantity === 0
      ? '<span class="badge badge-danger">🚫 نەماوە</span>'
      : quantity <= minStock
        ? '<span class="badge badge-warning">⚠️ لە کەمی دایە</span>'
        : '<span class="badge badge-success">✅ ستۆکی هەبەندە</span>';
    return `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td>${escapeHtml(p.category_name || '-')}</td>
        <td>${escapeHtml(p.model || '-')}</td>
        <td><strong>${formatNumber(quantity)} دانە</strong></td>
        <td>${formatNumber(minStock)} دانە</td>
        <td>${status}</td>
      </tr>`;
  }).join('');
}

function renderCategoriesReport(items) {
  document.querySelector('#inlineStockAlertTable thead').innerHTML = `
    <tr><th>#</th><th>ناوی جۆر</th><th>وەسف</th><th>ژمارەی بەرهەم</th></tr>`;
  const tbody = document.getElementById('inlineStockAlertTableBody');
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="dashboard-empty">هیچ جۆرێک نەدۆزرایەوە</td></tr>';
    return;
  }
  tbody.innerHTML = items.map((c, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(c.name)}</strong></td>
      <td>${escapeHtml(c.description || '-')}</td>
      <td>${formatNumber(c.product_count)} بەرهەم</td>
    </tr>`).join('');
}

function renderSuppliersReport(items) {
  document.querySelector('#inlineStockAlertTable thead').innerHTML = `
    <tr><th>#</th><th>ناوی کۆمپانیا</th><th>مۆبایل</th><th>ناونیشان</th></tr>`;
  const tbody = document.getElementById('inlineStockAlertTableBody');
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="dashboard-empty">هیچ کۆمپانیایەک نەدۆزرایەوە</td></tr>';
    return;
  }
  tbody.innerHTML = items.map((c, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${escapeHtml(c.name)}</strong></td>
      <td style="direction:ltr;text-align:right">${escapeHtml(c.phone || '-')}</td>
      <td>${escapeHtml(c.address || '-')}</td>
    </tr>`).join('');
}

function printDashboardReport() {
  const printTitle = document.getElementById('dashboardReportTitle');
  const printReportTitle = document.getElementById('printReportTitle');
  const printReportDate = document.getElementById('printReportDate');
  if (printReportTitle) printReportTitle.textContent = printTitle ? printTitle.textContent : 'ڕاپۆرت';
  if (printReportDate) {
    printReportDate.textContent = 'بەروار: ' + new Intl.DateTimeFormat('ku', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());
  }
  document.body.classList.add('printing-dashboard-report');
  window.print();
  setTimeout(() => document.body.classList.remove('printing-dashboard-report'), 500);
}

// ===========================
// STOCK ALERT REPORT
// ===========================
async function openStockAlertReportModal(filter = 'all') {
  try {
    const result = await apiCall('/dashboard/stock-alerts');
    cachedStockAlerts = result.data || [];
    
    const outCount = cachedStockAlerts.filter(p => Number(p.quantity) === 0).length;
    const lowCount = cachedStockAlerts.filter(p => Number(p.quantity) > 0 && Number(p.quantity) <= Number(p.min_stock)).length;
    
    document.getElementById('alertCountAll').textContent = cachedStockAlerts.length;
    document.getElementById('alertCountOut').textContent = outCount;
    document.getElementById('alertCountLow').textContent = lowCount;
    
    filterAlertReport(filter);
    openModal('stockAlertModal');
  } catch (err) {
    showToast('هەڵە لە بارکردنی ڕاپۆرتی ئاگادارییەکان', 'error');
  }
}

function filterAlertReport(type) {
  currentAlertFilter = type;
  
  document.querySelectorAll('.alert-filter-btn').forEach(btn => btn.classList.remove('active'));
  if (type === 'all') document.getElementById('btnAlertAll').classList.add('active');
  else if (type === 'out') document.getElementById('btnAlertOut').classList.add('active');
  else if (type === 'low') document.getElementById('btnAlertLow').classList.add('active');
  
  let list = cachedStockAlerts;
  if (type === 'out') {
    list = cachedStockAlerts.filter(p => Number(p.quantity) === 0);
  } else if (type === 'low') {
    list = cachedStockAlerts.filter(p => Number(p.quantity) > 0 && Number(p.quantity) <= Number(p.min_stock));
  }
  
  renderStockAlertTable(list);
}

function renderStockAlertTable(items) {
  const tbody = document.getElementById('stockAlertTableBody');
  
  if (!items || items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center;padding:36px">
          <div style="font-size:36px;margin-bottom:8px">🎉</div>
          <h4 style="color:var(--secondary);font-size:16px">مەخزەن لە دۆخێکی زۆر باشدایە!</h4>
          <p style="color:var(--text-light);font-size:13px">هیچ بەرهەمێک لەم بەشەدا نییە کە پێویستی بە ئاگاداری بێت.</p>
        </td>
      </tr>`;
    return;
  }
  
  tbody.innerHTML = items.map((p, i) => {
    const isOut = Number(p.quantity) === 0;
    const badge = isOut
      ? '<span class="badge badge-danger">🚫 نەماوە (ستۆک سفرە)</span>'
      : `<span class="badge badge-warning">⚠️ لە کەمی دایە (${p.quantity} ماوە)</span>`;
      
    const quantityStyle = isOut 
      ? 'color:var(--danger);font-weight:800;font-size:15px'
      : 'color:var(--warning-dark);font-weight:800;font-size:15px';
      
    return `
      <tr style="${isOut ? 'background:rgba(234,67,53,0.05)' : ''}">
        <td style="font-weight:600;color:var(--text-lighter)">${i + 1}</td>
        <td>
          <div class="product-name-cell">
            <div class="product-thumb" style="${isOut ? 'background:#fce8e6;color:var(--danger)' : ''}">
              ${isOut ? '🚫' : '⚠️'}
            </div>
            <div class="product-info">
              <div class="product-name" style="font-weight:700">${escapeHtml(p.name)}</div>
              <div class="product-part-num">${escapeHtml(p.model || '')}</div>
            </div>
          </div>
        </td>
        <td style="font-family:Consolas,monospace;direction:ltr;text-align:right">${escapeHtml(p.part_number || p.barcode || '-')}</td>
        <td><span class="badge badge-info">${escapeHtml(p.category_name || '-')}</span></td>
        <td><span style="${quantityStyle}">${formatNumber(p.quantity)} دانە</span></td>
        <td style="font-weight:600">${formatNumber(p.min_stock)} دانە</td>
        <td>${badge}</td>
        <td><div class="price price-iqd">${formatPrice(p.buy_price_iqd)} IQD</div></td>
        <td style="font-family:Consolas,monospace">${escapeHtml(p.location || '-')}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="closeModal('stockAlertModal'); editProduct(${p.id})" title="نوێکردنەوەی ستۆک">
            ✏️ زیادکردنی ستۆک
          </button>
        </td>
      </tr>`;
  }).join('');
}

function printStockAlertReport() {
  window.print();
}

// ===========================
// PRODUCTS
// ===========================
async function loadProducts(page = 1) {
  currentPage = page;
  const search = document.getElementById('searchInput').value;
  const category_id = document.getElementById('filterCategory').value;
  const stock_status = document.getElementById('filterStock').value;

  const params = new URLSearchParams({
    search, category_id, stock_status,
    page, limit: 15,
    sort_by: 'created_at', sort_order: 'DESC'
  });

  try {
    const result = await apiCall(`/products?${params}`);
    renderProductsTable(result.data, result.pagination);
  } catch (err) {
    showToast('هەڵە لە بارکردنی بەرهەمەکان', 'error');
  }
}

function renderProductsTable(products, pagination) {
  const tbody = document.getElementById('productsTableBody');
  
  if (!products || products.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="10">
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>هیچ بەرهەمێک نەدۆزرایەوە</h3>
          <p>فلتەرەکان بگۆڕە یان بەرهەمی نوێ زیاد بکە</p>
        </div>
      </td></tr>`;
    document.getElementById('paginationContainer').innerHTML = '';
    return;
  }

  let html = '';
  const startNum = (pagination.page - 1) * pagination.limit;
  
  products.forEach((p, i) => {
    const isOut = Number(p.quantity) === 0;
    const isLow = Number(p.quantity) > 0 && Number(p.quantity) <= Number(p.min_stock);
    const stockBadge = isOut
      ? '<span class="badge badge-danger">🚫 نەماوە</span>'
      : isLow
        ? `<span class="badge badge-warning">⚠️ ${formatNumber(p.quantity)} کەمە</span>`
        : `<span class="badge badge-success">✅ ${formatNumber(p.quantity)}</span>`;

    html += `
      <tr>
        <td style="color:var(--text-lighter);font-weight:600">${startNum + i + 1}</td>
        <td>
          <div class="product-name-cell">
            <div class="product-thumb">⚙️</div>
            <div class="product-info">
              <div class="product-name">${escapeHtml(p.name)}</div>
              <div class="product-part-num">${escapeHtml(p.part_number || '-')}</div>
            </div>
          </div>
        </td>
        <td><span class="badge badge-info">${escapeHtml(p.category_name || '-')}</span></td>
        <td>${escapeHtml(p.model || '-')}</td>
        <td>${stockBadge}</td>
        <td><div class="price-badge-iqd">${formatPrice(p.buy_price_iqd)} د.ع</div></td>
        <td><div class="price-badge-iqd" style="background:#ecfdf5;color:#047857;border-color:#a7f3d0">${formatPrice(p.sell_price_iqd)} د.ع</div></td>
        <td><div class="price-badge-usd">${formatPriceUSD(p.sell_price_usd)}</div></td>
        <td><span class="location-badge">📍 ${escapeHtml(p.location || '-')}</span></td>
        <td>
          <div class="btn-group">
            <button class="btn btn-primary btn-icon btn-sm" onclick="editProduct(${p.id})" title="دەستکاریکردن">✏️</button>
            <button class="btn btn-danger btn-icon btn-sm" onclick="deleteProduct(${p.id}, '${escapeHtml(p.name)}')" title="سڕینەوە">🗑️</button>
          </div>
        </td>
      </tr>`;
  });

  tbody.innerHTML = html;
  renderPagination(pagination);
}

function renderPagination(pagination) {
  const container = document.getElementById('paginationContainer');
  if (pagination.totalPages <= 1) {
    container.innerHTML = `<span class="pagination-info">کۆی ${formatNumber(pagination.total)} بەرهەم</span>`;
    return;
  }

  let html = '';
  html += `<button class="pagination-btn" onclick="loadProducts(${pagination.page - 1})" ${pagination.page <= 1 ? 'disabled' : ''}>◀</button>`;
  
  for (let i = 1; i <= pagination.totalPages; i++) {
    if (i === 1 || i === pagination.totalPages || Math.abs(i - pagination.page) <= 2) {
      html += `<button class="pagination-btn ${i === pagination.page ? 'active' : ''}" onclick="loadProducts(${i})">${i}</button>`;
    } else if (Math.abs(i - pagination.page) === 3) {
      html += `<span class="pagination-info">...</span>`;
    }
  }
  
  html += `<button class="pagination-btn" onclick="loadProducts(${pagination.page + 1})" ${pagination.page >= pagination.totalPages ? 'disabled' : ''}>▶</button>`;
  html += `<span class="pagination-info">کۆی ${formatNumber(pagination.total)} بەرهەم</span>`;
  
  container.innerHTML = html;
}

// Search Debounce
function debounceSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadProducts(1), 300);
}

// Reset Filters
function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterStock').value = '';
  loadProducts(1);
}

// =============================================
// CURRENCY & EXCHANGE RATE CONVERTER
// =============================================
function getExchangeRate() {
  const saved = Number(localStorage.getItem('autopart_rate'));
  return Number.isFinite(saved) && saved > 0 ? saved : 150000;
}

function initExchangeRate() {
  const rate = getExchangeRate();
  const topInput = document.getElementById('globalExchangeRate');
  if (topInput) topInput.value = rate;
  updateRateDisplays(rate);

  // گەڕان و وەرگرتنی خۆکاری نرخی دۆلار لە بۆرسەوە
  setTimeout(() => syncExchangeRateFromBourse(), 500);
}

// وەرگرتنی ڕاستەوخۆی نرخی دۆلار لە ماڵپەڕی ئالان چەند (alanchand.com)
async function syncExchangeRateFromBourse() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const rateUrls = ['/api/exchange/rate'];
    const isLocalHost = ['localhost', '127.0.0.1'].includes(location.hostname);
    // Static local servers do not provide the API, so also try the app server.
    if (location.protocol === 'file:' || (isLocalHost && location.port !== '3000')) {
      rateUrls.push(`http://${location.hostname || 'localhost'}:3000/api/exchange/rate`);
    }

    let result = null;
    let requestError = null;
    try {
      for (const url of rateUrls) {
        try {
          const apiRes = await fetch(url, { signal: controller.signal });
          const responseData = await apiRes.json().catch(() => ({}));
          if (!apiRes.ok) {
            throw new Error(responseData.error || `Exchange rate request failed (${apiRes.status})`);
          }

          const rate = Number(responseData && responseData.rate);
          if (!responseData || !responseData.success || !Number.isFinite(rate) || rate <= 0) {
            throw new Error('AlanChand returned an invalid exchange rate');
          }

          result = responseData;
          break;
        } catch (error) {
          requestError = error;
          if (controller.signal.aborted) break;
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }
    if (!result) throw requestError || new Error('Could not fetch the exchange rate');
    const fetchedRate = Number(result && result.rate);

    localStorage.setItem('autopart_rate', fetchedRate);
    const topInput = document.getElementById('globalExchangeRate');
    if (topInput) topInput.value = fetchedRate;
    updateRateDisplays(fetchedRate);
  } catch (err) {
    console.error('Exchange rate sync failed:', err);
  }
}

function updateRateDisplays(rate) {
  const modalDisp = document.getElementById('modalRateDisplay');
  if (modalDisp) modalDisp.textContent = formatPrice(rate);
  
  const quickDisp = document.getElementById('quickRateDisplay');
  if (quickDisp) quickDisp.textContent = `${formatPrice(rate)} دینار`;

  const calcUSD = document.getElementById('calcInputUSD');
  if (calcUSD && calcUSD.value !== '') runQuickConverter('usd');
}

function onGlobalRateChange(val) {
  const rate = parseFloat(val);
  if (!Number.isFinite(rate) || rate <= 0) return;
  localStorage.setItem('autopart_rate', rate);
  updateRateDisplays(rate);
  
  // If product modal is open, recalculate IQD from USD
  const buyUSD = parseFloat(document.getElementById('productBuyPriceUSD')?.value) || 0;
  const sellUSD = parseFloat(document.getElementById('productSellPriceUSD')?.value) || 0;
  if (buyUSD > 0) convertPrice('buy', 'usd');
  if (sellUSD > 0) convertPrice('sell', 'usd');
}

function convertPrice(type, fromCurrency) {
  const rate = getExchangeRate();
  const ratePerDollar = rate / 100;
  
  const usdInput = document.getElementById(type === 'buy' ? 'productBuyPriceUSD' : 'productSellPriceUSD');
  const iqdInput = document.getElementById(type === 'buy' ? 'productBuyPriceIQD' : 'productSellPriceIQD');
  
  if (!usdInput || !iqdInput) return;
  
  if (fromCurrency === 'usd') {
    const usd = parseFloat(usdInput.value) || 0;
    const iqd = Math.round(usd * ratePerDollar);
    iqdInput.value = iqd || 0;
  } else if (fromCurrency === 'iqd') {
    const iqd = parseFloat(iqdInput.value) || 0;
    const usd = +(iqd / ratePerDollar).toFixed(2);
    usdInput.value = usd || 0;
  }
  
  updateProfitPreview();
}

function updateProfitPreview() {
  const buyIQD = parseFloat(document.getElementById('productBuyPriceIQD')?.value) || 0;
  const sellIQD = parseFloat(document.getElementById('productSellPriceIQD')?.value) || 0;
  const buyUSD = parseFloat(document.getElementById('productBuyPriceUSD')?.value) || 0;
  const sellUSD = parseFloat(document.getElementById('productSellPriceUSD')?.value) || 0;
  
  const profitIQD = sellIQD - buyIQD;
  const profitUSD = +(sellUSD - buyUSD).toFixed(2);
  
  const profitIQDEl = document.getElementById('profitPreviewIQD');
  const profitUSDEl = document.getElementById('profitPreviewUSD');
  
  if (profitIQDEl && profitUSDEl) {
    profitIQDEl.textContent = `${formatPrice(profitIQD)} IQD`;
    profitUSDEl.textContent = formatPriceUSD(profitUSD);
    
    if (profitIQD >= 0) {
      profitIQDEl.style.color = 'var(--secondary)';
    } else {
      profitIQDEl.style.color = 'var(--danger)';
    }
  }
}

function runQuickConverter(fromCurrency) {
  const ratePerDollar = getExchangeRate() / 100;
  const usdInput = document.getElementById('calcInputUSD');
  const iqdInput = document.getElementById('calcInputIQD');
  if (!usdInput || !iqdInput) return;
  
  if (fromCurrency === 'usd') {
    if (usdInput.value === '') {
      iqdInput.value = '';
      return;
    }
    const usd = Number(usdInput.value);
    if (!Number.isFinite(usd) || usd < 0) {
      iqdInput.value = '';
      return;
    }
    iqdInput.value = Math.round(usd * ratePerDollar);
  } else if (fromCurrency === 'iqd') {
    if (iqdInput.value === '') {
      usdInput.value = '';
      return;
    }
    const iqd = Number(iqdInput.value);
    if (!Number.isFinite(iqd) || iqd < 0) {
      usdInput.value = '';
      return;
    }
    usdInput.value = +(iqd / ratePerDollar).toFixed(2);
  }
}

// Open Add Product Modal
function openAddProductModal() {
  document.getElementById('productId').value = '';
  document.getElementById('productForm').reset();
  document.getElementById('productQuantity').value = '0';
  document.getElementById('productBuyPriceIQD').value = '0';
  document.getElementById('productSellPriceIQD').value = '0';
  document.getElementById('productBuyPriceUSD').value = '0';
  document.getElementById('productSellPriceUSD').value = '0';
  document.getElementById('productMinStock').value = '5';
  document.getElementById('productModalTitle').textContent = '➕ زیادکردنی بەرهەمی نوێ';
  updateRateDisplays(getExchangeRate());
  updateProfitPreview();
  loadCategoriesDropdown('productCategory');
  openModal('productModal');
}

// Edit Product
async function editProduct(id) {
  try {
    const result = await apiCall(`/products/${id}`);
    const p = result.data;

    document.getElementById('productId').value = p.id;
    document.getElementById('productName').value = p.name;
    document.getElementById('productModel').value = p.model || '';
    document.getElementById('productPartNumber').value = p.part_number || '';
    document.getElementById('productBarcode').value = p.barcode || '';
    document.getElementById('productQuantity').value = p.quantity;
    document.getElementById('productBuyPriceIQD').value = p.buy_price_iqd;
    document.getElementById('productSellPriceIQD').value = p.sell_price_iqd;
    document.getElementById('productBuyPriceUSD').value = p.buy_price_usd;
    document.getElementById('productSellPriceUSD').value = p.sell_price_usd;
    document.getElementById('productMinStock').value = p.min_stock;
    document.getElementById('productLocation').value = p.location || '';
    document.getElementById('productDescription').value = p.description || '';
    document.getElementById('productModalTitle').textContent = '✏️ دەستکاریکردنی بەرهەم';

    updateRateDisplays(getExchangeRate());
    updateProfitPreview();

    await loadCategoriesDropdown('productCategory');
    document.getElementById('productCategory').value = p.category_id || '';
    
    openModal('productModal');
  } catch (err) {
    showToast('هەڵە لە بارکردنی بەرهەم', 'error');
  }
}

// Save Product
async function saveProduct(e) {
  e.preventDefault();
  
  const id = document.getElementById('productId').value;
  const data = {
    name: document.getElementById('productName').value,
    category_id: document.getElementById('productCategory').value || null,
    model: document.getElementById('productModel').value,
    part_number: document.getElementById('productPartNumber').value,
    barcode: document.getElementById('productBarcode').value,
    quantity: parseInt(document.getElementById('productQuantity').value) || 0,
    buy_price_iqd: parseFloat(document.getElementById('productBuyPriceIQD').value) || 0,
    sell_price_iqd: parseFloat(document.getElementById('productSellPriceIQD').value) || 0,
    buy_price_usd: parseFloat(document.getElementById('productBuyPriceUSD').value) || 0,
    sell_price_usd: parseFloat(document.getElementById('productSellPriceUSD').value) || 0,
    min_stock: parseInt(document.getElementById('productMinStock').value) || 5,
    location: document.getElementById('productLocation').value,
    description: document.getElementById('productDescription').value
  };

  try {
    if (id) {
      await apiCall(`/products/${id}`, 'PUT', data);
      showToast('بەرهەم نوێکرایەوە بە سەرکەوتوویی');
      closeModal('productModal');
    } else {
      await apiCall('/products', 'POST', data);
      showToast('✅ بەرهەم پاشەکەوت کرا - دەتوانیت بەرهەمی دواتر بنووسیت');
      
      // تەنیا بۆشاییەکان بەتاڵ بکەوە و بەشەکە دامەخە
      document.getElementById('productId').value = '';
      document.getElementById('productName').value = '';
      document.getElementById('productModel').value = '';
      document.getElementById('productPartNumber').value = '';
      document.getElementById('productBarcode').value = '';
      document.getElementById('productQuantity').value = '0';
      document.getElementById('productBuyPriceIQD').value = '0';
      document.getElementById('productSellPriceIQD').value = '0';
      document.getElementById('productBuyPriceUSD').value = '0';
      document.getElementById('productSellPriceUSD').value = '0';
      document.getElementById('productMinStock').value = '5';
      document.getElementById('productLocation').value = '';
      document.getElementById('productDescription').value = '';
      
      updateProfitPreview();
      
      // ڕاستەوخۆ فوکەس بخەرەوە سەر ناوی بەرهەم بۆ نووسینی خێرا
      setTimeout(() => {
        const nameInput = document.getElementById('productName');
        if (nameInput) nameInput.focus();
      }, 50);
    }
    loadProducts(currentPage);
    loadDashboard();
  } catch (err) {
    showToast(err.message || 'هەڵەیەک ڕوویدا', 'error');
  }
}

// Delete Product
function deleteProduct(id, name) {
  document.getElementById('deleteMessage').textContent = `ئایا دڵنیای لە سڕینەوەی "${name}"؟`;
  document.getElementById('confirmDeleteBtn').onclick = async () => {
    try {
      await apiCall(`/products/${id}`, 'DELETE');
      showToast('بەرهەم سڕایەوە بە سەرکەوتوویی');
      closeModal('deleteModal');
      loadProducts(currentPage);
      loadDashboard();
    } catch (err) {
      showToast('هەڵە لە سڕینەوە', 'error');
    }
  };
  openModal('deleteModal');
}

// Export / Print Products
function exportProducts() {
  window.print();
}

// ===========================
// CATEGORIES
// ===========================
async function loadCategories() {
  try {
    const result = await apiCall('/categories');
    renderCategoriesTable(result.data);
  } catch (err) {
    showToast('هەڵە لە بارکردنی جۆرەکان', 'error');
  }
}

function renderCategoriesTable(categories) {
  const tbody = document.getElementById('categoriesTableBody');
  if (!categories || categories.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📁</div><h3>هیچ جۆرێک نییە</h3></div></td></tr>`;
    return;
  }

  tbody.innerHTML = categories.map((c, i) => `
    <tr>
      <td style="font-weight:600;color:var(--text-lighter)">${i + 1}</td>
      <td style="font-weight:600;font-size:15px">${escapeHtml(c.name)}</td>
      <td style="color:var(--text-light)">${escapeHtml(c.description || '-')}</td>
      <td><span class="badge badge-info">${formatNumber(c.product_count)} بەرهەم</span></td>
      <td>
        <div class="btn-group">
          <button class="btn btn-primary btn-icon btn-sm" onclick="editCategory(${c.id}, '${escapeJs(c.name)}', '${escapeJs(c.description || '')}')" title="دەستکاریکردن">✏️</button>
          <button class="btn btn-danger btn-icon btn-sm" onclick="deleteCategory(${c.id}, '${escapeJs(c.name)}')" title="سڕینەوە">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

function openAddCategoryModal() {
  document.getElementById('categoryId').value = '';
  document.getElementById('categoryForm').reset();
  document.getElementById('categoryModalTitle').textContent = '➕ زیادکردنی جۆری نوێ';
  openModal('categoryModal');
}

function editCategory(id, name, desc) {
  document.getElementById('categoryId').value = id;
  document.getElementById('categoryName').value = name;
  document.getElementById('categoryDescription').value = desc;
  document.getElementById('categoryModalTitle').textContent = '✏️ دەستکاریکردنی جۆر';
  openModal('categoryModal');
}

async function saveCategory(e) {
  e.preventDefault();
  const id = document.getElementById('categoryId').value;
  const data = {
    name: document.getElementById('categoryName').value,
    description: document.getElementById('categoryDescription').value
  };

  try {
    if (id) {
      await apiCall(`/categories/${id}`, 'PUT', data);
      showToast('جۆر نوێکرایەوە');
    } else {
      await apiCall('/categories', 'POST', data);
      showToast('جۆر زیادکرا');
    }
    closeModal('categoryModal');
    loadCategories();
    loadCategoriesDropdown();
  } catch (err) {
    showToast(err.message || 'هەڵەیەک ڕوویدا', 'error');
  }
}

function deleteCategory(id, name) {
  document.getElementById('deleteMessage').textContent = `ئایا دڵنیای لە سڕینەوەی جۆری "${name}"؟`;
  document.getElementById('confirmDeleteBtn').onclick = async () => {
    try {
      await apiCall(`/categories/${id}`, 'DELETE');
      showToast('جۆر سڕایەوە');
      closeModal('deleteModal');
      loadCategories();
      loadCategoriesDropdown();
    } catch (err) {
      showToast('هەڵە لە سڕینەوە', 'error');
    }
  };
  openModal('deleteModal');
}

// ===========================
// COMPANIES (Formerly Suppliers)
// ===========================
async function loadSuppliers() {
  try {
    const result = await apiCall('/suppliers');
    renderSuppliersTable(result.data);
  } catch (err) {
    showToast('هەڵە لە بارکردنی کۆمپانیاکان', 'error');
  }
}

function renderSuppliersTable(suppliers) {
  const tbody = document.getElementById('suppliersTableBody');
  if (!suppliers || suppliers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🏢</div><h3>هیچ کۆمپانیایەک نییە</h3></div></td></tr>`;
    return;
  }

  tbody.innerHTML = suppliers.map((s, i) => `
    <tr>
      <td style="font-weight:600;color:var(--text-lighter)">${i + 1}</td>
      <td style="font-weight:600">${escapeHtml(s.name)}</td>
      <td style="font-family:Consolas,monospace;direction:ltr;text-align:right">${escapeHtml(s.phone || '-')}</td>
      <td>${escapeHtml(s.address || '-')}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-primary btn-icon btn-sm" onclick="editSupplier(${s.id}, '${escapeJs(s.name)}', '${escapeJs(s.phone || '')}', '${escapeJs(s.address || '')}')" title="دەستکاریکردن">✏️</button>
          <button class="btn btn-danger btn-icon btn-sm" onclick="deleteSupplier(${s.id}, '${escapeJs(s.name)}')" title="سڕینەوە">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

function openAddSupplierModal() {
  document.getElementById('supplierId').value = '';
  document.getElementById('supplierForm').reset();
  document.getElementById('supplierModalTitle').textContent = '➕ زیادکردنی کۆمپانیای نوێ';
  openModal('supplierModal');
}

function editSupplier(id, name, phone, address) {
  document.getElementById('supplierId').value = id;
  document.getElementById('supplierName').value = name;
  document.getElementById('supplierPhone').value = phone;
  document.getElementById('supplierAddress').value = address;
  document.getElementById('supplierModalTitle').textContent = '✏️ دەستکاریکردنی کۆمپانیا';
  openModal('supplierModal');
}

async function saveSupplier(e) {
  e.preventDefault();
  const id = document.getElementById('supplierId').value;
  const data = {
    name: document.getElementById('supplierName').value,
    phone: document.getElementById('supplierPhone').value,
    address: document.getElementById('supplierAddress').value
  };

  try {
    if (id) {
      await apiCall(`/suppliers/${id}`, 'PUT', data);
      showToast('کۆمپانیا نوێکرایەوە');
    } else {
      await apiCall('/suppliers', 'POST', data);
      showToast('کۆمپانیا زیادکرا');
    }
    closeModal('supplierModal');
    loadSuppliers();
  } catch (err) {
    showToast(err.message || 'هەڵەیەک ڕوویدا', 'error');
  }
}

function deleteSupplier(id, name) {
  document.getElementById('deleteMessage').textContent = `ئایا دڵنیای لە سڕینەوەی کۆمپانیای "${name}"؟`;
  document.getElementById('confirmDeleteBtn').onclick = async () => {
    try {
      await apiCall(`/suppliers/${id}`, 'DELETE');
      showToast('کۆمپانیا سڕایەوە');
      closeModal('deleteModal');
      loadSuppliers();
    } catch (err) {
      showToast('هەڵە لە سڕینەوە', 'error');
    }
  };
  openModal('deleteModal');
}

// ===========================
// DROPDOWNS
// ===========================
async function loadCategoriesDropdown(targetId = null) {
  try {
    const result = await apiCall('/categories');
    const categories = result.data;
    
    const filterSelect = document.getElementById('filterCategory');
    if (filterSelect) {
      const currentFilterVal = filterSelect.value;
      filterSelect.innerHTML = '<option value="">هەمووی</option>' +
        categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
      filterSelect.value = currentFilterVal;
    }

    if (targetId) {
      const productSelect = document.getElementById(targetId);
      if (productSelect) {
        productSelect.innerHTML = '<option value="">هەڵبژێرە...</option>' +
          categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
      }
    } else {
      const productSelect = document.getElementById('productCategory');
      if (productSelect) {
        const currentVal = productSelect.value;
        productSelect.innerHTML = '<option value="">هەڵبژێرە...</option>' +
          categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
        productSelect.value = currentVal;
      }
    }
  } catch (err) {
    console.error('Error loading categories:', err);
  }
}

// ===========================
// UTILITIES
// ===========================
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeJs(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// =============================================
// 🔐 AUTHENTICATION & SESSION MANAGEMENT
// =============================================

function checkAuthState() {
  const token = localStorage.getItem('autopart_auth_token');
  const userStr = localStorage.getItem('autopart_auth_user');
  const overlay = document.getElementById('loginOverlay');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      updateUserUI(user);
      if (overlay) overlay.classList.add('hidden');
      return true;
    } catch (e) {
      localStorage.removeItem('autopart_auth_token');
      localStorage.removeItem('autopart_auth_user');
    }
  }

  if (overlay) {
    overlay.classList.remove('hidden');
    const userInput = document.getElementById('loginUsername');
    if (userInput && !userInput.value) userInput.value = 'admin';
    const passInput = document.getElementById('loginPassword');
    if (passInput) passInput.focus();
  }
  return false;
}

function updateUserUI(user) {
  if (!user) return;
  const nameEl = document.getElementById('currentUserName');
  const roleEl = document.getElementById('currentUserRole');
  const avatarEl = document.getElementById('currentUserAvatar');

  if (nameEl) nameEl.textContent = user.fullName || user.username || 'ئەدمین';
  if (roleEl) roleEl.textContent = user.role === 'admin' ? 'بەڕێوەبەری سەرەکی' : 'کارمەند';
  if (avatarEl) {
    const firstChar = (user.username || 'A').charAt(0).toUpperCase();
    avatarEl.textContent = firstChar;
  }
}

async function submitLogin(e) {
  if (e) e.preventDefault();

  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const submitBtn = document.getElementById('loginSubmitBtn');

  const username = usernameInput ? usernameInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';

  if (!username || !password) {
    showLoginAlert('تکایە ناوی بەکارهێنەر و وشەی نهێنی بنووسە', 'error');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>کەمێک چاوەڕوانبە... ⏳</span>';
  }

  try {
    const res = await apiCall('/auth/login', 'POST', { username, password });

    if (res && res.success && res.token) {
      localStorage.setItem('autopart_auth_token', res.token);
      localStorage.setItem('autopart_auth_user', JSON.stringify(res.user));

      updateUserUI(res.user);
      if (passwordInput) passwordInput.value = '';
      showLoginAlert(res.message || 'چوونەژوورەوە سەرکەوتوو بوو', 'success');

      setTimeout(() => {
        const overlay = document.getElementById('loginOverlay');
        if (overlay) overlay.classList.add('hidden');
        showToast('بەخێربێیت بۆ سیستەمی Auto Part! 👋', 'success');
        initExchangeRate();
        loadDashboard();
        loadCategoriesDropdown();
      }, 500);

    } else {
      showLoginAlert((res && res.message) ? res.message : 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە!', 'error');
    }
  } catch (err) {
    showLoginAlert(err.message || 'هەڵەیەک ڕوویدا لە کاتی پەیوەندی کردن', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>چوونەژوورەوە 🔓</span>';
    }
  }
}

function showLoginAlert(msg, type = 'error') {
  const alertEl = document.getElementById('loginAlert');
  if (!alertEl) return;
  alertEl.textContent = (type === 'error' ? '⚠️ ' : '✅ ') + msg;
  alertEl.className = `login-alert ${type}`;
  alertEl.style.display = 'flex';
}

function togglePasswordVisibility() {
  const passInput = document.getElementById('loginPassword');
  if (!passInput) return;
  if (passInput.type === 'password') {
    passInput.type = 'text';
  } else {
    passInput.type = 'password';
  }
}

function handleLogout(showNotification = true) {
  localStorage.removeItem('autopart_auth_token');
  localStorage.removeItem('autopart_auth_user');

  const overlay = document.getElementById('loginOverlay');
  if (overlay) overlay.classList.remove('hidden');

  const alertEl = document.getElementById('loginAlert');
  if (alertEl) alertEl.style.display = 'none';

  const passInput = document.getElementById('loginPassword');
  if (passInput) {
    passInput.value = '';
    passInput.type = 'password';
  }

  const userInput = document.getElementById('loginUsername');
  if (userInput) userInput.value = 'admin';

  if (showNotification) {
    showToast('دەرچوون سەرکەوتوو بوو. سەردانێکی خۆش! 👋', 'info');
  }
}

