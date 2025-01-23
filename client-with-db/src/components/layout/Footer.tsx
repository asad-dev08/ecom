import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Linkedin,
} from "lucide-react";
import api from "../../services/api";

export interface CompanyInfo {
  company_name: string;
  address?: string;
  phone: string;
  email: string;
  CompanyAdditionalInfo: {
    short_description?: string;
    facebook_link?: string;
    twitter_link?: string;
    instagram_link?: string;
    linkedin_link?: string;
    youtube_link?: string;
  }[];
}

export const Footer: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await api.get("/company-info");
        setCompanyInfo(response.data.data);
      } catch (error) {
        console.error("Error fetching company info:", error);
      }
    };

    fetchCompanyInfo();
  }, []);

  const socialLinks = companyInfo?.CompanyAdditionalInfo[0] || {};

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-400 mb-4">
              {companyInfo?.CompanyAdditionalInfo[0]?.short_description ||
                "Your one-stop shop for all your shopping needs. Quality products, great prices."}
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{companyInfo?.address}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                <span>{companyInfo?.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                <span>{companyInfo?.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white">
                  Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shipping" className="hover:text-white">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns-exchange" className="hover:text-white">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {socialLinks.facebook_link && (
                <a
                  href={socialLinks.facebook_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary-700"
                >
                  <Facebook className="w-6 h-6" />
                </a>
              )}
              {socialLinks.twitter_link && (
                <a
                  href={socialLinks.twitter_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary-700"
                >
                  <Twitter className="w-6 h-6" />
                </a>
              )}
              {socialLinks.instagram_link && (
                <a
                  href={socialLinks.instagram_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary-700"
                >
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {socialLinks.youtube_link && (
                <a
                  href={socialLinks.youtube_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary-700"
                >
                  <Youtube className="w-6 h-6" />
                </a>
              )}
              {socialLinks.linkedin_link && (
                <a
                  href={socialLinks.linkedin_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary-700"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {companyInfo?.company_name || "Company Name"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
