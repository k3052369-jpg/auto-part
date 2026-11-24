-- =============================================
-- Auto Part - Inventory Management System
-- Database Schema for MySQL
-- =============================================

CREATE DATABASE IF NOT EXISTS auto_part_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE auto_part_db;

-- ---------------------
-- جۆرەکانی بەرهەم (Categories)
-- ---------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------
-- بەرهەمەکان (Products)
-- ---------------------
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id INT,
  model VARCHAR(255),
  part_number VARCHAR(100),
  barcode VARCHAR(100),
  quantity INT DEFAULT 0,
  buy_price_iqd DECIMAL(15, 2) DEFAULT 0.00,
  sell_price_iqd DECIMAL(15, 2) DEFAULT 0.00,
  buy_price_usd DECIMAL(15, 2) DEFAULT 0.00,
  sell_price_usd DECIMAL(15, 2) DEFAULT 0.00,
  min_stock INT DEFAULT 5,
  location VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_part_number (part_number),
  INDEX idx_barcode (barcode),
  INDEX idx_category (category_id)
) ENGINE=InnoDB;

-- ---------------------
-- کۆمپانیاکان (Companies / Suppliers)
-- ---------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------
-- داتای نموونە و وەهمی (Sample & Mock Data)
-- ---------------------
INSERT INTO categories (id, name, description) VALUES
  (1, 'فلتەرەکان', 'فلتەری هەوا، ڕۆن، بەنزین و تەبرێت'),
  (2, 'سیستەمی بریک', 'پەدی بریک، دیسک، دەبل و ڕۆنی بریک'),
  (3, 'بزوێنەر و مەکینە', 'پلاک، قایش، پەمپ و ڕۆڵە'),
  (4, 'سەسپانسیۆن و جامپەر', 'دەبڵ، جامپەر، بۆڵبرین و بەستەر'),
  (5, 'کارەبایی و باتری', 'باتری، دینەمۆ، سویچ و لایت'),
  (6, 'سێرڤس و زەیت', 'زەیتی مەکینە، زەیتی گێڕ و هایدرۆلیک'),
  (7, 'گێڕ و کلەچ', 'دیسک و پلێت، کلەچ کیت و فلایویل'),
  (8, 'ساردکەرەوە و ڕادیاتۆر', 'ڕادیاتۆر، وەتەرپەمپ، تێرمۆستات و پانکە')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO suppliers (id, name, phone, address, notes) VALUES
  (1, 'کۆمپانیای ئەڵمان پارت', '0750 445 1234', 'هەولێر - شەقامی ١٠٠ مەتری، بەرامبەر پیشەسازی باشوور', 'هاوردەکاری پارچەی ئەڵمانی و ئەوروپی'),
  (2, 'کۆمپانیای گۆڵدن ئۆتۆ', '0770 152 7890', 'سلێمانی - شەقامی بازنەیی مەلیک مەحمود', 'بریکاری سەرەکی تۆیۆتا و هۆندا'),
  (3, 'کۆمپانیای داهێنەر بۆ هاوردە', '0750 889 6543', 'دهۆک - پیشەسازی نوێ', 'دابینکەری تایەر و باتری'),
  (4, 'کۆمپانیای یابانی پارت', '0770 334 9911', 'هەولێر - پیشەسازی باکوور', 'تایبەت بە نیسان، مازدا و میتسوبیشی'),
  (5, 'کۆمپانیای کۆریا سپێر پارت', '0750 711 2233', 'سلێمانی - ناوچەی پیشەسازی کانی گۆمە', 'تایبەت بە کیا و هیۆندای')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO products (id, name, category_id, model, part_number, barcode, quantity, buy_price_iqd, sell_price_iqd, buy_price_usd, sell_price_usd, min_stock, location, description) VALUES
  -- فلتەرەکان
  (1, 'فلتەری هەوا تۆیۆتا کۆرۆڵا', 1, 'Corolla 2018-2023', 'AF-TY-17801', '8934500112', 28, 7500, 11000, 5.00, 7.50, 6, 'A-01-01', 'فلتەری هەوای ئەسڵی جۆری تۆیۆتا'),
  (2, 'فلتەری زەیت هیۆندای و کیا', 1, 'Elantra / Tucson / Sportage', 'OF-HY-26300', '8934500113', 4, 4500, 7000, 3.00, 4.75, 8, 'A-01-02', 'فلتەری ڕۆنی مەکینەی فابریکە - لە کەمی دایە!'),
  (3, 'فلتەری بەنزین نیسان سەنی', 1, 'Sunny 2015-2022', 'FF-NS-16400', '8934500114', 0, 12000, 18000, 8.00, 12.00, 5, 'A-01-03', 'فلتەری تانکی بەنزین - تەواو بووە لە مەخزەن!'),
  (4, 'فلتەری تەبرێت (کابینە) کامری', 1, 'Camry 2020+', 'CF-TY-87139', '8934500115', 18, 6000, 9500, 4.00, 6.50, 5, 'A-01-04', 'فلتەری کەشوهەوای ناو ئۆتۆمۆبێل'),

  -- سیستەمی بریک
  (5, 'پەدی بریکی پێشەوە تۆیۆتا لاندکرۆزەر', 2, 'Land Cruiser V8 2016-2021', 'BP-LC-04465', '8934500201', 3, 38000, 55000, 25.50, 37.00, 5, 'B-02-01', 'پەدی سیرامیک کوالیتی بەرز - لە کەمی دایە'),
  (6, 'دیسکی بریکی پێشەوە کیا سپۆرتاج', 2, 'Sportage 2018-2022', 'BD-KI-51712', '8934500202', 8, 32000, 48000, 21.50, 32.00, 4, 'B-02-02', 'دیسکی پۆڵا بەهێزکراو'),
  (7, 'پەدی بریکی دواوە هیۆندای ئەکسێنت', 2, 'Accent 2017-2023', 'BP-HY-58302', '8934500203', 0, 14000, 22000, 9.50, 15.00, 6, 'B-02-03', 'پەدی تێرمی دواوە - سفر دانە ماوە'),
  (8, 'ڕۆنی بریک DOT4 بۆش ئەڵمانی', 2, 'Universal (گشتی)', 'BF-BS-004', '8934500204', 35, 5000, 8000, 3.50, 5.50, 10, 'B-02-04', 'قوتوی 1 لیتری پلەی یەک'),

  -- بزوێنەر و مەکینە
  (9, 'سپارک پلەگ (پلاک) لیزەری NGK', 3, 'Toyota / Nissan 4-Cyl', 'SP-NGK-6994', '8934500301', 80, 4000, 7000, 2.75, 4.75, 20, 'C-03-01', 'پلاکی ئیریدیۆم تەمەن درێژ'),
  (10, 'قایشی تایمینگ ئۆپترا و ئاڤیۆ', 3, 'Optra / Aveo 1.6', 'TB-GM-96814', '8934500302', 2, 18000, 28000, 12.00, 19.00, 5, 'C-03-02', 'قایشی سەرەکی مەکینە گەیتس ئەسڵی - کەمە'),
  (11, 'پەمپی بەنزینی ناو تانکی کامری', 3, 'Camry / Avalon 2012-2017', 'FP-TY-23220', '8934500303', 0, 45000, 65000, 30.00, 44.00, 3, 'C-03-03', 'پەمپی بەنزین تەواو ئەسڵی - نەماوە'),
  (12, 'وەتەر پەمپ نیسان ئاڵتیما', 3, 'Altima 2.5L 2013-2019', 'WP-NS-21010', '8934500304', 5, 28000, 42000, 19.00, 28.50, 3, 'C-03-04', 'وەتەرپەمپی ئاو مەکینە'),

  -- سەسپانسیۆن و جامپەر
  (13, 'دەبڵ و جامپەری پێشەوە هیۆندای ئیلانترا', 4, 'Elantra 2016-2020', 'SH-HY-54651', '8934500401', 1, 42000, 60000, 28.00, 40.00, 4, 'D-04-01', 'تەنها 1 دانە ماوە لە مەخزەن - ئاگاداری!'),
  (14, 'بۆڵبرینی ویلی پێشەوە تۆیۆتا یارس', 4, 'Yaris 2015-2021', 'WB-TY-43560', '8934500402', 12, 16000, 25000, 11.00, 17.00, 4, 'D-04-02', 'بۆڵبرینی ژاپۆنی کۆیۆ'),
  (15, 'بۆشەکانی ئەکسل و جۆینت تۆیۆتا', 4, 'Corolla / RAV4', 'BS-TY-48654', '8934500403', 24, 6000, 10000, 4.00, 7.00, 8, 'D-04-03', 'لاستیکی قۆڵەکانی ئەکسل'),

  -- کارەبایی و باتری
  (16, 'باتری ڤارتا 70 ئەمپێر ئەڵمانی', 5, 'European / Asian Standard', 'BT-VR-70AH', '8934500501', 7, 95000, 125000, 64.00, 84.00, 5, 'E-05-01', 'باتری گەرەنتی ١ ساڵ'),
  (17, 'دینەمۆی شەحن تۆیۆتا هایلوکس', 5, 'Hilux D-4D / 2.7', 'AL-TY-27060', '8934500502', 0, 110000, 155000, 75.00, 105.00, 2, 'E-05-02', 'دینەمۆی گەورە - نەماوە لە مەخزەن'),
  (18, 'لایتی پێشەوە LED تۆیۆتا پرادۆ', 5, 'Prado 2018-2022', 'HL-PR-81110', '8934500503', 4, 180000, 240000, 122.00, 162.00, 2, 'E-05-03', 'جووت لایتی ئەسڵی زینۆن'),

  -- سێرڤس و زەیت
  (19, 'زەیتی مەکینە مۆبیڵ وەن 5W30', 6, 'Universal Synthetic', 'OL-MB-5W30', '8934500601', 45, 14000, 20000, 9.50, 13.50, 15, 'F-06-01', 'قوتوی 1 لیتری فول سینتەتیک'),
  (20, 'زەیتی گێڕ تۆیۆتا WS ئەسڵی', 6, 'Toyota Automatic Transmission', 'TF-TY-08886', '8934500602', 3, 17000, 26000, 11.50, 17.50, 10, 'F-06-02', 'ڕۆنی گێڕی تۆیۆتا - زۆر کەم ماوە!'),

  -- گێڕ و کلەچ
  (21, 'کلەچ کیت (دیسک و پلێت) نیسان پیکاب', 7, 'Nissan Pickup D22', 'CK-NS-30001', '8934500701', 2, 85000, 120000, 58.00, 81.00, 3, 'G-07-01', 'کیتێکی تەواو ڤالیۆ فەرەنسی - لە کەمی دایە'),
  (22, 'فلایویل تۆیۆتا هایس گاز', 7, 'Hiace 2KD Engine', 'FW-TY-13405', '8934500702', 0, 135000, 180000, 92.00, 122.00, 2, 'G-07-02', 'فلایویلی مەکینە - تەواوبووە'),

  -- ساردکەرەوە و ڕادیاتۆر
  (23, 'ڕادیاتۆری ئاو تۆیۆتا کامری', 8, 'Camry 2.5 2018-2023', 'RD-TY-16400', '8934500801', 6, 65000, 92000, 44.00, 62.00, 3, 'H-08-01', 'ڕادیاتۆری ئەلەمنیۆم دوو لولە'),
  (24, 'تێرمۆستات مەکینە هیۆندای سۆناتا', 8, 'Sonata / Optima 2.4', 'TH-HY-25500', '8934500802', 15, 8000, 13000, 5.50, 9.00, 5, 'H-08-02', 'تێرمۆستاتی پلەی 82C')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ---------------------
-- بەکارهێنەران (Users & Authentication)
-- ---------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ئەدمینی بنەڕەتی (username: admin, password: 1234)
-- Hash for '1234' with bcrypt
INSERT INTO users (id, username, password_hash, full_name, role) VALUES
  (1, 'admin', '$2a$10$wN9a3qY/98Qv7gNqXgXJveo4/uC2q40Fj0d6L1yFh4G7Q8yv4cOvy', 'ئەدمینی سەرەکی', 'admin')
ON DUPLICATE KEY UPDATE username=VALUES(username);

