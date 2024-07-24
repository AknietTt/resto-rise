'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Используем next/navigation для новой структуры маршрутизации
import { Button, Form, Input, Typography, message, Layout, Card } from 'antd';
import axios from 'axios';
import { setToken, getToken } from '../../utils/auth'; // Обновите путь, если нужно
import 'tailwindcss/tailwind.css';
import { host } from '@/utils/constnants';

const { Title, Text } = Typography;
const { Content } = Layout;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    
    if (token) {
        console.log(token);    
    router.push('/dashboard/profile');
    }
  }, [router]);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const response = await axios.post(host+'/auth/athorize', values);
      const { isSuccess, value, error } = response.data;

      if (isSuccess) {
        setToken(value.token);
        message.success('Успешный вход. Добро пожаловать!');
        localStorage.setItem('userId', value.userId);
        router.push('/dashboard/profile');
      } else {
        message.error(error || 'Ошибка входа. Пожалуйста, проверьте свои данные.');
      }
    } catch (error) {
      message.error('Ошибка входа. Пожалуйста, проверьте свои данные.');
    }
  };

  return (
    <Layout className="min-h-screen flex items-center justify-center bg-cover" style={{ backgroundImage: 'url(https://celes.club/uploads/posts/2022-11/1667327530_4-celes-club-p-fon-gradient-sinii-oboi-5.jpg)' }}>
      <Content className="flex justify-center items-center w-full">
        <Card className="max-w-md w-full p-6 rounded-lg shadow-lg bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg">
          <Title level={2} className="text-center mb-6">Добро пожаловать</Title>
          <Text className="text-center mb-6 text-gray-500">
            Пожалуйста, войдите в свою учетную запись
          </Text>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={handleLogin}
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Пожалуйста, введите свой email!' }]}
            >
              <Input
                type="email"
                placeholder="Введите свой email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Пожалуйста, введите свой пароль!' }]}
            >
              <Input.Password
                placeholder="Введите свой пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full mt-4">
                Войти
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;
