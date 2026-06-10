DROP DATABASE IF EXISTS import_tax_db;

CREATE DATABASE import_tax_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE import_tax_db;

CREATE TABLE category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    storage_type VARCHAR(50),
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE hs_code (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category_name VARCHAR(100),
    duty_rate DECIMAL(5,2),
    vat_rate DECIMAL(5,2),
    description VARCHAR(255),
    keywords VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE product (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category_id BIGINT NOT NULL,
    hs_code_id BIGINT NOT NULL,
    origin_country VARCHAR(10) NOT NULL DEFAULT 'JP',
    unit VARCHAR(20),
    unit_price DECIMAL(15,2) NOT NULL,
    stock_qty INT DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id)
        REFERENCES category(id),

    CONSTRAINT fk_product_hs_code
        FOREIGN KEY (hs_code_id)
        REFERENCES hs_code(id)
);

CREATE TABLE import_tax_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    import_country VARCHAR(10) NOT NULL DEFAULT 'TW',
    origin_country VARCHAR(10) NOT NULL DEFAULT 'JP',
    hs_code_id BIGINT NOT NULL,
    duty_rate DECIMAL(5,2) NOT NULL,
    vat_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    effective_from DATE,
    effective_to DATE,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tax_rule_hs_code
        FOREIGN KEY (hs_code_id)
        REFERENCES hs_code(id)
);

CREATE TABLE purchase_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    supplier_name VARCHAR(100),
    import_country VARCHAR(10) DEFAULT 'TW',
    origin_country VARCHAR(10) DEFAULT 'JP',
    currency_code VARCHAR(10) DEFAULT 'TWD',
    exchange_rate DECIMAL(12,6) DEFAULT 1.000000,
    subtotal DECIMAL(15,2),
    duty_total DECIMAL(15,2),
    vat_total DECIMAL(15,2),
    landed_cost_total DECIMAL(15,2),
    status VARCHAR(30) DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE purchase_order_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    purchase_order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(100),
    quantity INT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2),
    duty_rate DECIMAL(5,2),
    duty_amount DECIMAL(15,2),
    vat_rate DECIMAL(5,2),
    vat_amount DECIMAL(15,2),
    landed_cost DECIMAL(15,2),

    CONSTRAINT fk_purchase_order_item_order
        FOREIGN KEY (purchase_order_id)
        REFERENCES purchase_order(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_purchase_order_item_product
        FOREIGN KEY (product_id)
        REFERENCES product(id)
);

INSERT INTO category(code, name, storage_type, description)
VALUES
('DRY_GOODS', '乾貨', '常溫', '常溫保存，適合咖啡、米、麵、茶粉'),
('FRESH', '生鮮', '冷藏', '需冷藏保存，效期較短'),
('FROZEN', '冷凍', '冷凍', '需冷凍保存，適合冷凍海鮮'),
('MEAT', '肉品', '冷藏 / 冷凍', '肉類商品'),
('SEAFOOD', '海鮮', '冷藏 / 冷凍', '水產與海鮮商品'),
('SEASONING', '調味品', '常溫', '調味料、醬料與日式料理用調味品'),
('DAIRY', '冷藏', '冷藏', '乳製品與需冷藏食品');

INSERT INTO hs_code
(code, name, category_name, duty_rate, vat_rate, description, keywords)
VALUES
('0901.11.0000', '咖啡豆', '乾貨', 5.00, 5.00, '未焙炒咖啡，未除咖啡因，日本咖啡豆', '咖啡|咖啡豆|日本咖啡|coffee|bean'),
('0901.21.0000', '焙炒咖啡豆', '乾貨', 5.00, 5.00, '已焙炒咖啡，未除咖啡因', '焙炒咖啡|咖啡豆|咖啡|coffee|roasted'),
('0902.10.0000', '綠茶', '乾貨', 6.00, 5.00, '綠茶，茶葉，日本茶', '綠茶|茶葉|日本茶|tea|green tea'),
('0902.20.0000', '抹茶粉', '乾貨', 6.00, 5.00, '抹茶粉，綠茶粉，日本抹茶', '抹茶|抹茶粉|綠茶粉|matcha|tea'),
('1006.30.0000', '白米', '乾貨', 8.00, 5.00, '精米，白米，日本白米', '白米|米|日本米|rice'),
('1902.30.0000', '即食麵', '乾貨', 12.00, 5.00, '即食麵，拉麵，泡麵，麵條', '拉麵|泡麵|即食麵|麵條|ramen|noodle'),
('0201.30.0000', '和牛', '肉品', 15.00, 5.00, '冷藏或冷凍牛肉，日本牛肉', '和牛|牛肉|日本牛肉|beef|wagyu'),
('0302.14.0000', '鮭魚', '海鮮', 10.00, 5.00, '新鮮或冷藏鮭魚', '鮭魚|生鮭魚|salmon'),
('0306.17.0000', '冷凍蝦', '冷凍', 8.00, 5.00, '冷凍蝦，蝦類產品', '蝦|冷凍蝦|shrimp'),
('0702.00.0000', '番茄', '生鮮', 3.00, 5.00, '新鮮或冷藏番茄', '番茄|蕃茄|tomato'),
('2103.10.0000', '醬油', '調味品', 7.00, 5.00, '醬油，調味醬料', '醬油|調味料|soy sauce'),
('2103.90.0000', '味噌', '調味品', 7.00, 5.00, '味噌，發酵調味品', '味噌|日本味噌|miso'),
('1902.19.0000', '烏龍麵', '乾貨', 12.00, 5.00, '未調製麵條，烏龍麵，日本麵條', '烏龍麵|麵條|日本麵|udon|noodle'),
('1902.19.1000', '蕎麥麵', '乾貨', 12.00, 5.00, '蕎麥麵，乾麵，日本蕎麥麵', '蕎麥麵|乾麵|日本麵|soba|noodle'),
('1905.31.0000', '餅乾', '乾貨', 10.00, 5.00, '甜餅乾，烘焙餅乾，包裝食品', '餅乾|甜餅乾|零食|biscuit|cookie'),
('1806.32.0000', '巧克力', '乾貨', 10.00, 5.00, '巧克力製品，塊狀巧克力，包裝食品', '巧克力|可可|chocolate|cocoa'),
('1704.90.0000', '糖果', '乾貨', 10.00, 5.00, '糖果，甜食，非巧克力糖果', '糖果|甜食|candy|sweet'),
('0406.10.0000', '起司', '冷藏', 8.00, 5.00, '新鮮起司，乳製品', '起司|乳酪|起士|cheese'),
('0401.20.0000', '牛奶', '冷藏', 8.00, 5.00, '牛乳，鮮奶，乳製品', '牛奶|鮮奶|乳製品|milk'),
('0405.10.0000', '奶油', '冷藏', 8.00, 5.00, '奶油，乳脂製品', '奶油|乳脂|butter'),
('0808.10.0000', '蘋果', '生鮮', 5.00, 5.00, '新鮮蘋果，水果', '蘋果|水果|apple'),
('0810.10.0000', '草莓', '生鮮', 5.00, 5.00, '新鮮草莓，水果', '草莓|水果|strawberry'),
('1212.21.0000', '海苔', '乾貨', 6.00, 5.00, '食用海藻，海苔，乾燥海藻', '海苔|海藻|紫菜|nori|seaweed'),
('1212.21.1000', '昆布', '乾貨', 6.00, 5.00, '食用海藻，昆布，乾燥海帶', '昆布|海帶|海藻|kombu|kelp'),
('1604.20.0000', '柴魚片', '乾貨', 10.00, 5.00, '魚類調製品，柴魚片，調味用乾貨', '柴魚片|柴魚|鰹魚|bonito|katsuobushi'),
('2103.90.1000', '味醂風調味料', '調味品', 7.00, 5.00, '日式調味料，味醂風調味品，料理用調味液', '味醂|味霖|調味料|mirin|seasoning'),
('2103.90.2000', '咖哩塊', '調味品', 7.00, 5.00, '咖哩塊，咖哩調味料，日式咖哩', '咖哩|咖哩塊|日式咖哩|curry');

