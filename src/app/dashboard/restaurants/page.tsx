"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Col, Row, Button } from "antd";
import Cookies from "js-cookie";
import { Restaurant } from "@/types/Restaurant";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import "../../globals.css";
import { useRouter } from "next/navigation";
import { host } from "@/utils/constnants";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<string | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = Cookies.get("token"); // Предполагается, что токен хранится в куках под ключом 'token'

    if (userId && token) {
      axios
        .get(`${host}/restaurant/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const { isSuccess, value } = response.data;
          if (isSuccess) {
            setRestaurants(value);
          }
        })
        .catch((error) => {
          console.error("Ошибка при получении данных:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.error("userId или токен не найден в локальном хранилище");
      setLoading(false);
    }
  }, []);

  const showDeleteModal = (id: string) => {
    setRestaurantToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = () => {
    const token = Cookies.get("token");
    if (restaurantToDelete && token) {
      axios
        .delete(`${host}/restaurant/delete/${restaurantToDelete}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setRestaurants((prev) =>
            prev.filter((restaurant) => restaurant.id !== restaurantToDelete)
          );
          setDeleteModalVisible(false);
        })
        .catch((error) => {
          console.error("Ошибка при удалении:", error);
        });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setRestaurantToDelete(null);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Button
        type="primary"
        style={{ marginBottom: 20 }}
        onClick={() => {
          router.push("/dashboard/create");
        }}
      >
        Добавить
      </Button>
      <Row gutter={[16, 16]}>
        {restaurants.map((restaurant) => (
          <Col key={restaurant.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={
                <img
                  alt={restaurant.name}
                  src={restaurant.photo}
                  className="object-cover h-48 w-full"
                />
              }
              onClick={() =>
                router.push(`/dashboard/restaurants/${restaurant.id}`)
              }
            >
              <Card.Meta
                title={restaurant.name}
                description={restaurant.description}
              />
              <div className="mt-4 flex justify-between">
                <Button
                  danger
                  onClick={(e) => {
                    e.stopPropagation();
                    showDeleteModal(restaurant.id);
                  }}
                >
                  Удалить
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    
                    router.push(`/dashboard/restaurants/${restaurant.id}/edit`);
                  }}
                >
                  Изменить
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <ConfirmDeleteModal
        visible={deleteModalVisible}
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Restaurants;
