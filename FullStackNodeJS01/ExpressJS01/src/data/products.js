const products = [
    {
        id: 1,
        slug: "tu-duy-nhanh-cham",
        title: "Tư duy nhanh và chậm",
        author: "Daniel Kahneman",
        category: "Kỹ năng",
        price: 220000,
        discountPercent: 15,
        isNew: false,
        isHot: true,
        stock: 24,
        sold: 380,
        publishedAt: "2022-07-10",
        description: "Cuốn sách kinh điển về tâm lý hành vi và ra quyết định.",
        images: [
            "https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80"
        ],
        tags: ["tâm lý", "tư duy"]
    },
    {
        id: 2,
        slug: "nha-gia-kim",
        title: "Nhà giả kim",
        author: "Paulo Coelho",
        category: "Tiểu thuyết",
        price: 120000,
        discountPercent: 20,
        isNew: false,
        isHot: true,
        stock: 80,
        sold: 920,
        publishedAt: "2019-05-18",
        description: "Hành trình tìm kho báu và ý nghĩa cuộc sống.",
        images: [
            "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
        ],
        tags: ["tiểu thuyết", "truyền cảm hứng"]
    },
    {
        id: 3,
        slug: "tu-duy-lai-va-lam",
        title: "Tư duy lại và làm",
        author: "Adam Grant",
        category: "Kỹ năng",
        price: 180000,
        discountPercent: 10,
        isNew: true,
        isHot: false,
        stock: 35,
        sold: 210,
        publishedAt: "2024-01-20",
        description: "Tư duy linh hoạt để thích nghi và bứt phá.",
        images: [
            "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80"
        ],
        tags: ["kỹ năng", "phát triển bản thân"]
    },
    {
        id: 4,
        slug: "chien-luoc-dai-duong-xanh",
        title: "Chiến lược đại dương xanh",
        author: "W. Chan Kim",
        category: "Kinh doanh",
        price: 260000,
        discountPercent: 5,
        isNew: false,
        isHot: true,
        stock: 12,
        sold: 480,
        publishedAt: "2021-09-12",
        description: "Tạo ra không gian thị trường mới và lợi thế cạnh tranh.",
        images: [
            "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=900&q=80"
        ],
        tags: ["kinh doanh", "chiến lược"]
    },
    {
        id: 5,
        slug: "nha-lanh-dao-khong-chuc-danh",
        title: "Nhà lãnh đạo không chức danh",
        author: "Robin Sharma",
        category: "Kỹ năng",
        price: 170000,
        discountPercent: 0,
        isNew: true,
        isHot: false,
        stock: 50,
        sold: 160,
        publishedAt: "2024-03-05",
        description: "Lan tỏa giá trị và dẫn dắt từ chính mình.",
        images: [
            "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80"
        ],
        tags: ["lãnh đạo", "kỹ năng"]
    },
    {
        id: 6,
        slug: "toi-tu-hoc",
        title: "Tôi tự học",
        author: "Le Nhat Tuan",
        category: "Giáo dục",
        price: 95000,
        discountPercent: 25,
        isNew: false,
        isHot: true,
        stock: 90,
        sold: 640,
        publishedAt: "2020-11-01",
        description: "Phương pháp học tập chủ động và bền vững.",
        images: [
            "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1473862177705-1e63f3f77b2d?auto=format&fit=crop&w=900&q=80"
        ],
        tags: ["giáo dục", "tự học"]
    },
    {
        id: 7,
        slug: "ky-nang-giup-ban-tro-nen-uu-tu",
        title: "Kỹ năng giúp bạn trở nên ưu tú",
        author: "Brian Tracy",
        category: "Kỹ năng",
        price: 145000,
        discountPercent: 10,
        isNew: false,
        isHot: false,
        stock: 8,
        sold: 120,
        publishedAt: "2023-06-15",
        description: "Rèn luyện kỹ năng cốt lõi để thăng tiến.",
        images: [
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1491841651911-c44c30c34548?auto=format&fit=crop&w=900&q=80"
        ],
        tags: ["kỹ năng", "phát triển nghề nghiệp"]
    },
    {
        id: 8,
        slug: "doraemon-truyen-dai",
        title: "Doraemon truyện dài tập 1",
        author: "Fujiko F. Fujio",
        category: "Thiếu nhi",
        price: 45000,
        discountPercent: 0,
        isNew: true,
        isHot: true,
        stock: 150,
        sold: 1100,
        publishedAt: "2024-02-10",
        description: "Cuộc phiêu lưu vui nhộn dành cho thiếu nhi.",
        images: [
            "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&w=900&q=80"
        ],
        tags: ["thiếu nhi", "truyện tranh"]
    },
    {
        id: 9,
        slug: "doi-ngan-dung-ngu-dai",
        title: "Đời ngắn đừng ngủ dài",
        author: "Robin Sharma",
        category: "Kỹ năng",
        price: 160000,
        discountPercent: 30,
        isNew: false,
        isHot: true,
        stock: 28,
        sold: 520,
        publishedAt: "2020-08-22",
        description: "Quản lý thời gian và năng suất hiệu quả.",
        images: [
            "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1491841651911-c44c30c34548?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80"
        ],
        tags: ["thời gian", "kỹ năng"]
    },
    {
        id: 10,
        slug: "khach-hang-la-trong-tam",
        title: "Khách hàng là trọng tâm",
        author: "Ken Blanchard",
        category: "Kinh doanh",
        price: 200000,
        discountPercent: 12,
        isNew: true,
        isHot: false,
        stock: 16,
        sold: 140,
        publishedAt: "2024-04-12",
        description: "Xây dựng văn hóa dịch vụ lấy khách hàng làm trung tâm.",
        images: [
            "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=900&q=80",
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80"
        ],
        tags: ["kinh doanh", "dịch vụ"]
    }
];

module.exports = { products };
