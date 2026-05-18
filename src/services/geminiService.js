/**
 * Gemini AI Service
 * Xử lý tích hợp với Google Gemini API cho chatbot
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// ⚠️ QUAN TRỌNG: API key được cung cấp bởi người dùng
const GEMINI_API_KEY = 'AIzaSyByl8ZAvn34zBlmTuHbYloEmsZ7Fv0rdLc';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Hàm helper để tạo system prompt cho shopping chatbot
 */
const createSystemPrompt = (availableProducts = []) => {
  const productsList = availableProducts.length > 0
    ? availableProducts.map((p, index) => {
        const stockStatus = p.outOfStock ? ' [HẾT HÀNG - KHÔNG THỂ ĐẶT]' : '';
        return `${index + 1}. ${p.name} - ${p.price ? `${p.price.toLocaleString('vi-VN')} VNĐ` : 'Liên hệ'} (ID: ${p.id})${stockStatus}`;
      }).join('\n')
    : 'Chưa có sản phẩm nào trong hệ thống.';

  return `Bạn là trợ lý bán hàng thân thiện và chuyên nghiệp của một ứng dụng mua sắm.

NHIỆM VỤ CỦA BẠN:
1. Trả lời câu hỏi về sản phẩm, dịch vụ và ứng dụng một cách thân thiện và hữu ích
2. Giúp khách hàng tìm kiếm sản phẩm phù hợp
3. Hỗ trợ đặt hàng thông qua chatbot
4. Hỗ trợ khách hàng theo dõi đơn hàng

DANH SÁCH SẢN PHẨM HIỆN CÓ:
${productsList}

QUY TẮC PHẢN HỒI:
- Luôn trả lời bằng tiếng Việt
- Khi khách hỏi về sản phẩm, đề xuất các sản phẩm phù hợp từ danh sách
- Khi khách muốn xem danh sách sản phẩm, trả lời ngắn gọn và đề xuất sử dụng action "SHOW_PRODUCTS"
- Khi khách muốn đặt hàng, hỏi rõ sản phẩm và số lượng, sau đó đề xuất action "ADD_TO_CART"
- Khi khách muốn xem đơn hàng hoặc theo dõi đơn hàng, sử dụng action "TRACK_ORDER"
- Nếu không có thông tin, hãy thành thật nói rằng bạn không biết

CÁC ACTION ĐẶC BIỆT (BẮT BUỘC PHẢI TRẢ VỀ ĐÚNG FORMAT TRONG JSON):
1. SHOW_PRODUCTS: Khi khách muốn xem danh sách sản phẩm
   Format: "action": "SHOW_PRODUCTS"

2. ADD_TO_CART:productId:quantity - Khi khách muốn thêm sản phẩm vào giỏ hàng
   Format: "action": "ADD_TO_CART:PRODUCT_ID:QUANTITY"
   Ví dụ: "action": "ADD_TO_CART:abc123:1" hoặc "action": "ADD_TO_CART:xyz789:2"
   QUAN TRỌNG: productId phải chính xác từ danh sách sản phẩm ở trên

3. SEARCH_PRODUCTS:query - Khi cần tìm kiếm sản phẩm
   Format: "action": "SEARCH_PRODUCTS:từ khóa"
   Ví dụ: "action": "SEARCH_PRODUCTS:áo thun"

4. TRACK_ORDER - Khi khách muốn xem hoặc theo dõi đơn hàng
   Format: "action": "TRACK_ORDER"
   Ví dụ: Khi khách hỏi "đơn hàng của tôi đâu", "theo dõi đơn hàng", "xem đơn hàng"

QUY TẮC SỬ DỤNG ACTION:
- Khi khách nói "cho tôi xem sản phẩm" hoặc "danh sách sản phẩm" → dùng SHOW_PRODUCTS
- Khi khách nói "thêm [tên sản phẩm] vào giỏ hàng" hoặc "mua [tên sản phẩm]" hoặc "đặt [tên sản phẩm]":
  → Kiểm tra xem sản phẩm có đánh dấu [HẾT HÀNG] không
  → Nếu HẾT HÀNG: KHÔNG dùng ADD_TO_CART, thay vào đó thông báo "Sản phẩm này hiện đang hết hàng"
  → Nếu còn hàng: Tìm sản phẩm trong danh sách theo tên (khớp gần đúng)
  → Nếu tìm thấy 1 sản phẩm: dùng ADD_TO_CART với productId chính xác
  → Nếu tìm thấy nhiều sản phẩm: dùng SEARCH_PRODUCTS để hiển thị danh sách
- Khi khách hỏi về sản phẩm cụ thể → tìm trong danh sách, nếu HẾT HÀNG thì thông báo, nếu còn hàng thì đề xuất ADD_TO_CART
- Khi khách hỏi về đơn hàng: "đơn hàng của tôi", "theo dõi đơn hàng", "xem đơn hàng", "kiểm tra đơn hàng" → dùng TRACK_ORDER

Format phản hồi JSON (BẮT BUỘC):
{
  "message": "Nội dung phản hồi cho người dùng bằng tiếng Việt",
  "action": "SHOW_PRODUCTS | ADD_TO_CART:productId:quantity | SEARCH_PRODUCTS:query | TRACK_ORDER | null",
  "products": [] // Chỉ điền nếu action là SHOW_PRODUCTS hoặc SEARCH_PRODUCTS
}

LƯU Ý QUAN TRỌNG:
- LUÔN trả về JSON nguyên bản, không nằm trong tag markdown (như \`\`\`json).
- KHÔNG BAO GIỜ đề xuất thêm sản phẩm [HẾT HÀNG] vào giỏ hàng.
- Tìm productId trong danh sách sản phẩm ở trên (cột ID).
- Nếu không chắc productId, vẫn trả về action nhưng giải thích trong message.

Luôn trả lời thân thiện, hữu ích và chuyên nghiệp bằng tiếng Việt.`;
};

