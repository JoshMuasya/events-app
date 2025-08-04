"use client"

import React, { useEffect, useState } from 'react'
import GiftManagementGuest from './GiftManagementGuest';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';
import { RegistryItem } from '@/lib/types';

const GuestGift = () => {
  const [loading, setLoading] = useState(false);
  const params = useParams()
  const eventId = params.eventId as string;
  const [registry, setRegistry] = useState<RegistryItem[]>([])

  const fetchRegistry = async () => {
    try {
      setLoading(true);
      console.log("Fetching registry for eventId:", eventId);
      const response = await fetch(`/api/registry/${eventId}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(`Failed to fetch registry items: ${errorData.error || 'Unknown error'}`);
      }
      const registryItems = await response.json();
      console.log("Fetched registry items:", registryItems);
      // Ensure all items have a valid price
      const sanitizedItems = registryItems.map((item: RegistryItem) => ({
        ...item,
        price: typeof item.price === 'number' ? item.price : 0, // Default to 0 if price is undefined
      }));
      setRegistry(sanitizedItems);
    } catch (error: any) {
      console.error("Error fetching registry items:", error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistry()
  }, [])

  return (
    <div className='my-14'>
      <GiftManagementGuest giftRegistry={registry} />
    </div>
  )
}

export default GuestGift
