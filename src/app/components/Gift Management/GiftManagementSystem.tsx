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
      received: false
    }
  ];

  const handleVendorProductAdd = (product: any) => {
    // Handle adding vendor product to registry
    console.log("Adding vendor product to registry:", product);
  };

  const stats = {
    totalGifts: giftRegistry.length,
    totalValue: giftRegistry.reduce((sum, gift) => sum + gift.price, 0),
    availableGifts: giftRegistry.filter(gift => gift.received).length,
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
