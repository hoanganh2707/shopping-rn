/**
 * Chatbot Screen
 * Tích hợp OpenAI để hỏi đáp, tìm kiếm sản phẩm và đặt hàng
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { Header, Text, Input, Button, LoadingIndicator, ProductItem } from '~/components';
import { SCREENS } from '~/constants';
import { useGetListProductRealtime, useLoading } from '~/hooks';
import { cartActions } from '~/redux';
import { colors } from '~/styles';
import { sendChatMessage, searchProducts } from '~/services';
import { showMessageAddToCart, showMessage } from '~/utils';
import { productApi, orderApi } from '~/apis';

const Chatbot = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showLoading, hideLoading } = useLoading();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [productsToShow, setProductsToShow] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [ordersToShow, setOrdersToShow] = useState([]);

  const flatListRef = useRef(null);
  const allProducts = useGetListProductRealtime();
  const user = useSelector((state) => state.auth.user);

  // Tin nhắn chào mừng ban đầu
  useEffect(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Xin chào! Tôi là trợ lý bán hàng của bạn. Tôi có thể giúp bạn:\n\n• Tìm kiếm sản phẩm\n• Xem danh sách sản phẩm\n• Đặt hàng\n• Trả lời câu hỏi\n\nBạn cần tôi giúp gì?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Scroll to bottom khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, showProducts]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsTyping(true);
    setShowProducts(false);
    setShowOrders(false);

    // Thêm tin nhắn người dùng vào danh sách
    const newUserMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);

    try {
      // Chuẩn bị conversation history (chỉ lấy 10 tin nhắn gần nhất)
      const recentMessages = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      }));

      // Gọi OpenAI API
      const response = await sendChatMessage(
        userMessage,
        recentMessages,
        allProducts || []
      );

      if (response.success) {
        const aiData = response.data;

        // Debug log
        console.log('AI Response:', aiData);
        console.log('Action Type:', aiData.actionType);
        console.log('Action Params:', aiData.actionParams);

        // Xử lý action nếu có
        let actionMessage = '';
        let products = [];

        if (aiData.actionType === 'SHOW_PRODUCTS') {
          // Hiển thị danh sách sản phẩm
          products = allProducts || [];
          setProductsToShow(products);
          setShowProducts(true);
          actionMessage = `\n\nĐã tìm thấy ${products.length} sản phẩm. Bạn có thể xem bên dưới:`;
        } else if (aiData.actionType === 'ADD_TO_CART') {
          // Thêm vào giỏ hàng
          const [productIdOrName, quantityStr] = aiData.actionParams || [];
          const quantity = parseInt(quantityStr || '1', 10);
          
          // Tìm sản phẩm theo ID trước
          let product = (allProducts || []).find((p) => p.id === productIdOrName);
          
          // Nếu không tìm thấy theo ID, thử tìm theo tên
          if (!product && productIdOrName) {
            const searchTerm = productIdOrName.toLowerCase().trim();
            const matchedProducts = (allProducts || []).filter((p) => {
              const name = (p.name || '').toLowerCase();
              return name.includes(searchTerm) || searchTerm.includes(name);
            });
            
            // Nếu có 1 sản phẩm khớp, dùng nó
            if (matchedProducts.length === 1) {
              product = matchedProducts[0];
            } 
            // Nếu có nhiều sản phẩm khớp, hiển thị danh sách
            else if (matchedProducts.length > 1) {
              products = matchedProducts;
              setProductsToShow(products);
              setShowProducts(true);
              actionMessage = `\n\nTìm thấy ${products.length} sản phẩm tương tự. Vui lòng chọn sản phẩm bạn muốn:`;
              product = null; // Không thêm vào giỏ hàng ngay
            }
          }

          if (product) {
            // Kiểm tra sản phẩm có hết hàng không
            if (product.outOfStock === true) {
              actionMessage = `\n\n⚠️ Sản phẩm "${product.name}" hiện đang hết hàng. Vui lòng chọn sản phẩm khác hoặc quay lại sau.`;
            } else {
              // Thêm vào giỏ hàng
              for (let i = 0; i < quantity; i++) {
                dispatch(cartActions.addToCart(product));
              }
              showMessageAddToCart();
              actionMessage = `\n\n✅ Đã thêm "${product.name}" (${quantity} sản phẩm) vào giỏ hàng!`;
            }
          } else if (!products || products.length === 0) {
            actionMessage = '\n\n❌ Không tìm thấy sản phẩm. Vui lòng thử lại hoặc xem danh sách sản phẩm.';
          }
        } else if (aiData.actionType === 'SEARCH_PRODUCTS') {
          // Tìm kiếm sản phẩm
          const query = aiData.actionParams?.[0] || userMessage;
          products = searchProducts(query, allProducts || []);
          setProductsToShow(products);
          setShowProducts(true);
          actionMessage = `\n\nTìm thấy ${products.length} sản phẩm phù hợp:`;
        } else if (aiData.actionType === 'TRACK_ORDER') {
          // Theo dõi đơn hàng
          if (!user || !user.uid) {
            actionMessage = '\n\n⚠️ Bạn cần đăng nhập để xem đơn hàng.';
          } else {
            const orderResponse = await orderApi.getUserOrders(user.uid);
            if (orderResponse.status === 'success' && orderResponse.data) {
              const orders = orderResponse.data;
              setOrdersToShow(orders);
              setShowOrders(true);
              if (orders.length > 0) {
                actionMessage = `\n\n📦 Bạn có ${orders.length} đơn hàng. Xem chi tiết bên dưới:`;
              } else {
                actionMessage = '\n\n📭 Bạn chưa có đơn hàng nào.';
              }
            } else {
              actionMessage = '\n\n❌ Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.';
            }
          }
        }

        // Thêm tin nhắn AI vào danh sách
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiData.message + actionMessage,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Xử lý lỗi
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc kiểm tra cấu hình OpenAI API key.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddToCart = (product) => {
    // Kiểm tra sản phẩm có hết hàng không
    if (product.outOfStock === true) {
      const outOfStockMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⚠️ Sản phẩm "${product.name}" hiện đang hết hàng. Vui lòng chọn sản phẩm khác hoặc quay lại sau.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, outOfStockMessage]);
      return;
    }

    dispatch(cartActions.addToCart(product));
    showMessageAddToCart();
    
    // Thêm tin nhắn xác nhận
    const confirmMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `✅ Đã thêm "${product.name}" vào giỏ hàng của bạn!`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, confirmMessage]);
  };

  const handleProductDetail = (productId) => {
    navigation.navigate(SCREENS.PRODUCT_DETAIL, {
      data: productId,
    });
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AI</Text>
            </View>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.assistantMessageBubble,
          ]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.content}
          </Text>
        </View>
        {isUser && (
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, styles.userAvatar]}>
              <Text style={styles.avatarText}>You</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productItemWrapper}>
      <ProductItem
        data={item}
        onDetail={() => handleProductDetail(item.id)}
        onAddToCart={() => handleAddToCart(item)}
      />
    </View>
  );

  const getOrderStatusText = (status) => {
    const statusMap = {
      pending: { text: 'Chờ xử lý', color: colors.warning },
      confirmed: { text: 'Đã xác nhận', color: colors.info },
      shipping: { text: 'Đang giao', color: colors.primary },
      completed: { text: 'Hoàn thành', color: colors.success },
      cancelled: { text: 'Đã hủy', color: colors.error },
    };
    return statusMap[status] || { text: status, color: colors.text };
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      unpaid: { text: 'Chưa thanh toán', color: colors.error },
      paid: { text: 'Đã thanh toán', color: colors.success },
      failed: { text: 'Thanh toán thất bại', color: colors.error },
    };
    return statusMap[status] || { text: status, color: colors.text };
  };

  const renderOrderItem = ({ item }) => {
    const orderStatus = getOrderStatusText(item.status);
    const paymentStatus = getPaymentStatusText(item.paymentStatus);
    const orderDate = item.createdAt?.toDate 
      ? item.createdAt.toDate().toLocaleDateString('vi-VN')
      : 'N/A';

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderCode}>#{item.orderCode || item.id?.slice(-8)}</Text>
          <View style={[styles.orderStatusBadge, { backgroundColor: orderStatus.color + '20' }]}>
            <Text style={[styles.orderStatusText, { color: orderStatus.color }]}>
              {orderStatus.text}
            </Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Ngày đặt:</Text>
          <Text style={styles.orderValue}>{orderDate}</Text>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Tổng tiền:</Text>
          <Text style={styles.orderValue}>
            {item.totalAmount?.toLocaleString('vi-VN')} VNĐ
          </Text>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderLabel}>Thanh toán:</Text>
          <View style={[styles.paymentStatusBadge, { backgroundColor: paymentStatus.color + '20' }]}>
            <Text style={[styles.paymentStatusText, { color: paymentStatus.color }]}>
              {paymentStatus.text}
            </Text>
          </View>
        </View>

        {item.items && item.items.length > 0 && (
          <View style={styles.orderItems}>
            <Text style={styles.orderItemsLabel}>Sản phẩm ({item.items.length}):</Text>
            {item.items.slice(0, 2).map((orderItem, index) => (
              <Text key={index} style={styles.orderItemText}>
                • Sản phẩm #{orderItem.id?.slice(-6)} x{orderItem.quantity}
              </Text>
            ))}
            {item.items.length > 2 && (
              <Text style={styles.orderItemText}>
                ... và {item.items.length - 2} sản phẩm khác
              </Text>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.orderDetailButton}
          onPress={() => navigation.navigate(SCREENS.ORDER_DETAIL, { orderId: item.id })}>
          <Text style={styles.orderDetailButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <Header title={t('chatbot') || 'Chatbot'} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={<LoadingIndicator />}
          ListFooterComponent={
            <>
              {isTyping && (
                <View style={styles.typingContainer}>
                  <View style={styles.typingBubble}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.typingText}>Đang trả lời...</Text>
                  </View>
                </View>
              )}
              {showProducts && productsToShow.length > 0 && (
                <View style={styles.productsSection}>
                  <Text style={styles.productsSectionTitle}>
                    {t('products') || 'Sản phẩm gợi ý'}
                  </Text>
                  <FlatList
                    data={productsToShow}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    scrollEnabled={false}
                  />
                </View>
              )}
              {showProducts && productsToShow.length === 0 && (
                <View style={styles.emptyProducts}>
                  <Text style={styles.emptyProductsText}>
                    {t('noProductsFound') || 'Không tìm thấy sản phẩm nào'}
                  </Text>
                </View>
              )}
              {showOrders && ordersToShow.length > 0 && (
                <View style={styles.ordersSection}>
                  <Text style={styles.ordersSectionTitle}>
                    📦 Đơn hàng của bạn
                  </Text>
                  <FlatList
                    data={ordersToShow}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                </View>
              )}
              {showOrders && ordersToShow.length === 0 && (
                <View style={styles.emptyOrders}>
                  <Text style={styles.emptyOrdersText}>
                    📭 Bạn chưa có đơn hàng nào
                  </Text>
                </View>
              )}
            </>
          }
        />

        <View style={styles.inputContainer}>
          <Input
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('typeMessage') || 'Nhập tin nhắn...'}
            style={styles.input}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isTyping}>
            <Text style={styles.sendButtonText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    marginHorizontal: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: colors.secondary,
  },
  avatarText: {
    color: colors.light,
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  userMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantMessageBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.light,
  },
  typingContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  typingBubble: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  typingText: {
    marginLeft: 8,
    color: colors.secondaryText,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.tertiaryText,
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.light,
    fontWeight: 'bold',
    fontSize: 14,
  },
  productsSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  productsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  productItemWrapper: {
    flex: 1,
    margin: 2,
  },
  emptyProducts: {
    padding: 20,
    alignItems: 'center',
  },
  emptyProductsText: {
    color: colors.tertiaryText,
    fontSize: 14,
  },
  ordersSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  ordersSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  orderStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  orderItemsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  orderItemText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  orderDetailButton: {
    marginTop: 12,
    backgroundColor: colors.primary + '15',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderDetailButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyOrders: {
    padding: 20,
    alignItems: 'center',
  },
  emptyOrdersText: {
    color: colors.tertiaryText,
    fontSize: 14,
  },
});

export default Chatbot;

