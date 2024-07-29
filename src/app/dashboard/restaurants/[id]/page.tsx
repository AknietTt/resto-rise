'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Row, Col, Spin, Button, Modal, Form, Input, Select, message } from 'antd';
import Cookies from 'js-cookie';
import { host } from '@/utils/constnants';
import { useRouter } from 'next/navigation';

interface Branch {
  id: string;
  address: string;
  city: string;
  restaurant: string;
}

interface City {
  id: string;
  name: string;
}

export default function RestaurantInfo ({ params }: { params: { id: string } }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    
    if (params.id && token) {
      axios.get(`${host}/branch/restaurant/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        const { isSuccess, value } = response.data;
        if (isSuccess) {
          setBranches(value);
        }
      })
      .catch(error => {
        console.error('Ошибка при получении данных:', error);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      console.error('ID ресторана или токен не найден');
      setLoading(false);
    }
  }, [params.id]);

  const fetchCities = async () => {
    try {
      const response = await axios.get(`${host}/city/all`);
      const { isSuccess, value } = response.data;
      if (isSuccess) {
        setCities(value);
      }
    } catch (error) {
      console.error('Ошибка при получении списка городов:', error);
    }
  };

  const showAddModal = () => {
    fetchCities();
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleAddBranch = async (values: { address: string; cityId: string }) => {
    const token = Cookies.get('token');
    if (token) {
      try {
        await axios.post(`${host}/branch/add`, {
          ...values,
          restaurantId: params.id,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success('Филиал успешно добавлен!');
        setModalVisible(false);
        // Обновление списка филиалов после добавления
        setLoading(true);
        const response = await axios.get(`${host}/branch/restaurant/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { isSuccess, value } = response.data;
        if (isSuccess) {
          setBranches(value);
        }
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при добавлении филиала:', error);
        message.error('Ошибка при добавлении филиала.');
      }
    } else {
      message.error('Токен не найден.');
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    const token = Cookies.get('token');
    if (token) {
      try {
        await axios.delete(`${host}/branch/delete/${branchId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success('Филиал успешно удален!');
        // Обновление списка филиалов после удаления
        setLoading(true);
        const response = await axios.get(`${host}/branch/restaurant/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { isSuccess, value } = response.data;
        if (isSuccess) {
          setBranches(value);
        }
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при удалении филиала:', error);
        message.error('Ошибка при удалении филиала.');
      }
    } else {
      message.error('Токен не найден.');
    }
  };

  const handleEditBranch = (branchId: string) => {
    router.push(`/dashboard/restaurants/${params.id}/edit/branch/${branchId}`); // Переход на страницу редактирования филиала
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Spin /></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Button type="primary" onClick={showAddModal} style={{ marginBottom: 20, marginRight: 20 }}>Добавить</Button>
      <Button type="primary" onClick={() => router.push(`/dashboard/restaurants/${params.id}/menu`)} style={{ marginBottom: 20 }}>Меню</Button>
      <Row gutter={[16, 16]}>
        {branches.map(branch => (
          <Col key={branch.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              title={branch.restaurant}
              hoverable
              extra={
                <div>
                  <Button type="link" danger onClick={() => handleDeleteBranch(branch.id)}>Удалить</Button>
                  <Button type="link" onClick={() => handleEditBranch(branch.id)}>Изменить</Button>
                </div>
              }
            >
              <p><strong>Адрес:</strong> {branch.address}</p>
              <p><strong>Город:</strong> {branch.city}</p>
            </Card>
          </Col>
        ))}
      </Row>
      <Modal
        title="Добавить филиал"
        visible={modalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddBranch}>
          <Form.Item
            name="address"
            label="Адрес"
            rules={[{ required: true, message: 'Пожалуйста, введите адрес!' }]}
          >
            <Input placeholder="Введите адрес" />
          </Form.Item>
          <Form.Item
            name="cityId"
            label="Город"
            rules={[{ required: true, message: 'Пожалуйста, выберите город!' }]}
          >
            <Select placeholder="Выберите город">
              {cities.map(city => (
                <Select.Option key={city.id} value={city.id}>{city.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Добавить
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
