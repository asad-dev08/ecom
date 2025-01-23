import React from "react";
import {
  Truck,
  ShieldCheck,
  DollarSign,
  Phone,
  LucideIcon,
} from "lucide-react";
import { Card } from "antd";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  "shield-check": ShieldCheck,
  "currency-dollar": DollarSign,
  phone: Phone,
};

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  bgColor,
  iconColor,
}) => {
  const Icon = iconMap[icon];

  return (
    <Card className={`${bgColor} rounded-lg p-6 shadow-md hover:shadow-lg`}>
      <div className="flex items-center space-x-4">
        {Icon && <Icon className={`w-8 h-8 ${iconColor}`} />}
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </Card>
  );
};
