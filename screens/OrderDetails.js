import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity } from 'react-native';

const { height } = Dimensions.get('window');

const OrderDetails = ({ route, navigation }) => {
  const { order } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.topRectangle}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Text style={styles.backArrow}>&lt;</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Order Details</Text>
        </View>
      </View>

      <ScrollView 
  contentContainerStyle={styles.contentContainer}
  showsVerticalScrollIndicator={false}
>
  <View style={styles.sectionContainer}>
    <View style={styles.orderHeader}>
      <Text style={styles.orderNumber}>Order #{order.transactionId}</Text>
      <View style={[
        styles.statusBadge,
        { 
          backgroundColor: getStatusColor(order.status).background,
          borderColor: getStatusColor(order.status).border
        }
      ]}>
        <Text style={[
          styles.statusText,
          { color: getStatusColor(order.status).text }
        ]}>
          {formatStatusText(order.status)}
        </Text>
      </View>
    </View>
  </View>

  <View style={styles.sectionContainer}>
  <Text style={styles.sectionTitle}>Delivery Information</Text>

<View style={styles.namePhoneRow}>
  <Text style={styles.customerName}>{order.customerInfo?.name || 'N/A'}</Text>
  <Text style={styles.customerPhone}>{order.customerInfo?.phone || 'N/A'}</Text>
</View>
<Text style={styles.customerAddress}>{order.customerInfo?.address || 'N/A'}</Text>

  </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sellerAndItemRow}>
            <Text style={styles.detailText}>{order.sellerUsername}</Text>
            <Text style={styles.sectionTitle}>
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {order.items.map((item, index) => (
            <View key={`${item.productId}_${index}`} style={styles.itemContainer}>
              <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.itemImage} 
              />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                <Text style={styles.itemPrice}>₱{item.price.toFixed(2)}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>₱{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Subtotal:</Text>
            <Text style={styles.detailValue}>₱{order.subtotal?.toFixed(2) || order.total.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Shipping Fee:</Text>
            <Text style={styles.detailValue}>₱{order.shipping?.toFixed(2) || '80.00'}</Text>
          </View>
          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={[styles.detailLabel, styles.totalLabel]}>Total:</Text>
            <Text style={[styles.detailValue, styles.totalValue]}>₱{order.total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Order Date</Text>
          <Text style={styles.detailText}>
            {new Date(order.orderDate || order.createdAt?.toDate() || new Date()).toLocaleString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const formatStatusText = (status) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const getStatusColor = (status) => {
  switch(status) {
    case 'to_pay': return { background: '#fff8e1', border: '#ffc107', text: '#ff8f00' };
    case 'to_ship': return { background: '#e3f2fd', border: '#2196f3', text: '#1565c0' };
    case 'to_receive': return { background: '#e8f5e9', border: '#4caf50', text: '#2e7d32' };
    case 'completed': return { background: '#e8f5e9', border: '#4caf50', text: '#2e7d32' };
    case 'cancelled': return { background: '#ffebee', border: '#f44336', text: '#c62828' };
    default: return { background: '#f5f5f5', border: '#9e9e9e', text: '#424242' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(240, 243, 242)',
  },
  topRectangle: {
    width: '100%',
    height: height * 0.13, 
    backgroundColor: '#11AB2F',
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  backArrow: {
    fontSize: 24,
    color: '#f8f8f8',
    fontWeight: 'bold',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f5f5f5',
    marginLeft: 10,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  sectionContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  sellerAndItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111111',
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  namePhoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  customerName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  customerPhone: {
    fontSize: 16,
    color: '#333',
  },
  customerAddress: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },  
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#11AB2F',
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
  },
  itemPrice: {
    fontSize: 12,
    color: '#11AB2F',
    marginTop: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#5D5C5C',
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#5D5C5C',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
    marginTop: 5,
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#11AB2F',
    fontSize: 16,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    fontWeight: 'bold',
  },
});

export default OrderDetails;