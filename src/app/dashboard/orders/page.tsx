'use client';
import React, { useEffect, useState } from 'react';
import { List, Card, message, Spin, Avatar, Row, Col, Typography } from 'antd';
import axios from 'axios';
import { host } from '@/utils/constnants';
import Cookies from 'js-cookie';
import moment from 'moment';
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  CommentOutlined,
  ShopOutlined,
  DollarOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface Order {
  key: string;
  createAt: string;
  summa: number;
  address: string;
  restaurantName: string;
  nameCustomer: string;
  phoneNumber: string;
  entrance: string;
  intercom: string;
  comment: string;
  branch: string;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.error('User ID not found');
      return;
    }

    const fetchOrders = async () => {
      try {
        const token = Cookies.get('token');

        const response = await axios.get(`${host}/Order/owner/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.isSuccess) {
          const fetchedOrders = response.data.value.map((order: any) => ({
            key: order.id,
            createAt: order.createAt,
            summa: order.summa,
            address: order.address,
            restaurantName: order.restaurantName,
            nameCustomer: order.nameCustomer,
            phoneNumber: order.phoneNumber,
            entrance: order.entrance,
            intercom: order.intercom,
            comment: order.comment,
            branch: order.branch,
          }));
          setOrders(fetchedOrders);
        } else {
          message.error('Failed to fetch orders');
        }
      } catch (error) {
        message.error('An error occurred while fetching orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCardClick = (orderId: string) => {
    // Add navigation logic here
  };

  return (
    <div style={{ padding: '20px' }}>
      {loading ? (
        <Spin size="large" />
      ) : (
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={orders}
          renderItem={order => (
            <List.Item>
              <Card
                title={`Заказ от ${moment(order.createAt).format('YYYY-MM-DD HH:mm')}`}
                extra={<a onClick={() => handleCardClick(order.key)}>Подробнее</a>}
                style={{ cursor: 'pointer', fontSize: '14px' }}
                onClick={() => handleCardClick(order.key)}
              >
                <Row gutter={[8, 8]}>
                  <Col span={18}>
                    <Text strong>{order.nameCustomer}</Text><br />
                    <Text><PhoneOutlined /> {order.phoneNumber}</Text><br />
                    <Text><HomeOutlined /> {order.address}</Text><br />
                    <Text><DollarOutlined /> {order.summa} KZT</Text><br />
                    <Text><HomeOutlined /> Подъезд: {order.entrance}</Text><br />
                    <Text><HomeOutlined /> Домофон: {order.intercom}</Text><br />
                    <Text><CommentOutlined /> {order.comment}</Text><br />
                    <Text><ShopOutlined /> {order.restaurantName}</Text><br />
                    <Text><ShopOutlined /> Филиал: {order.branch}</Text>
                  </Col>
                </Row>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default OrdersPage;
