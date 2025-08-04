"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import VendorCatalog from './VendorCatalog'
import GuestGiftFlow from './GuestGiftFlow'
import { Gift, Heart, ShoppingBag, Store, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { EventDetail, GuestGiftManagementProps } from '@/lib/types'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'

const GiftManagementGuest = ({
    giftRegistry
}: GuestGiftManagementProps) => {
    const [loding, setLoading] = useState(false);
    const [event, setEvent] = useState<EventDetail | null>(null)
    const params = useParams()
    const eventId = params.eventId as string;

    const stats = {
        totalGifts: giftRegistry.length,
        availableGifts: giftRegistry.filter(gift => !gift.received).length,
        categories: Array.from(new Set(giftRegistry.map(gift => gift.category))).length
    }

    const fetchEvent = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/events/event-management/${eventId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch events");
            }

            const data = await response.json()
            setEvent(data.event)
        } catch (error) {
            console.error("Error fetching Events:", error);
            toast.error("Failed to load Events");
        } finally {
            setLoading(false)
        }
    }

    useEffect (() => {
        fetchEvent()
    }, [])

    const handleVendorProductAdd = (product: any) => {
    // Handle adding vendor product to registry
    console.log("Adding vendor product to registry:", product);
  };

    return (
        <motion.div
            key="guest"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 mb-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD]">
                <div className="container mx-auto px-4 py-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Gift className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-primary">{event?.eventName}</h1>
                                    <p className="text-muted-foreground">
                                        {event?.category} • {event?.date}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
                    >
                        <Card className="border-l-4 border-l-primary">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Registry Items</p>
                                    <p className="text-xl font-bold">{stats.totalGifts}</p>
                                </div>
                                <Gift className="w-6 h-6 text-primary" />
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Available</p>
                                    <p className="text-xl font-bold text-green-600">{stats.availableGifts}</p>
                                </div>
                                <ShoppingBag className="w-6 h-6 text-green-600" />
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Categories</p>
                                    <p className="text-xl font-bold text-purple-600">{stats.categories}</p>
                                </div>
                                <Store className="w-6 h-6 text-purple-600" />
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Tabs defaultValue="registry" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="registry" className="flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Gift Registry
                        </TabsTrigger>
                        <TabsTrigger value="vendors" className="flex items-center gap-2">
                            <Store className="w-4 h-4" />
                            Vendor Catalog
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="registry">
                        <GuestGiftFlow
                            eventName={event?.eventName!}
                            giftRegistry={giftRegistry} 
                            eventId={eventId}                        
                            />
                    </TabsContent>

                    <TabsContent value="vendors">
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-primary mb-2">Partner Vendor Catalog</h2>
                                <p className="text-muted-foreground">
                                    Browse curated products from our trusted vendor partners
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </motion.div>
    )
}

export default GiftManagementGuest
