'use client';

import React, { useState } from 'react';
import { Form, Input, Button, message, Upload, Layout, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const { Content } = Layout;

const CreateRestaurant = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = Cookies.get('token');

      const response = await axios.post('https://localhost:7284/file/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const { url } = response.data;
      setImageUrl(url);
      return url;
    } catch (error) {
      message.error('Ошибка при загрузке изображения.');
      return null;
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    const token = Cookies.get('token');
    const ownerId = localStorage.getItem('userId');

    if (!ownerId || !token) {
      message.error('Не удалось получить токен или идентификатор владельца.');
      setLoading(false);
      return;
    }

    const restaurantData = {
      name: values.name,
      photo: imageUrl || '',
      description: values.description,
      ownerId: ownerId,
    };

    try {
      const response = await axios.post('https://localhost:7284/restaurnat/create', restaurantData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        message.success('Ресторан успешно создан!');
        router.push('/dashboard/restaurants');
      } else {
        message.error('Ошибка при создании ресторана.');
      }
    } catch (error) {
      message.error('Ошибка при создании ресторана.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen flex items-center justify-center bg-cover" style={{ backgroundImage: 'url(https://celes.club/uploads/posts/2022-11/1667327530_4-celes-club-p-fon-gradient-sinii-oboi-5.jpg)' }}>
      <Content className="flex justify-center items-center w-full">
        <Card className="max-w-md w-full p-6 rounded-lg shadow-lg bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="name"
              label="Название ресторана"
              rules={[{ required: true, message: 'Пожалуйста, введите название ресторана!' }]}
            >
              <Input placeholder="Введите название ресторана" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Описание"
              rules={[{ required: true, message: 'Пожалуйста, введите описание ресторана!' }]}
            >
              <Input.TextArea rows={4} placeholder="Введите описание ресторана" />
            </Form.Item>

            <Form.Item
              name="photo"
              label="Фото"
              valuePropName="fileList"
              getValueFromEvent={(e: any) => {
                if (Array.isArray(e)) {
                  return e;
                }
                return e && e.fileList;
              }}
              extra="Загрузите фото ресторана"
            >
              <Upload
                name="photo"
                listType="picture"
                maxCount={1}
                customRequest={async ({ file, onSuccess, onError }) => {
                  const url = await handleUpload(file as File);
                  if (url) {
                    onSuccess && onSuccess(url);
                  } else {
                    onError && onError(new Error('Ошибка при загрузке изображения.'));
                  }
                }}
              >
                <Button icon={<UploadOutlined />}>Загрузить фото</Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="w-full mt-4">
                Создать ресторан
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default CreateRestaurant;
