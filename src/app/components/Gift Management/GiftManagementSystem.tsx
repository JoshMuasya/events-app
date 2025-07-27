"use client"

import { EventInfo, GiftItem } from '@/lib/types';
import React from 'react'
import HostDashboard from './HostDashboard';

const GiftManagementSystem = () => {

  // Mock event data
  const eventInfo: EventInfo = {
    name: "Sarah & John's Wedding",
    host: "Sarah Johnson",
    date: "March 15, 2024",
    type: "Wedding",
    guestCount: 120
  };

  // Mock gift registry
  const giftRegistry: GiftItem[] = [
    {
      id: "1",
      name: "Crystal Wine Glasses Set",
      description: "Elegant crystal wine glasses perfect for special occasions and romantic dinners",
      price: 8500,
      image: "https://images.unsplash.com/photo-1566834308134-a5e0ad1f64e3?w=400&h=400&fit=crop",
      vendor: "HomeEssentials",
      category: "Kitchen",
      available: true
    },
    {
      id: "2",
      name: "Premium Coffee Maker",
      description: "Professional-grade coffee maker with multiple brewing options and timer function",
      price: 15000,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
      vendor: "TechHome",
      category: "Kitchen",
      available: true
    },
    {
      id: "3",
      name: "Luxury Bedsheet Set",
      description: "100% Egyptian cotton bedsheet set with matching pillowcases in Queen size",
      price: 12000,
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop",
      vendor: "ComfortLiving",
      category: "Home",
      available: true
    },
    {
      id: "4",
      name: "Kitchen Stand Mixer",
      description: "Heavy-duty stand mixer with multiple attachments for all your baking needs",
      price: 25000,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
      vendor: "KitchenPro",
      category: "Kitchen",
      available: false
    },
    {
      id: "5",
      name: "Elegant Dinnerware Set",
      description: "12-piece ceramic dinnerware set with beautiful floral patterns",
      price: 18000,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      vendor: "HomeElegance",
      category: "Dining",
      available: true
    },
    {
      id: "6",
      name: "Smart Home Speaker",
      description: "Voice-controlled smart speaker with premium sound quality and home automation",
      price: 9500,
      image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400&h=400&fit=crop",
      vendor: "TechHome",
      category: "Electronics",
      available: true
    }
  ];

  const handleVendorProductAdd = (product: any) => {
    // Handle adding vendor product to registry
    console.log("Adding vendor product to registry:", product);
  };

  const stats = {
    totalGifts: giftRegistry.length,
    totalValue: giftRegistry.reduce((sum, gift) => sum + gift.price, 0),
    availableGifts: giftRegistry.filter(gift => gift.available).length,
    categories: Array.from(new Set(giftRegistry.map(gift => gift.category))).length
  };

  return (
    <HostDashboard
      eventInfo={eventInfo}
      giftRegistry={giftRegistry}
    />
  );
}

export default GiftManagementSystem
