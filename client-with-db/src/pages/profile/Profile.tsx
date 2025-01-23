import React from "react";
import { Spin, Tabs } from "antd";
import ProfileInfo from "./ProfileInfo";
import OrderHistory from "./OrderHistory";
import { AddressList } from "../../components/profile/AddressList";
import WishList from "./WishList";
import { useCustomerAuth } from "../../hooks/useCustomerAuth";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";

const { TabPane } = Tabs;

const Profile: React.FC = () => {
  const { customer } = useCustomerAuth();

  // Fetch current user data
  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", customer?.id],
    queryFn: async () => {
      const response = await api.get("/profile");
      return response.data.data;
    },
    enabled: !!customer?.id, // Only fetch if we have a customer ID
  });

  if (!customer) return null;
  if (isLoading)
    return <Spin size="large" className="flex justify-center my-8" />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <img
            src={"https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
            alt={userData?.first_name}
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {`${userData?.first_name} ${userData?.last_name}`}
            </h1>
            <p className="text-gray-500">{userData?.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <Tabs defaultActiveKey="profile" className="p-6">
          <TabPane key="profile" tab="Profile Information">
            <ProfileInfo
              user={{
                first_name: userData?.first_name,
                last_name: userData?.last_name,
                email: userData?.email,
                id: userData?.id,
                phone: userData?.phone,
              }}
            />
          </TabPane>
          <TabPane key="orders" tab="Order History">
            <OrderHistory />
          </TabPane>
          <TabPane key="addresses" tab="My Addresses">
            <AddressList />
          </TabPane>
          <TabPane key="wishlist" tab="Wishlist">
            <WishList />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
