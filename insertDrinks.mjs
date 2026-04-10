import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXH7N7_O-a6gBSiGmaDMDTTHEIWgo0o3E",
  authDomain: "app-order-79cb0.firebaseapp.com",
  databaseURL: "https://app-order-79cb0-default-rtdb.firebaseio.com",
  projectId: "app-order-79cb0",
  storageBucket: "app-order-79cb0.firebasestorage.app",
  messagingSenderId: "518885324251",
  appId: "1:518885324251:web:f1cb5dbdcafc89a2cf63fe",
  measurementId: "G-7ZSZ9GGQ0H"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CATS = {
  TRA_SUA: "GtSumfWK4zBUyLRz3bmV",
  TRA_TRAI_CAY: "i5RGBy7SR77Ln5pG49fq",
  CA_PHE: "SOf2Tru8ELA2DbTNrTp7",
  DA_XAY: "oevWkygBcoGtqTWgFhSz",
  SODA: "LjwJnQ3UWPhUqjFwnJqH"
};

const products = [
  // Trà sữa
  {
    name: "Trà Sữa Trân Châu Đường Đen",
    price: 35000, priceOld: 45000, category: CATS.TRA_SUA,
    description: "Trà sữa đậm vị thanh mát kết hợp trân châu đen dai giòn, áo lấp lánh nước đường đen nguyên chất cực cuốn.",
    image: "https://images.unsplash.com/photo-1558857563-b37102e997a3?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Trà Sữa Khoai Môn",
    price: 40000, priceOld: 48000, category: CATS.TRA_SUA,
    description: "Hương vị khoai môn thơm béo đặc trưng nồng nàn pha lẫn sữa tươi thanh ngọt.",
    image: "https://plus.unsplash.com/premium_photo-1669203649514-4fb48642a8b3?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Trà Sữa Oolong Lài Kem Phô Mai",
    price: 55000, priceOld: 65000, category: CATS.TRA_SUA,
    description: "Đỉnh cao trà Oolong thượng hạng quyện lớp Macchiato mặn bồng bềnh cực đỉnh.",
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Trà Sữa Lài Món Quà",
    price: 30000, priceOld: 35000, category: CATS.TRA_SUA,
    description: "Vị lài dễ uống, giải khát cực nhanh dành cho mùa hè oi ả.",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Trà Sữa Gạo Rang Macchiato",
    price: 49000, priceOld: null, category: CATS.TRA_SUA,
    description: "Hương gạo rang Genmaicha độc đáo siêu thực.",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800"
  },

  // Trà Trái Cây
  {
    name: "Trà Đào Cam Sả",
    price: 45000, priceOld: null, category: CATS.TRA_TRAI_CAY,
    description: "Huyền thoại thanh lọc cơ thể với sả gừng cam đào chua ngọt.",
    image: "https://images.unsplash.com/photo-1623065422900-05041a8b1ef2?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Trà Dâu Cam Chanh Tươi",
    price: 48000, priceOld: 55000, category: CATS.TRA_TRAI_CAY,
    description: "Đằm thắm vị ngọt của dâu tây nguyên bản xay dập.",
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Trà Ổi Hồng Muối Ớt",
    price: 52000, priceOld: null, category: CATS.TRA_TRAI_CAY,
    description: "Lạ miệng và kích thích vị giác với ổi hồng tươi và mép cốc muối ớt cay nhẹ.",
    image: "https://images.unsplash.com/photo-1605386175727-8a62319f3e46?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Hồng Trà Vải Tứ Quý",
    price: 42000, priceOld: 50000, category: CATS.TRA_TRAI_CAY,
    description: "Hồng trà nguyên bản phối quả vải ngâm giòn sựt sựt.",
    image: "https://images.unsplash.com/photo-1613204780521-ea1c6db9756b?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Trà Xoài Cốt Dừa Đá Tuyết",
    price: 60000, priceOld: 69000, category: CATS.TRA_TRAI_CAY,
    description: "Thịt xoài tươi chín mọng xay lẫn đá cùng nước cốt dừa chuẩn vị nhiệt đới Thái Lan.",
    image: "https://plus.unsplash.com/premium_photo-1675253503565-df04e4c2dd89?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Lục Trà Dưa Lưới Nha Đam",
    price: 40000, priceOld: null, category: CATS.TRA_TRAI_CAY,
    description: "Mát lạnh sảng khoái vào những giờ trưa oi ả.",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=800"
  },

  // Cà phê
  {
    name: "Cà Phê Muối Nhĩ Trứ Danh",
    price: 35000, priceOld: null, category: CATS.CA_PHE,
    description: "Best seller top 1 với lớp bọt kem muối biển mặn beo béo hòa vị đắng cafe robusta Đà Lạt.",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Bạc Xỉu Sài Gòn 3 Lớp",
    price: 29000, priceOld: 39000, category: CATS.CA_PHE,
    description: "Sữa đặc nhiều, cafe ít dành cho hệ lãng mạn.",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Phin Cà Phê Đen Đá",
    price: 25000, priceOld: null, category: CATS.CA_PHE,
    description: "Nguyên chất, mạnh mẽ bật tung gốc rễ cơn buồn ngủ buổi sáng.",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Espresso Latte Đá Thường",
    price: 45000, priceOld: null, category: CATS.CA_PHE,
    description: "Đánh từ xưởng pha máy tiêu chuẩn Italia.",
    image: "https://images.unsplash.com/photo-1507133750070-4402871dc9fb?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Cold Brew Tảng Cam",
    price: 55000, priceOld: 60000, category: CATS.CA_PHE,
    description: "Cà phê ủ lạnh thanh chua siêu nghệ mượt nhe kết hợp cam vàng sấy khô.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800"
  },

  // Đá Xay
  {
    name: "Milo Đá Xay Khủng Long",
    price: 45000, priceOld: 55000, category: CATS.DA_XAY,
    description: "Trở về tuổi thơ với hương vị choco lúa mạch phủ bột núi non trập trùng.",
    image: "https://images.unsplash.com/photo-1570881512192-3bcfa3b3dfa8?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Đá Xay Cacao Hạnh Nhân",
    price: 55000, priceOld: null, category: CATS.DA_XAY,
    description: "Cacao nguyên chất xay quyện đá và điểm topping hạt hạnh nhân cực ghiền.",
    image: "https://images.unsplash.com/photo-1550450339-e7a4787a2074?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Matcha Đá Xay Hokkaido",
    price: 65000, priceOld: 75000, category: CATS.DA_XAY,
    description: "Bột trà xanh tinh khiết cực phẩm phủ kem tươi mịn màng tan nhanh trong miệng.",
    image: "https://images.unsplash.com/photo-1582785513753-4ba61c77bb50?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Oreo Xay Phô Mai Nguyệt Thực",
    price: 48000, priceOld: null, category: CATS.DA_XAY,
    description: "Bánh bông lan Oreo rộp rộp xay nhuyễn cùng cream cheese thần thánh.",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75bb811?auto=format&fit=crop&q=80&w=800"
  },
  
  // Soda
  {
    name: "Soda Vải Nhiệt Đới",
    price: 35000, priceOld: null, category: CATS.SODA,
    description: "Giải nhiệt đỉnh cao với vị soda nhạt sảng khoái và vải thiều.",
    image: "https://plus.unsplash.com/premium_photo-1661605333621-e0e64ac36da1?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Blue Ocean Tiên Cá (Soda Xanh)",
    price: 49000, priceOld: 55000, category: CATS.SODA,
    description: "Trái curacao pha pha cùng sprite lấp lánh như nước biển sóng vỗ.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Mojito Bạc Hà Truyền Thống",
    price: 39000, priceOld: null, category: CATS.SODA,
    description: "Quyến rũ và không cầu kỳ. Chanh Bạc Hà quậy bung nắp.",
    image: "https://images.unsplash.com/photo-1601633535976-1f7c32b5f6cd?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Pink Sunset Soda (Soda Dâu Lựu)",
    price: 42000, priceOld: 48000, category: CATS.SODA,
    description: "Chua thanh cực bắt vị dâu và hạt đỏ ngọc lựu lung linh hoàng hôn.",
    image: "https://images.unsplash.com/photo-1587310557434-d130a00df81e?auto=format&fit=crop&q=80&w=800"
  }
];

async function seedData() {
  const productsRef = collection(db, "products");
  let totalCount = 0;
  for (const item of products) {
    const docRef = await addDoc(productsRef, {
      name: item.name,
      price: item.price,
      priceOld: item.priceOld,
      description: item.description,
      image: item.image,
      outOfStock: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      category: doc(db, "categories", item.category)
    });
    // Thêm trường id
    await updateDoc(docRef, { id: docRef.id });
    totalCount++;
    console.log(`Tiêm thành công: ${item.name}`);
  }
  
  console.log(`ĐÃ HOÀN TẤT THÊM ${totalCount} MÓN VÀO DATABASE!`);
  process.exit(0);
}

seedData().catch(e => console.error(e));
