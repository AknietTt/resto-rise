import {
    UserOutlined,
    ShopOutlined,
    TeamOutlined,
    SnippetsOutlined,
  } from "@ant-design/icons";
  import { Layout, Menu } from "antd";
  import Sider from "antd/es/layout/Sider";
  import React from "react";
  import Link from "next/link";
  
  const items = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: <Link href="profile">Профиль</Link>,
    },
    {
      key: '2',
      icon: <ShopOutlined />,
      label: <Link href="/dashboard/restaurants/">Рестораны</Link>,
    },
    {
      key: '3',
      icon: <SnippetsOutlined />,
      label: <Link href="/dashboard/orders/">Заказы</Link>,
    },
    {
      key: '4',
      icon: <TeamOutlined />,
      label: <Link href="/employees">Работники</Link>,
    },
  ];
  
  export default function SideBar() {
    return (
      <Layout hasSider>
        <Sider
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div className="demo-logo-vertical" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={items}
          />
        </Sider>
      </Layout>
    );
  }
  