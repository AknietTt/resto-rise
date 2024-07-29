'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Form, Input, Button, Spin, Alert, Select, message } from 'antd';
import 'tailwindcss/tailwind.css';
import { useRouter } from 'next/navigation';
import { host } from '@/utils/constnants';

type Branch = {
  id: string;
  address: string;
  cityId: string;
  restaurantId: string;
};

type City = {
  id: string;
  name: string;
};

export default function EditBranch({ params }: { params: { branchId: string } }) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchBranchData = async () => {
    const token = Cookies.get('token');

    try {
      const response = await axios.get(`${host}/branch/${params.branchId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.isSuccess) {
        setBranch(response.data.value);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Не удалось получить данные филиала');
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await axios.get(`${host}/city/all`);
      if (response.data.isSuccess) {
        setCities(response.data.value);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Не удалось получить данные городов');
    }
  };

  useEffect(() => {
    fetchBranchData();
    fetchCities();
  }, [params.branchId]);

  const handleSubmit = async (values: Omit<Branch, 'restaurantId'>) => {
    const token = Cookies.get('token');

    try {
      if (branch) {
        const response = await axios.put(
          `${host}/branch/update/${branch.id}`,
          {
            id: branch.id,
            address: values.address,
            cityId: values.cityId,
            restaurantId: branch.restaurantId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.isSuccess) {
          message.success('Данные филиал успешно обновлены!');
          router.back();
        } else {
          setError(response.data.error);
        }
      }
    } catch (err) {
      setError('Не удалось обновить данные филиала');
    }
  };

  if (loading) return <Spin size="large" className="flex justify-center items-center h-screen" />;
  if (error) return <Alert message="Ошибка" description={error} type="error" showIcon />;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {branch && (
        <Form
          layout="vertical"
          initialValues={branch}
          onFinish={handleSubmit}
          className="bg-white p-6 shadow-md rounded-lg"
        >
          <Form.Item label="Адрес" name="address" rules={[{ required: true, message: 'Пожалуйста, введите адрес' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Город" name="cityId" rules={[{ required: true, message: 'Пожалуйста, выберите город' }]}>
            <Select>
              {cities.map((city) => (
                <Select.Option key={city.id} value={city.id}>
                  {city.name}
                </Select.Option>
              ))}
            </Select>
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
