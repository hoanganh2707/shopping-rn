/**
 * OpenAI Service
 * Xử lý tích hợp với OpenAI API cho chatbot
 */

import OpenAI from 'openai';

// ⚠️ QUAN TRỌNG: Trong production, API key nên được lưu ở backend hoặc environment variables
// Đây chỉ là ví dụ - KHÔNG hardcode API key trong production code
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Chỉ dùng cho development, trong production nên gọi qua backend
});

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

CÁC ACTION ĐẶC BIỆT (BẮT BUỘC PHẢI TRẢ VỀ ĐÚNG FORMAT):
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
  → Có thể dùng tên sản phẩm thay vì ID nếu không chắc ID (ví dụ: ADD_TO_CART:Tên Sản Phẩm:1)
- Khi khách hỏi về sản phẩm cụ thể → tìm trong danh sách, nếu HẾT HÀNG thì thông báo, nếu còn hàng thì đề xuất ADD_TO_CART
- Khi khách tìm kiếm → dùng SEARCH_PRODUCTS
- Khi khách hỏi về đơn hàng: "đơn hàng của tôi", "theo dõi đơn hàng", "xem đơn hàng", "kiểm tra đơn hàng" → dùng TRACK_ORDER

Format phản hồi JSON (BẮT BUỘC):
{
  "message": "Nội dung phản hồi cho người dùng bằng tiếng Việt",
  "action": "SHOW_PRODUCTS | ADD_TO_CART:productId:quantity | SEARCH_PRODUCTS:query | TRACK_ORDER | null",
  "products": [] // Chỉ điền nếu action là SHOW_PRODUCTS hoặc SEARCH_PRODUCTS
}

LƯU Ý QUAN TRỌNG:
- LUÔN trả về JSON hợp lệ
- KHÔNG BAO GIỜ đề xuất thêm sản phẩm [HẾT HÀNG] vào giỏ hàng
- Nếu khách muốn đặt hàng, kiểm tra sản phẩm có HẾT HÀNG không trước khi trả về ADD_TO_CART
- Tìm productId trong danh sách sản phẩm ở trên (cột ID)
- Nếu không chắc productId, vẫn trả về action nhưng giải thích trong message

Luôn trả lời thân thiện, hữu ích và chuyên nghiệp bằng tiếng Việt.`;
};

/**
 * Gửi tin nhắn đến OpenAI và nhận phản hồi
 * @param {string} userMessage - Tin nhắn từ người dùng
 * @param {Array} conversationHistory - Lịch sử cuộc trò chuyện
 * @param {Array} availableProducts - Danh sách sản phẩm hiện có
 * @returns {Promise<Object>} Phản hồi từ AI
 */
export const sendChatMessage = async (userMessage, conversationHistory = [], availableProducts = []) => {
  try {
    // Tạo system prompt với danh sách sản phẩm
    const systemPrompt = createSystemPrompt(availableProducts);

    // Chuyển đổi conversation history sang format của OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      })),
      { role: 'user', content: userMessage },
    ];

    // Gọi OpenAI API với response format JSON
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // Sử dụng GPT-4 Turbo cho hiệu suất tốt hơn
      messages: messages,
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' }, // Buộc trả về JSON
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    // Parse JSON từ response (với response_format: json_object, response luôn là JSON)
    let parsedResponse = { message: aiResponse, action: null, products: [] };
    
    try {
      // Loại bỏ markdown code block nếu có
      let jsonStr = aiResponse.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Parse JSON trực tiếp (vì đã dùng response_format: json_object)
      parsedResponse = JSON.parse(jsonStr);
      
      // Validate parsed response
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
      console.error('JSON Parse Error:', parseError);
      console.log('Raw AI Response:', aiResponse);
      // Nếu không parse được JSON, dùng message thông thường
      parsedResponse = { 
        message: aiResponse || 'Xin lỗi, tôi gặp lỗi khi xử lý phản hồi.',
        action: null, 
        products: [] 
      };
    }

    // Parse action nếu có
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
    console.error('OpenAI API Error:', error);
    
    // Fallback response nếu có lỗi
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
 * @param {string} query - Từ khóa tìm kiếm
 * @param {Array} allProducts - Danh sách tất cả sản phẩm
 * @returns {Array} Danh sách sản phẩm khớp
 */
export const searchProducts = (query, allProducts = []) => {
  if (!query || !allProducts || allProducts.length === 0) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  
  return allProducts.filter((product) => {
    const name = (product.name || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    
    return name.includes(searchTerm) || description.includes(searchTerm);
  });
};

export default {
  sendChatMessage,
  searchProducts,
};

