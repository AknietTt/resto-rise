'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Form, Input, Button, message, Layout, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { host } from '@/utils/constnants';

const { Content } = Layout;

interface Restaurant {
  id: string;
  name: string;
  photo: string;
  description: string;
}

export default function RestaurantEdit({ params }: { params: { id: string } }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurant = async () => {
      const token = Cookies.get('token');

      if (!token) {
        console.error('Токен аутентификации не найден');
        return;
      }

      try {
        const response = await axios.get(`${host}/restaurant/get/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.isSuccess) {
          setRestaurant(response.data.value);
          form.setFieldsValue(response.data.value);
          setImageUrl(response.data.value.photo);
        } else {
          console.error('Не удалось получить данные:', response.data.error);
        }
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
      }
    };

    fetchRestaurant();
  }, [params.id, form]);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = Cookies.get('token');

      const response = await axios.post(`${host}/file/upload`, formData, {
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

  const handleChange = ({ fileList }: any) => setFileList(fileList);

  const handleSubmit = async (values: Restaurant) => {
    const token = Cookies.get('token');

    if (!token) {
      console.error('Токен аутентификации не найден');
      return;
    }

    const requestBody = {
      id: params.id,
      name: values.name,
      photo: imageUrl || values.photo,
      description: values.description
    };

    try {
      const response = await axios.put(`${host}/restaurant/update/${params.id}`, requestBody, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.isSuccess) {
        message.success('Данные ресторана успешно обновлены!');
        router.back();
      } else {
        message.error('Не удалось обновить данные ресторана.');
      }
    } catch (error) {
      console.error('Ошибка при обновлении данных ресторана:', error);
      message.error('Ошибка при обновлении данных ресторана.');
    }
  };

  if (!restaurant) {
    return <div>Загрузка...</div>;
  }

  return (
    <Layout>
      <Content style={{ padding: '20px 50px' }}>
        <Card hoverable style={{ maxWidth: 600, margin: 'auto' }}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item name="name" label="Название">
              <Input />
            </Form.Item>
            <Form.Item name="photo" label="URL фотографии">
              <Upload
                name="photo"
                listType="picture"
                maxCount={1}
                customRequest={async ({ file, onSuccess, onError }) => {
                  const url = await handleUpload(file as File);
                  if (url) {
                    onSuccess && onSuccess(url);
                    form.setFieldsValue({ photo: url });
                  } else {
                    onError && onError(new Error('Ошибка при загрузке изображения.'));
                  }
                }}
                onChange={handleChange}
                fileList={fileList}
              >
                <Button icon={<UploadOutlined />}>Загрузить фото</Button>
              </Upload>
              {imageUrl && <img src={imageUrl} alt="Restaurant" style={{ marginTop: '10px', maxWidth: '100%' }} />}
            </Form.Item>
            <Form.Item name="description" label="Описание">
              <Input.TextArea />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Обновить данные
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
}