INSERT INTO product
(name, category_id, hs_code_id, origin_country, unit, unit_price, stock_qty)
VALUES
('日本咖啡豆', 1, 1, 'JP', 'kg', 500.00, 100),
('日本白米', 1, 5, 'JP', 'kg', 120.00, 200),
('日本即食拉麵', 1, 6, 'JP', '箱', 1200.00, 50),
('日本抹茶粉', 1, 4, 'JP', 'kg', 800.00, 80),
('日本和牛', 4, 7, 'JP', 'kg', 2500.00, 30),
('日本鮭魚', 5, 8, 'JP', 'kg', 900.00, 60),
('日本冷凍蝦', 3, 9, 'JP', 'kg', 650.00, 70),
('日本番茄', 2, 10, 'JP', 'kg', 180.00, 150),
('日本即食拉麵', 1, 6, 'JP', '箱', 1200.00, 5);

INSERT INTO import_tax_rule
(import_country, origin_country, hs_code_id, duty_rate, vat_rate, effective_from, effective_to)
SELECT
    'TW',
    'JP',
    id,
    duty_rate,
    vat_rate,
    '2024-01-01',
    '2099-12-31'
FROM hs_code;

INSERT INTO purchase_order
(
    order_no,
    supplier_name,
    import_country,
    origin_country,
    currency_code,
    exchange_rate,
    subtotal,
    duty_total,
    vat_total,
    landed_cost_total,
    status,
    created_at
)
VALUES
(
    'PO202505190001',
    'Japan Foods Supplier',
    'TW',
    'JP',
    'TWD',
    1.000000,
    7400.00,
    538.00,
    396.90,
    8334.90,
    'CONFIRMED',
    '2026-06-03 11:02:48'
);

INSERT INTO purchase_order_item
(
    purchase_order_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    subtotal,
    duty_rate,
    duty_amount,
    vat_rate,
    vat_amount,
    landed_cost
)
VALUES
(1, 1, '日本咖啡豆', 10, 500.00, 5000.00, 5.00, 250.00, 5.00, 262.50, 5512.50),
(1, 3, '日本即食拉麵', 2, 1200.00, 2400.00, 12.00, 288.00, 5.00, 134.40, 2822.40);

SELECT
    p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    h.code AS hs_code,
    h.name AS hs_name,
    r.duty_rate,
    r.vat_rate,
    p.unit,
    p.unit_price,
    p.stock_qty
FROM product p
JOIN category c ON p.category_id = c.id
JOIN hs_code h ON p.hs_code_id = h.id
JOIN import_tax_rule r ON p.hs_code_id = r.hs_code_id
ORDER BY p.id;

SELECT
    po.id,
    po.order_no,
    po.supplier_name,
    po.subtotal,
    po.duty_total,
    po.vat_total,
    po.landed_cost_total,
    po.status,
    po.created_at
FROM purchase_order po
ORDER BY po.created_at DESC;

SELECT
    poi.id,
    po.order_no,
    poi.product_name,
    poi.quantity,
    poi.unit_price,
    poi.subtotal,
    poi.duty_amount,
    poi.vat_amount,
    poi.landed_cost
FROM purchase_order_item poi
JOIN purchase_order po ON poi.purchase_order_id = po.id
ORDER BY poi.id;
