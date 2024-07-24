'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Col, Row, Spin, Button, Modal, Form, Input, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import { host } from '@/utils/constnants';

interface Food {
  id: string;
  name: string;
  price: number;
  photo: string;
  description: string;
}

interface Category {
  categoryName: string;
  foods: Food[];
}

export default function Menu({ params }: { params: { id: string } }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    const fetchMenu = async () => {
      const token = Cookies.get('token');
      if (params.id && token) {
        try {
          const response = await axios.get(`${host}/menu/food?restaurnatId=${params.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const { isSuccess, value } = response.data;
          if (isSuccess) {
            setCategories(value);
          }
        } catch (error) {
          console.error('Ошибка при получении меню:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.error('ID ресторана или токен не найден');
        setLoading(false);
      }
    };

    fetchMenu();
  }, [params.id]);

  const handleAddFood = async (values: any) => {
    const token = Cookies.get('token');
    let photoUrl = '';

    if (fileList.length > 0) {
      const formData = new FormData();
      formData.append('image', fileList[0].originFileObj);

      try {
        const uploadResponse = await axios.post('https://localhost:7284/file/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        photoUrl = uploadResponse.data.url;
      } catch (error) {
        console.error('Ошибка при загрузке изображения:', error);
        message.error('Ошибка при загрузке изображения.');
        return;
      }
    }

    try {
      await axios.post('https://localhost:7284/menu/food/add', {
        name: values.name,
        price: values.price,
        description: values.description,
        restaurantId: params.id,
        category: values.category,
        photo: photoUrl,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success('Блюдо успешно добавлено!');
      setModalVisible(false);
      setFileList([]);
      form.resetFields();
      // Обновить список блюд после добавления
      setLoading(true);
      const response = await axios.get(`https://localhost:7284/menu/food?restaurnatId=${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { isSuccess, value } = response.data;
      if (isSuccess) {
        setCategories(value);
      }
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при добавлении блюда:', error);
      message.error('Ошибка при добавлении блюда.');
    }
  };

  const handleUploadChange = ({ fileList }: any) => {
    setFileList(fileList);
  };

  const handleDeleteFood = async (foodId: string) => {
    const token = Cookies.get('token');
    try {
      await axios.delete(`https://localhost:7284/menu/food/delete/${foodId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success('Блюдо успешно удалено!');
      // Обновить список блюд после удаления
      setLoading(true);
      const response = await axios.get(`https://localhost:7284/menu/food?restaurnatId=${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { isSuccess, value } = response.data;
      if (isSuccess) {
        setCategories(value);
      }
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при удалении блюда:', error);
      message.error('Ошибка при удалении блюда.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Spin /></div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Button type="primary" onClick={() => setModalVisible(true)} style={{ marginBottom: 20 }}>
        Добавить блюдо
      </Button>
      {categories.map((category, index) => (
        <div key={index} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{category.categoryName}</h2>
          <Row gutter={[16, 16]}>
            {category.foods.map(food => (
              <Col key={food.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={<img alt={food.name} src={food.photo} className="object-cover h-48 w-full" />}
                >
                  <Card.Meta title={food.name} description={food.description} />
                  <p className="mt-2"><strong>Цена:</strong> {food.price}₸</p>
                  <Button danger onClick={() => handleDeleteFood(food.id)} style={{ marginTop: 10 }}>Удалить</Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ))}
      <Modal
        title="Добавить блюдо"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddFood}>
          <Form.Item
            name="name"
            label="Название"
            rules={[{ required: true, message: 'Пожалуйста, введите название!' }]}
          >
            <Input placeholder="Введите название" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Цена"
            rules={[{ required: true, message: 'Пожалуйста, введите цену!' }]}
          >
            <Input type="number" placeholder="Введите цену" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Описание"
            rules={[{ required: true, message: 'Пожалуйста, введите описание!' }]}
          >
            <Input.TextArea rows={4} placeholder="Введите описание" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Категория"
            rules={[{ required: true, message: 'Пожалуйста, введите категорию!' }]}
          >
            <Input placeholder="Введите категорию" />
          </Form.Item>
          <Form.Item
            name="photo"
            label="Фото"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
              onChange={handleUploadChange}
              fileList={fileList}
            >
              <Button icon={<UploadOutlined />}>Загрузить фото</Button>
            </Upload>
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
