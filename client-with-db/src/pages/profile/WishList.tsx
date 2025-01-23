import React, { useEffect, useState } from "react";
import { Card, Button, Empty } from "antd";
import api from "../../services/api";
import toast from "react-hot-toast";
import { BASE_URL } from "../../utils/actionTypes";

// Add interface for wishlist item
interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    thumbnail: string;
  };
}

const WishList: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await api.get("/wishlist");
        setWishlist(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch wishlist");
      }
    };

    fetchWishlist();
  }, []);

  
  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist((prev) =>
        prev.filter((item: any) => item.productId !== productId)
      );
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove from wishlist");
    }
  };

  return (
    <div>
      {wishlist.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <Card
              key={item.product.id}
              cover={
                <img
                  alt={item.product.name}
                  src={`${BASE_URL}/${item.product.thumbnail}`}
                  className="h-48 object-cover"
                />
              }
              actions={[
                <Button type="primary" className="bg-secondary-600">
                  Add to Cart
                </Button>,
                <Button
                  danger
                  onClick={() => handleRemoveFromWishlist(item.product.id)}
                >
                  Remove
                </Button>,
              ]}
            >
              <Card.Meta
                title={item.product.name}
                description={`$${item.product.price}`}
              />
            </Card>
          ))}
        </div>
      ) : (
        <Empty description="Your wishlist is empty" />
      )}
    </div>
  );
};

export default WishList;
