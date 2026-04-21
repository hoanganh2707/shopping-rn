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
  // Trà sữa (15 items)
  { name: "Trà Sữa Khoai Môn Hoàng Gia", price: 45000, priceOld: 55000, category: CATS.TRA_SUA, description: "Hương vị khoai môn thơm béo, quyện cùng trà sữa đậm đà và trân châu trắng dai giòn.", image: "https://images.unsplash.com/photo-1558857563-b37102e997a3?w=800" },
  { name: "Trà Sữa Socola Cookie", price: 48000, priceOld: 60000, category: CATS.TRA_SUA, description: "Vị socola đậm đà kết hợp vụn bánh cookie giòn rụm, món quà cho tín đồ đồ ngọt.", image: "https://images.unsplash.com/photo-1572490122747-3968b75bb811?w=800" },
  { name: "Trà Sữa Hạt Dẻ Nướng", price: 52000, priceOld: null, category: CATS.TRA_SUA, description: "Trà sữa vị hạt dẻ nướng thơm lừng, lạ miệng và vô cùng cuốn hút.", image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800" },
  { name: "Trà Sữa Matcha Đậu Đỏ", price: 50000, priceOld: 58000, category: CATS.TRA_SUA, description: "Matcha Nhật Bản nguyên chất kết hợp đậu đỏ bùi béo, ngọt thanh.", image: "https://images.unsplash.com/photo-1582785513753-4ba61c77bb50?w=800" },
  { name: "Trà Sữa Thái Xanh Truyền Thống", price: 35000, priceOld: 40000, category: CATS.TRA_SUA, description: "Trà Thái xanh thơm mát, giải nhiệt cực tốt cho những ngày hè.", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800" },
  { name: "Trà Sữa Thái Đỏ Kem Cheese", price: 42000, priceOld: null, category: CATS.TRA_SUA, description: "Trà Thái đỏ đậm vị kết hợp lớp kem cheese mặn béo ngậy.", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800" },
  { name: "Trà Sữa Earl Grey Macchiato", price: 49000, priceOld: 55000, category: CATS.TRA_SUA, description: "Trà Earl Grey thơm hương cam Bergamot kết hợp lớp váng sữa bồng bềnh.", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800" },
  { name: "Trà Sữa Bạc Hà Mát Lạnh", price: 38000, priceOld: 45000, category: CATS.TRA_SUA, description: "Vị bạc hà sảng khoái quyện cùng trà sữa béo ngậy, thức uống tỉnh táo.", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800" },
  { name: "Trà Sữa Caramel Hạnh Nhân", price: 55000, priceOld: 65000, category: CATS.TRA_SUA, description: "Sự kết hợp hoàn hảo giữa vị caramel ngọt ngào và hạnh nhân thơm bùi.", image: "https://images.unsplash.com/photo-1550450339-e7a4787a2074?w=800" },
  { name: "Trà Sữa Dâu Tây Kem Mặn", price: 52000, priceOld: null, category: CATS.TRA_SUA, description: "Vị dâu tây chua ngọt hòa quyện cùng trà sữa và kem mặn đặc trưng.", image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800" },
  { name: "Trà Sữa Việt Quất Tươi", price: 55000, priceOld: 60000, category: CATS.TRA_SUA, description: "Thịt việt quất tươi xay nhuyễn, mang lại hương vị trái cây tự nhiên.", image: "https://images.unsplash.com/photo-1605386175727-8a62319f3e46?w=800" },
  { name: "Trà Sữa Sương Sáo Hạt Chia", price: 40000, priceOld: 48000, category: CATS.TRA_SUA, description: "Sự thanh mát từ sương sáo và hạt chia tốt cho sức khỏe.", image: "https://images.unsplash.com/photo-1623065422900-05041a8b1ef2?w=800" },
  { name: "Trà Sữa Đậu Nành Ngũ Cốc", price: 45000, priceOld: null, category: CATS.TRA_SUA, description: "Vị đậu nành thơm dịu kết hợp ngũ cốc giòn rụm, giàu dinh dưỡng.", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800" },
  { name: "Trà Sữa Mật Ong Rừng", price: 48000, priceOld: 55000, category: CATS.TRA_SUA, description: "Vị ngọt thanh từ mật ong rừng nguyên chất, thơm nhẹ nhàng.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800" },
  { name: "Trà Sữa Gạo Lứt Rang", price: 42000, priceOld: 50000, category: CATS.TRA_SUA, description: "Hương gạo lứt rang thơm nồng, thanh đạm và tốt cho tiêu hóa.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800" },

  // Trà Trái Cây (15 items)
  { name: "Trà Xoài Macchiato", price: 55000, priceOld: 65000, category: CATS.TRA_TRAI_CAY, description: "Xoài chín mọng xay nhuyễn kết hợp lớp kem Macchiato béo ngậy.", image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800" },
  { name: "Trà Dứa Blue Ocean", price: 48000, priceOld: 58000, category: CATS.TRA_TRAI_CAY, description: "Vị dứa tươi mát kết hợp siro Curacao tạo màu xanh đại dương đẹp mắt.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800" },
  { name: "Trà Cam Nha Đam", price: 45000, priceOld: null, category: CATS.TRA_TRAI_CAY, description: "Cam tươi vắt cùng thạch nha đam giòn sần sật, giải nhiệt hiệu quả.", image: "https://images.unsplash.com/photo-1623065422900-05041a8b1ef2?w=800" },
  { name: "Trà Dưa Lưới Sương Sáo", price: 52000, priceOld: 62000, category: CATS.TRA_TRAI_CAY, description: "Hương dưa lưới thơm lừng kết hợp sương sáo thanh mát.", image: "https://images.unsplash.com/photo-1613204780521-ea1c6db9756b?w=800" },
  { name: "Trà Táo Xanh Bạc Hà", price: 45000, priceOld: 52000, category: CATS.TRA_TRAI_CAY, description: "Vị táo xanh chua nhẹ kết hợp lá bạc hà mát lạnh, cực kỳ sảng khoái.", image: "https://images.unsplash.com/photo-1601633535976-1f7c32b5f6cd?w=800" },
  { name: "Trà Chanh Dây Hạt Chia", price: 39000, priceOld: null, category: CATS.TRA_TRAI_CAY, description: "Vị chanh dây đậm đà cùng hạt chia bổ dưỡng, thức uống giàu vitamin C.", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800" },
  { name: "Trà Vải Hoàng Kim", price: 55000, priceOld: 65000, category: CATS.TRA_TRAI_CAY, description: "Quả vải ngâm đường phèn giòn ngọt, kết hợp trà ô long thượng hạng.", image: "https://images.unsplash.com/photo-1558857563-b37102e997a3?w=800" },
  { name: "Trà Đào Cam Sả Đặc Biệt", price: 52000, priceOld: 60000, category: CATS.TRA_TRAI_CAY, description: "Phiên bản nâng cấp với nhiều đào hơn và hương sả nồng nàn hơn.", image: "https://images.unsplash.com/photo-1623065422900-05041a8b1ef2?w=800" },
  { name: "Trà Dâu Tây Đá Tuyết", price: 58000, priceOld: null, category: CATS.TRA_TRAI_CAY, description: "Dâu tây tươi xay cùng đá tạo nên kết cấu mịn màng, thanh mát.", image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800" },
  { name: "Trà KiWi Giải Nhiệt", price: 49000, priceOld: 55000, category: CATS.TRA_TRAI_CAY, description: "Kiwi tươi cắt lát, cung cấp năng lượng và vitamin cho ngày dài.", image: "https://images.unsplash.com/photo-1605386175727-8a62319f3e46?w=800" },
  { name: "Trà Bưởi Hồng Mật Ong", price: 55000, priceOld: 65000, category: CATS.TRA_TRAI_CAY, description: "Múi bưởi hồng tươi mọng nước kết hợp mật ong rừng thanh ngọt.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800" },
  { name: "Trà Thảo Mộc Trái Cây", price: 60000, priceOld: null, category: CATS.TRA_TRAI_CAY, description: "Sự tổng hòa của nhiều loại trái cây sấy và thảo mộc tốt cho sức khỏe.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800" },
  { name: "Trà Lựu Đỏ Sencha", price: 52000, priceOld: 60000, category: CATS.TRA_TRAI_CAY, description: "Nước ép lựu đỏ nguyên chất kết hợp trà xanh Sencha Nhật Bản.", image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800" },
  { name: "Trà Chanh Tuyết Nhiệt Đới", price: 42000, priceOld: 48000, category: CATS.TRA_TRAI_CAY, description: "Vị chanh truyền thống nhưng được xay đá tuyết cực đã.", image: "https://images.unsplash.com/photo-1601633535976-1f7c32b5f6cd?w=800" },
  { name: "Trà Mâm Xôi Đen", price: 55000, priceOld: null, category: CATS.TRA_TRAI_CAY, description: "Hương vị mâm xôi đen độc đáo, chua chua ngọt ngọt khó cưỡng.", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800" },

  // Cà phê (15 items)
  { name: "Cà Phê Trứng Hà Nội", price: 55000, priceOld: 65000, category: CATS.CA_PHE, description: "Lớp kem trứng bông mịn, béo ngậy phủ lên cà phê đen đậm đặc.", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800" },
  { name: "Cà Phê Cốt Dừa Đá Xay", price: 49000, priceOld: 58000, category: CATS.CA_PHE, description: "Sự kết hợp hoàn hảo giữa cà phê robusta và nước cốt dừa thơm béo.", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800" },
  { name: "Cappuccino Vẽ Nghệ Thuật", price: 52000, priceOld: null, category: CATS.CA_PHE, description: "Cà phê Ý chuẩn vị với lớp bọt sữa dày và hình vẽ Latte Art bắt mắt.", image: "https://images.unsplash.com/photo-1507133750070-4402871dc9fb?w=800" },
  { name: "Latte Hạnh Nhơn", price: 55000, priceOld: 65000, category: CATS.CA_PHE, description: "Sự kết hợp sang trọng giữa Espresso và sữa hạnh nhân dinh dưỡng.", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800" },
  { name: "Mocha Socola Nóng", price: 58000, priceOld: 68000, category: CATS.CA_PHE, description: "Vị đắng của cà phê hòa quyện cùng vị ngọt của socola thượng hạng.", image: "https://images.unsplash.com/photo-1572490122747-3968b75bb811?w=800" },
  { name: "Americano Đá Mát Lạnh", price: 35000, priceOld: null, category: CATS.CA_PHE, description: "Cà phê Espresso pha loãng, giữ trọn hương vị nguyên bản.", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800" },
  { name: "Cà Phê Sữa Tươi Sương Sáo", price: 42000, priceOld: 50000, category: CATS.CA_PHE, description: "Món uống đang được ưa chuộng với thạch sương sáo dai dai.", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800" },
  { name: "Cold Brew Cam Vàng", price: 55000, priceOld: 65000, category: CATS.CA_PHE, description: "Cà phê ủ lạnh thanh thoát kết hợp lát cam vàng sấy khô thơm ngát.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800" },
  { name: "Caramel Macchiato Nóng", price: 59000, priceOld: null, category: CATS.CA_PHE, description: "Sữa tươi đánh nóng, Espresso và xốt caramel ngọt ngào.", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800" },
  { name: "Flat White Kiểu Úc", price: 52000, priceOld: 60000, category: CATS.CA_PHE, description: "Cà phê sữa kiểu Úc với lớp sữa mịn, đậm vị Espresso.", image: "https://images.unsplash.com/photo-1507133750070-4402871dc9fb?w=800" },
  { name: "Cà Phê Đen Pha Phin", price: 29000, priceOld: 35000, category: CATS.CA_PHE, description: "Đậm chất truyền thống Việt Nam, mạnh mẽ và tỉnh táo.", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800" },
  { name: "Cà Phê Sữa Đá Sài Gòn", price: 32000, priceOld: null, category: CATS.CA_PHE, description: "Biểu tượng đường phố Sài Gòn, ngọt béo đậm đà.", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800" },
  { name: "Espresso Con Panna", price: 45000, priceOld: 52000, category: CATS.CA_PHE, description: "Espresso đậm đặc phủ một lớp kem tươi mịn màng.", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800" },
  { name: "Affogato Kem Vani", price: 65000, priceOld: 75000, category: CATS.CA_PHE, description: "Sự tan chảy của viên kem vani trong tách Espresso nóng hổi.", image: "https://images.unsplash.com/photo-1507133750070-4402871dc9fb?w=800" },
  { name: "Cà Phê Trái Cây Độc Lạ", price: 55000, priceOld: null, category: CATS.CA_PHE, description: "Sự kết hợp bất ngờ giữa cà phê và nước ép trái cây tươi.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800" },

  // Đá xay (15 items)
  { name: "Matcha Blend Cream", price: 55000, priceOld: 65000, category: CATS.DA_XAY, description: "Bột Matcha trà xanh cao cấp xay cùng đá và phủ kem tươi.", image: "https://images.unsplash.com/photo-1582785513753-4ba61c77bb50?w=800" },
  { name: "Cookies & Cream Đá Xay", price: 52000, priceOld: 62000, category: CATS.DA_XAY, description: "Bánh Oreo xay nhuyễn cùng sữa và kem cheese béo mịn.", image: "https://images.unsplash.com/photo-1572490122747-3968b75bb811?w=800" },
  { name: "Socola Chips Đá Xay", price: 55000, priceOld: null, category: CATS.DA_XAY, description: "Socola đậm vị cùng các hạt choco chips giòn tan bên trong.", image: "https://images.unsplash.com/photo-1570881512192-3bcfa3b3dfa8?w=800" },
  { name: "Caramel Frappuccino", price: 59000, priceOld: 69000, category: CATS.DA_XAY, description: "Hương vị caramel ngọt ngào kết hợp cà phê đá xay sảng khoái.", image: "https://images.unsplash.com/photo-1572490122747-3968b75bb811?w=800" },
  { name: "Việt Quất Đá Xay Bồng Bềnh", price: 62000, priceOld: 72000, category: CATS.DA_XAY, description: "Quả việt quất tươi xay cùng lớp kem mây bồng bềnh.", image: "https://images.unsplash.com/photo-1623065422900-05041a8b1ef2?w=800" },
  { name: "Xoài Cát Đá Xay Tuyết", price: 55000, priceOld: null, category: CATS.DA_XAY, description: "Xoài cát Hòa Lộc thơm ngon xay mịn như tuyết.", image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800" },
  { name: "Chanh Dây Đá Xay Giải Nhiệt", price: 48000, priceOld: 55000, category: CATS.DA_XAY, description: "Vị chua thanh của chanh dây giúp đánh tan cơn khát mùa hè.", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800" },
  { name: "Dâu Tây Sữa Chua Đá Xay", price: 58000, priceOld: 68000, category: CATS.DA_XAY, description: "Sự kết hợp hoàn hảo giữa dâu tây và sữa chua lên men tự nhiên.", image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800" },
  { name: "Bạc Hà Choco Chips", price: 55000, priceOld: null, category: CATS.DA_XAY, description: "Vị bạc hà mát lạnh và socola chips giòn rụm.", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800" },
  { name: "Sầu Riêng Đá Xay Đặc Biệt", price: 75000, priceOld: 85000, category: CATS.DA_XAY, description: "Dành cho tín đồ sầu riêng với cơm sầu riêng tươi nguyên chất.", image: "https://images.unsplash.com/photo-1623065422900-05041a8b1ef2?w=800" },
  { name: "Vải Thạch Dừa Đá Xay", price: 52000, priceOld: 60000, category: CATS.DA_XAY, description: "Hương vải thơm dịu kết hợp thạch dừa giòn sần sật.", image: "https://images.unsplash.com/photo-1558857563-b37102e997a3?w=800" },
  { name: "Khoai Môn Cốt Dừa Đá Xay", price: 55000, priceOld: null, category: CATS.DA_XAY, description: "Hương vị truyền thống nhưng ở dạng đá xay hiện đại.", image: "https://images.unsplash.com/photo-1558857563-b37102e997a3?w=800" },
  { name: "Dứa Mật Ong Đá Xay", price: 49000, priceOld: 58000, category: CATS.DA_XAY, description: "Vị dứa chua ngọt quyện cùng mật ong rừng thanh tao.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800" },
  { name: "Cam Sả Đá Xay Lạ Miệng", price: 52000, priceOld: 60000, category: CATS.DA_XAY, description: "Thức uống giải cảm và thanh lọc cơ thể độc đáo.", image: "https://images.unsplash.com/photo-1623065422900-05041a8b1ef2?w=800" },
  { name: "Kiwi Hạt Chia Đá Xay", price: 58000, priceOld: null, category: CATS.DA_XAY, description: "Kiwi xanh tươi mát kết hợp hạt chia bổ dưỡng.", image: "https://images.unsplash.com/photo-1605386175727-8a62319f3e46?w=800" },

  // Soda (15 items)
  { name: "Soda Việt Quất Tím", price: 38000, priceOld: 45000, category: CATS.SODA, description: "Màu tím lãng mạn từ siro việt quất kết hợp soda sủi bọt.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800" },
  { name: "Soda Dâu Tây Đỏ Mọng", price: 38000, priceOld: 45000, category: CATS.SODA, description: "Vị dâu tây ngọt ngào, màu đỏ rực rỡ thu hút mọi ánh nhìn.", image: "https://images.unsplash.com/photo-1587310557434-d130a00df81e?w=800" },
  { name: "Soda Chanh Leo Vàng Tươi", price: 35000, priceOld: null, category: CATS.SODA, description: "Vị chua đặc trưng của chanh leo, thanh mát tức thì.", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800" },
  { name: "Soda Bạc Hà Xanh Mát", price: 35000, priceOld: 42000, category: CATS.SODA, description: "Hương bạc hà nồng nàn, cảm giác sảng khoái lan tỏa.", image: "https://images.unsplash.com/photo-1601633535976-1f7c32b5f6cd?w=800" },
  { name: "Soda Vải Thạch Dừa", price: 42000, priceOld: 48000, category: CATS.SODA, description: "Quả vải ngọt lịm cùng thạch dừa giòn dai.", image: "https://images.unsplash.com/photo-1613204780521-ea1c6db9756b?w=800" },
  { name: "Soda Đào Miếng Giòn", price: 42000, priceOld: null, category: CATS.SODA, description: "Miếng đào ngâm vàng óng, giòn rụm trong ly soda mát lạnh.", image: "https://images.unsplash.com/photo-1623065422900-05041a8b1ef2?w=800" },
  { name: "Soda Kiwi Xanh Rì", price: 45000, priceOld: 52000, category: CATS.SODA, description: "Vị kiwi tươi mới, màu xanh lá bắt mắt.", image: "https://images.unsplash.com/photo-1605386175727-8a62319f3e46?w=800" },
  { name: "Soda Táo Xanh Chua Ngọt", price: 38000, priceOld: 45000, category: CATS.SODA, description: "Hương táo xanh thơm dịu, kích thích vị giác.", image: "https://images.unsplash.com/photo-1601633535976-1f7c32b5f6cd?w=800" },
  { name: "Soda Nho Tím Mộng Mơ", price: 42000, priceOld: null, category: CATS.SODA, description: "Vị nho đậm đà, kết hợp dải bọt khí soda sống động.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800" },
  { name: "Soda Cam Vàng Rực Rỡ", price: 35000, priceOld: 42000, category: CATS.SODA, description: "Nước cam tươi pha cùng soda, giàu vitamin và năng lượng.", image: "https://images.unsplash.com/photo-1623065422900-05041a8b1ef2?w=800" },
  { name: "Soda Dứa Thơm Lừng", price: 35000, priceOld: 42000, category: CATS.SODA, description: "Hương dứa chín mọng, vị ngọt thanh thoát.", image: "https://plus.unsplash.com/premium_photo-1661605333621-e0e64ac36da1?w=800" },
  { name: "Soda Blue Sky Giải Nhiệt", price: 48000, priceOld: null, category: CATS.SODA, description: "Màu xanh bầu trời cực chill, vị cam Curacao độc đáo.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800" },
  { name: "Soda Mojito Không Cồn", price: 45000, priceOld: 55000, category: CATS.SODA, description: "Chanh tươi và lá bạc hà vò nát, món uống thanh lọc tuyệt vời.", image: "https://images.unsplash.com/photo-1601633535976-1f7c32b5f6cd?w=800" },
  { name: "Soda Dâu Lựu Đỏ Thắm", price: 48000, priceOld: 58000, category: CATS.SODA, description: "Sự kết hợp màu sắc và hương vị từ dâu tây và quả lựu.", image: "https://images.unsplash.com/photo-1587310557434-d130a00df81e?w=800" },
  { name: "Soda Hỗn Hợp Trái Cây", price: 55000, priceOld: null, category: CATS.SODA, description: "Ly soda đầy ắp các loại trái cây tươi cắt lát.", image: "https://plus.unsplash.com/premium_photo-1661605333621-e0e64ac36da1?w=800" }
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