/**
 * Gửi tin nhắn đến Gemini và nhận phản hồi
 * @param {string} userMessage - Tin nhắn từ người dùng
 * @param {Array} conversationHistory - Lịch sử cuộc trò chuyện
 * @param {Array} availableProducts - Danh sách sản phẩm hiện có
 * @returns {Promise<Object>} Phản hồi từ AI
 */
export const sendChatMessage = async (userMessage, conversationHistory = [], availableProducts = []) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    // Tạo system prompt
    const systemPrompt = createSystemPrompt(availableProducts);

    // Gemini sử dụng format { role: 'user' | 'model', parts: [{ text: string }] }
    // QUAN TRỌNG: Lịch sử phải bắt đầu bằng role 'user'
    let history = [];
    let foundFirstUser = false;
    
    for (const msg of conversationHistory) {
      if (msg.role === 'user') {
        foundFirstUser = true;
      }
      
      if (foundFirstUser) {
        history.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }]
        });
      }
    }

    // Đảm bảo tin nhắn cuối cùng trong history là từ 'model' nếu ta chuẩn bị gửi tin nhắn mới từ 'user'
    // Hoặc đơn giản là để Gemini tự xử lý phần còn lại. 
    // Tuy nhiên, thông thường history kết thúc bằng model message.
    if (history.length > 0 && history[history.length - 1].role === 'user') {
        // Nếu tin nhắn cuối trong history là user, ta có thể gộp nó với userMessage hiện tại 
        // hoặc xóa nó khỏi history vì ta sẽ gửi userMessage qua sendMessage.
        history.pop();
    }

    // Thêm system prompt vào đầu (hoặc sử dụng systemInstruction nếu API hỗ trợ, 
    // ở đây ta sẽ kết hợp vào tin nhắn đầu tiên hoặc dùng chat session)
    const chat = model.startChat({
        history: history,
        systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(userMessage);
    const aiResponse = result.response.text();

    // Parse JSON
    let parsedResponse = { message: aiResponse, action: null, products: [] };
    
    try {
      parsedResponse = JSON.parse(aiResponse);
      
      if (!parsedResponse.message) {
        parsedResponse.message = 'Xin lỗi, tôi không thể xử lý yêu cầu này.';
      }
      if (parsedResponse.action === undefined) {
        parsedResponse.action = null;
      }
      if (!parsedResponse.products) {
        parsedResponse.products = [];
      }
    } catch (parseError) {
      console.error('Gemini JSON Parse Error:', parseError);
      parsedResponse = { 
        message: aiResponse || 'Xin lỗi, tôi gặp lỗi khi xử lý phản hồi.',
        action: null, 
        products: [] 
      };
    }

    // Parse actionType & actionParams để giữ tương thích với UI cũ
    if (parsedResponse.action && typeof parsedResponse.action === 'string') {
      const actionParts = parsedResponse.action.split(':');
      parsedResponse.actionType = actionParts[0];
      parsedResponse.actionParams = actionParts.slice(1);
    }

    return {
      success: true,
      data: parsedResponse,
      rawResponse: aiResponse,
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      success: false,
      error: error.message || 'Đã có lỗi xảy ra khi xử lý tin nhắn',
      data: {
        message: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
        action: null,
        products: [],
      },
    };
  }
};

/**
 * Tìm kiếm sản phẩm dựa trên query
 */
export const searchProducts = (query, allProducts = []) => {
  if (!query || !allProducts || allProducts.length === 0) return [];
  const searchTerm = query.toLowerCase().trim();
  return allProducts.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm) || 
    (p.description || '').toLowerCase().includes(searchTerm)
  );
};

export default {
  sendChatMessage,
  searchProducts,
};
