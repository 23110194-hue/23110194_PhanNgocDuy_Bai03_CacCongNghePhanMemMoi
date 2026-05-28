require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/user');
const Shop = require('./src/models/shop');
const Product = require('./src/models/product');
const Order = require('./src/models/order');
const ProductReview = require('./src/models/productReview');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_URL);
        console.log('✅ Connected to MongoDB');

        // 1. Create Users (Admin, Manager, Vendor, User)
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash('123456', salt);

        const usersData = [
            { email: 'admin@gmail.com', name: 'Admin Toàn Năng', role: 'admin', password: hashPassword, isActive: true },
            { email: 'manager@gmail.com', name: 'Quản lý Duy', role: 'manager', password: hashPassword, isActive: true },
            { email: 'vendor@gmail.com', name: 'Chủ Shop VIP', role: 'vendor', password: hashPassword, isActive: true },
            { email: 'vendor2@gmail.com', name: 'Shop Tiểu Thuyết', role: 'vendor', password: hashPassword, isActive: true },
            { email: 'user@gmail.com', name: 'Khách hàng VIP', role: 'user', password: hashPassword, isActive: true },
        ];

        const users = {};
        for (const u of usersData) {
            let user = await User.findOne({ email: u.email });
            if (!user) {
                user = await User.create(u);
            } else {
                user.name = u.name;
                user.role = u.role;
                user.password = u.password;
                await user.save();
            }
            users[u.email] = user; // Use email as key since we have 2 vendors now
        }
        console.log('✅ Seeded Users');

        // 2. Create Shop for Vendor 1
        let shop = await Shop.findOne({ ownerEmail: users['vendor@gmail.com'].email });
        if (!shop) {
            shop = await Shop.create({
                ownerId: users['vendor@gmail.com']._id,
                ownerEmail: users['vendor@gmail.com'].email,
                name: 'Nhà Sách Trí Tuệ',
                slug: 'nha-sach-tri-tue',
                description: 'Chuyên cung cấp các loại sách bản quyền chất lượng cao.',
                address: '123 Đường Sách, TP.HCM',
                phone: '0123456789',
                isActive: true,
            });
        }
        
        // Create Shop for Vendor 2
        let shop2 = await Shop.findOne({ ownerEmail: users['vendor2@gmail.com'].email });
        if (!shop2) {
            shop2 = await Shop.create({
                ownerId: users['vendor2@gmail.com']._id,
                ownerEmail: users['vendor2@gmail.com'].email,
                name: 'Tiệm Sách Hoa Hồng',
                slug: 'tiem-sach-hoa-hong',
                description: 'Cửa hàng chuyên tiểu thuyết lãng mạn và truyện tranh.',
                address: '456 Đường Hoa Hồng, Hà Nội',
                phone: '0987654321',
                isActive: true,
            });
        }
        console.log('✅ Seeded Shops');

        // 3. Create Products for Shops
        const productsData = [
            {
                id: 101, slug: 'dac-nhan-tam', title: 'Đắc Nhân Tâm - Dale Carnegie', author: 'Dale Carnegie',
                category: 'Kỹ Năng Sống', price: 85000, discountPercent: 15, stock: 100, sold: 12, views: 230,
                description: 'Cuốn sách nổi tiếng nhất thế giới về nghệ thuật giao tiếp và thu phục lòng người.',
                images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80'],
                shopId: shop._id, isActive: true, isHot: true
            },
            {
                id: 102, slug: 'nha-gia-kim', title: 'Nhà Giả Kim - Paulo Coelho', author: 'Paulo Coelho',
                category: 'Tiểu Thuyết', price: 79000, discountPercent: 10, stock: 50, sold: 8, views: 150,
                description: 'Hành trình theo đuổi giấc mơ và lắng nghe trái tim của cậu bé chăn cừu Santiago.',
                images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'],
                shopId: shop._id, isActive: true
            },
            {
                id: 103, slug: 'tuoi-tre-dang-gia-bao-nhieu', title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', author: 'Rosie Nguyễn',
                category: 'Kỹ Năng Sống', price: 90000, discountPercent: 20, stock: 30, sold: 45, views: 500,
                description: 'Cuốn sách truyền cảm hứng mãnh liệt cho giới trẻ Việt Nam.',
                images: ['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80'],
                shopId: shop._id, isActive: true, isHot: true
            },
            {
                id: 104, slug: 'harry-potter', title: 'Harry Potter và Hòn Đá Phù Thủy', author: 'J.K. Rowling',
                category: 'Tiểu Thuyết', price: 150000, discountPercent: 5, stock: 80, sold: 20, views: 600,
                description: 'Tập đầu tiên trong series phép thuật huyền thoại.',
                images: ['https://images.unsplash.com/photo-1618666012174-83b441c0bc76?auto=format&fit=crop&w=800&q=80'],
                shopId: shop2._id, isActive: true, isHot: true
            },
            {
                id: 105, slug: 'hoang-tu-be', title: 'Hoàng Tử Bé', author: 'Antoine de Saint-Exupéry',
                category: 'Thiếu Nhi', price: 65000, discountPercent: 0, stock: 40, sold: 30, views: 100,
                description: 'Câu chuyện triết lý nhẹ nhàng sâu lắng.',
                images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80'],
                shopId: shop2._id, isActive: true
            }
        ];

        const insertedProducts = [];
        for (const p of productsData) {
            const prod = await Product.findOneAndUpdate(
                { slug: p.slug },
                { $set: p },
                { new: true, upsert: true }
            );
            insertedProducts.push(prod);
        }
        console.log('✅ Seeded Products');

        // 4. Create an Order from User to Vendor
        const orderData = {
            orderNumber: 'OD' + Date.now(),
            userId: users['user@gmail.com']._id,
            userEmail: users['user@gmail.com'].email,
            userName: users['user@gmail.com'].name,
            shopId: shop._id,
            shopName: shop.name,
            items: [
                {
                    productId: insertedProducts[0].id,
                    title: insertedProducts[0].title,
                    image: insertedProducts[0].images[0],
                    slug: insertedProducts[0].slug,
                    quantity: 2,
                    price: 85000,
                    finalPrice: 85000,
                    lineTotal: 170000,
                    shopId: shop._id
                },
                {
                    productId: insertedProducts[1].id,
                    title: insertedProducts[1].title,
                    image: insertedProducts[1].images[0],
                    slug: insertedProducts[1].slug,
                    quantity: 1,
                    price: 79000,
                    finalPrice: 79000,
                    lineTotal: 79000,
                    shopId: shop._id
                }
            ],
            summary: {
                totalQuantity: 3,
                subtotal: 249000,
                shippingFee: 20000,
                total: 269000
            },
            shippingAddress: {
                fullName: 'Khách hàng VIP',
                phone: '0987654321',
                addressLine: '456 Đường ABC, Quận 1, TP.HCM'
            },
            paymentMethod: 'COD',
            isPaid: false,
            status: 'NEW',
        };

        const existingOrder = await Order.findOne({ userId: users['user@gmail.com']._id, status: 'NEW' });
        if (!existingOrder) {
            await Order.create(orderData);
            console.log('✅ Seeded Orders');
        }

        console.log('🎉 Xong! Dữ liệu mẫu (Real Data) đã được đổ thành công vào Database.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedDatabase();
