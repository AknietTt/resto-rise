'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Form, Input, Button, Spin, Alert, Upload, message, Layout, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import 'tailwindcss/tailwind.css';
import { useRouter } from 'next/navigation';
import { host } from '@/utils/constnants';

type Food = {
  id: string;
  name: string;
  price: number;
  photo: string;
  description: string;
  category: string;
};

const { Content } = Layout;

export default function FoodEdit({ params }: { params: { foodId: string } }) {
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const router = useRouter();

  const fetchFoodData = async () => {
    const token = Cookies.get('token');

    try {
      const response = await axios.get(`${host}/menu/${params.foodId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.isSuccess) {
        setFood(response.data.value);
        setPhotoUrl(response.data.value.photo);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Не удалось получить данные о еде');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodData();
  }, [params.foodId]);

  const handleUpload = async (file: File) => {
    const token = Cookies.get('token');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${host}/file/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && response.data.url) {
        setPhotoUrl(response.data.url);
        message.success('Фото успешно загружено');
      } else {
        message.error('Не удалось загрузить фото');
      }
    } catch (err) {
      message.error('Ошибка при загрузке фото');
    }
  };

  const handleChange = ({ fileList }: any) => setFileList(fileList);

  const handleSubmit = async (values: Omit<Food, 'id'>) => {
    const token = Cookies.get('token');

    try {
      if (food) {
        const response = await axios.put(
          `${host}/menu/food/update/${food.id}`,
          {
            id: food.id,
            ...values,
            photo: photoUrl,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.isSuccess) {
          message.success('Данные успешно обновлены');
          router.back();
        } else {
          setError(response.data.error);
        }
      }
    } catch (err) {
      setError('Не удалось обновить данные о еде');
    }
  };

  if (loading) return <Spin size="large" className="flex justify-center items-center h-screen" />;
  if (error) return <Alert message="Ошибка" description={error} type="error" showIcon />;

  return (
    <Layout className="min-h-screen flex items-center justify-center bg-cover" >
      <Content className="flex justify-center items-center w-full">
        <Card className="max-w-4xl w-full p-6 rounded-lg shadow-lg bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg">
          {food && (
            <Form
              layout="vertical"
              initialValues={food}
              onFinish={handleSubmit}
              className="bg-white p-6 shadow-md rounded-lg"
            >
              <Form.Item label="Название" name="name" rules={[{ required: true, message: 'Пожалуйста, введите название' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Цена" name="price" rules={[{ required: true, message: 'Пожалуйста, введите цену' }]}>
                <Input type="number" />
              </Form.Item>
              <Form.Item label="Фото">
                <Upload
                  listType="picture"
                  fileList={fileList}
                  beforeUpload={file => {
                    handleUpload(file);
                    return false;
                  }}
                  onChange={handleChange}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Загрузить фото</Button>
                </Upload>
                {photoUrl && <img src={photoUrl} alt="Food" style={{ marginTop: '10px', maxWidth: '100%' }} />}
              </Form.Item>
              <Form.Item label="Описание" name="description" rules={[{ required: true, message: 'Пожалуйста, введите описание' }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Категория" name="category" rules={[{ required: true, message: 'Пожалуйста, введите категорию' }]}>
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Сохранить
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
      </Content>
    </Layout>
  );
}
