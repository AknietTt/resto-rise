'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Form, Input, Button, Spin, Alert } from 'antd';
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

export default function FoodEdit({ params }: { params: { foodId: string } }) {
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const handleSubmit = async (values: Omit<Food, 'id'>) => {
    const token = Cookies.get('token');

    try {
      if (food) {
        const response = await axios.put(
          `${host}/menu/food/update/${food.id}`,
          {
            id: food.id,
            ...values,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.isSuccess) {
          alert('Данные успешно обновлены');
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
    <div className="max-w-2xl mx-auto p-4">
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
          <Form.Item label="Фото" name="photo" rules={[{ required: true, message: 'Пожалуйста, введите URL фото' }]}>
            <Input />
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
    </div>
  );
}
