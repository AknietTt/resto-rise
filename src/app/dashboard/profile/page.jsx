// app/dashboard/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Avatar, Button, Card, Descriptions, Spin, message } from "antd";
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import ProtectedRoute from "@/components/ProtectedRoute";
import { removeToken, getUserId } from "@/utils/auth";
import LayoutDashboard from "../layout";
import '../../globals.css';
import { host } from "@/utils/constnants";

const Profile = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = getUserId();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${host}/auth/info/${userId}`);
        const result = await response.json();
        if (response.ok && result.isSuccess) {
          setUserData(result.value);
        } else {
          console.error("Failed to fetch user data:", result.error);
          message.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("An error occurred while fetching user data:", error);
        message.error("An error occurred while fetching user data");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  if (loading) {
    return <Spin tip="Loading..." />;
  }

  if (!userId) {
    return <div>User ID not found</div>;
  }

  return (
    <ProtectedRoute>
      <div style={{ padding: '20px' }}>
        {userData ? (
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar size={64} icon={<UserOutlined />} style={{ marginRight: '16px' }} />
                <div>
                  <h2 style={{ marginBottom: 0 }}>{userData.firstName} {userData.secondName}</h2>
                  <p style={{ marginBottom: 0, color: 'rgba(0, 0, 0, 0.45)' }}>{userData.email}</p>
                </div>
              </div>
            }
            bordered={false}
            style={{ maxWidth: '800px', margin: 'auto' }}
          >
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Имя">{userData.firstName}</Descriptions.Item>
              <Descriptions.Item label="Фамилия">{userData.secondName}</Descriptions.Item>
              <Descriptions.Item label="Отчество">{userData.middleName}</Descriptions.Item>
              <Descriptions.Item label="Номер телефона">{userData.phoneNumber}</Descriptions.Item>
              <Descriptions.Item label="Email">{userData.email}</Descriptions.Item>
              <Descriptions.Item label="Дата рождения">{new Date(userData.dateOfBirthDate).toLocaleDateString()}</Descriptions.Item>
              <Descriptions.Item label="Пол">{userData.gender}</Descriptions.Item>
              <Descriptions.Item label="Telegram Nick">{userData.telegramNick || "N/A"}</Descriptions.Item>
            </Descriptions>
            <Button 
              type="primary" 
              onClick={handleLogout} 
              icon={<LogoutOutlined />} 
              style={{ marginTop: '20px', width: '100%' }}
            >
              Выйти
            </Button>
          </Card>
        ) : (
          <p>Не удалось загрузить данные пользователя</p>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
