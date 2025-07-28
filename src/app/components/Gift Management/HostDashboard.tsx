"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { storage } from '@/lib/firebase';
import { EventDetail, GiftManagementProps, ReceivedGift, RegistryItem } from '@/lib/types';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { motion } from 'framer-motion';
import { Badge, Check, DollarSign, Download, Edit, Gift, Heart, MapPin, Package, Plus, Trash } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

const HostDashboard = ({ eventInfo, giftRegistry }: GiftManagementProps) => {
    const [deliveryLocation, setDeliveryLocation] = useState("event-venue");
    const [newItemName, setNewItemName] = useState("");
    const [newItemDescription, setNewItemDescription] = useState("");
    const [newItemPrice, setNewItemPrice] = useState("");
    const [newItemLink, setNewItemLink] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const params = useParams()
    const eventId = params.eventId as string;
    const [loading, setLoading] = useState(false)
    const [event, setEvent] = useState<EventDetail | null>(null)
    const [imagePreview, setImagePreview] = useState("");
    const [newItemImage, setNewItemImage] = useState<File | null>(null);
    const [newItemVendor, setNewItemVendor] = useState("");
    const [newItemCategory, setNewItemCategory] = useState("");
    const [editItemId, setEditItemId] = useState<string | null>(null);
    const [registry, setRegistry] = useState<RegistryItem[]>([])

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
            setRegistry(registryItems);
        } catch (error: any) {
            console.error("Error fetching registry items:", error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvent()
        fetchRegistry()
    }, [])

    // Mock data
    const [receivedGifts, setReceivedGifts] = useState<ReceivedGift[]>([
        {
            id: "1",
            giftName: "Crystal Wine Glasses Set",
            senderName: "Sarah Johnson",
            message: "Wishing you a lifetime of happiness together! ❤️",
            amount: 8500,
            isAnonymous: false,
            timestamp: new Date(),
            status: "pending",
            image: "https://images.unsplash.com/photo-1566834308134-a5e0ad1f64e3?w=200&h=200&fit=crop"
        },
        {
            id: "2",
            giftName: "Kitchen Stand Mixer",
            senderName: "Anonymous",
            message: "Hope this helps you create beautiful memories in your new kitchen!",
            amount: 25000,
            isAnonymous: true,
            timestamp: new Date(Date.now() - 3600000),
            status: "confirmed",
            image: "https://images.unsplash.com/photo-1587736604969-e9d5471ab7eb?w=200&h=200&fit=crop"
        }
    ]);

    const totalValue = receivedGifts.reduce((sum, gift) => sum + gift.amount, 0);
    const confirmedGifts = receivedGifts.filter(gift => gift.status === "confirmed").length;
    const pendingGifts = receivedGifts.filter(gift => gift.status === "pending").length;

    const handleSendThankYou = (giftId: string) => {
        setReceivedGifts(prev =>
            prev.map(gift =>
                gift.id === giftId ? { ...gift, status: "thanked" } : gift
            )
        );
        toast("Thank You Sent! Your thank you message has been sent.");
    };

    // Handle image file selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setNewItemImage(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            toast.error("Please select a valid image file (PNG, JPEG)");
            setNewItemImage(null);
            setImagePreview("");
        }
    };

    // Upload image to Firebase Storage
    const uploadImage = async (file: File | null): Promise<string | null> => {
        if (!file) return null;
        try {
            const storageRef = ref(storage, `registry_images/${eventId}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading image:", error);
            throw new Error("Failed to upload image");
        }
    };

    const handleAddToRegistry = async () => {
        if (!newItemName || !newItemDescription || !newItemPrice) {
            toast.error("Please fill all required fields")
            return
        }

        let imageUrl = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop";
        if (newItemImage) {
            try {
                const uploadedUrl = await uploadImage(newItemImage);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            } catch (error) {
                toast.error("Failed to upload image");
                return;
            }
        }

        const registryData = {
            eventId,
            name: newItemName,
            description: newItemDescription,
            price: parseFloat(newItemPrice),
            image: imageUrl,
            vendor: newItemVendor,
            category: newItemCategory,
            link: newItemLink,
            received: false,
        };

        try {
            const endpoint = editItemId ? `/api/registry/item/${editItemId}` : '/api/registry';
            const method = editItemId ? 'PATCH' : 'POST';
            console.log("Sending request to:", endpoint, "Method:", method, "Data:", registryData); // Debug log
            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registryData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData); // Debug log
                throw new Error(`Failed to ${editItemId ? 'update' : 'add'} registry item: ${errorData.error || 'Unknown error'}`);
            }
            const updatedItem = await response.json();
            if (editItemId) {
                setRegistry((prev) => prev.map(item => item.id === editItemId ? updatedItem : item));
            } else {
                setRegistry((prev) => [...prev, updatedItem]);
            }
            setNewItemName("");
            setNewItemDescription("");
            setNewItemPrice("");
            setNewItemLink("");
            setNewItemImage(null);
            setNewItemVendor("");
            setNewItemCategory("");
            setImagePreview("");
            setIsAddDialogOpen(false);
            setEditItemId(null);
            toast.success(`Registry item ${editItemId ? 'updated' : 'added'} successfully`);
        } catch (error) {
            console.error(`Error ${editItemId ? 'updating' : 'adding'} registry item:`, error);
            toast.error(`Failed to ${editItemId ? 'update' : 'add'} registry item`);
        }
    };

    // Delete registry item
    const handleDeleteRegistryItem = async (itemId: string) => {
        try {
            const response = await fetch(`/api/registry/item/${itemId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error("Failed to delete registry item");
            setRegistry((prev) => prev.filter(item => item.id !== itemId));
            toast.success("Registry item deleted successfully");
        } catch (error) {
            console.error("Error deleting registry item:", error);
            toast.error("Failed to delete registry item");
        }
    };

    // Edit registry item
    const handleEditRegistryItem = (item: any) => {
        console.log("Editing item with id:", item.id); // Debug log
        setNewItemName(item.name);
        setNewItemDescription(item.description);
        setNewItemPrice(item.price.toString());
        setNewItemLink(item.link || "");
        setNewItemImage(null);
        setImagePreview(item.image);
        setNewItemVendor(item.vendor || "");
        setNewItemCategory(item.category || "");
        setEditItemId(item.id);
        setIsAddDialogOpen(true);
    };

    // Confirm gift
    const handleConfirmGift = async (giftId: string) => {
        // try {
        //   const response = await fetch(`/api/gifts/${giftId}`, {
        //     method: 'PATCH',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ status: 'confirmed' }),
        //   });
        //   if (!response.ok) throw new Error("Failed to confirm gift");
        //   setReceivedGifts((prev) =>
        //     prev.map((gift) =>
        //       gift.id === giftId ? { ...gift, status: 'confirmed' } : gift
        //     )
        //   );
        //   const gift = receivedGifts.find(g => g.id === giftId);
        //   const registryItem = registry.find(r => r.name === gift.giftName);
        //   if (registryItem && !registryItem.received) {
        //     await fetch(`/api/registry/${registryItem.id}`, {
        //       method: 'PATCH',
        //       headers: { 'Content-Type': 'application/json' },
        //       body: JSON.stringify({ received: true }),
        //     });
        //     setRegistry((prev) =>
        //       prev.map((item) =>
        //         item.id === registryItem.id ? { ...item, received: true } : item
        //       )
        //     );
        //   }
        //   toast.success("Gift confirmed successfully");
        // } catch (error) {
        //   console.error("Error confirming gift:", error);
        //   toast.error("Failed to confirm gift");
        // }
    };

    // Delete gift
    const handleDeleteGift = async (giftId: string) => {
        try {
            const response = await fetch(`/api/gifts/${giftId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error("Failed to delete gift");
            setReceivedGifts((prev) => prev.filter((gift) => gift.id !== giftId));
            toast.success("Gift deleted successfully");
        } catch (error) {
            console.error("Error deleting gift:", error);
            toast.error("Failed to delete gift");
        }
    };

    const exportGiftList = () => {
        toast("Export Started Your gift list is being prepared for download.");
    };

    const handleVendorProductAdd = (product: any) => {
        console.log("Adding vendor product to registry:", product);
    };

    const stats = {
        totalGifts: giftRegistry.length,
        totalValue: giftRegistry.reduce((sum, gift) => sum + gift.price, 0),
        availableGifts: giftRegistry.filter(gift => gift.available).length,
        categories: Array.from(new Set(giftRegistry.map(gift => gift.category))).length
    }

    const formVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: {
            opacity: 1,
            height: "auto",
            transition: {
                opacity: { duration: 0.3 },
                height: { duration: 0.4, ease: "easeOut" },
            },
        },
        exit: {
            opacity: 0,
            height: 0,
            transition: {
                opacity: { duration: 0.2 },
                height: { duration: 0.3, ease: "easeIn" },
            },
        },
    };

    return (
        <div className="my-24 min-h-screen bg-[rgba(255,215,0,0.2)] backdrop-blur-md w-2/3">
            <div className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                    variants={formVariants}
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-[#6A0DAD] mb-2">
                        Gift Management Dashboard
                    </h1>
                    <p className="text-[#6A0DAD]/70">
                        Manage your gift registry and track received gifts
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    variants={formVariants}
                    className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#6A0DAD]/10 rounded-lg">
                                <Gift className="w-6 h-6 text-[#6A0DAD]" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-[#6A0DAD]">{event?.eventName}</h1>
                                <p className="text-[#6A0DAD]/70">
                                    {event?.category} • {event?.date} • {event?.tags}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    variants={formVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 mb-8"
                >
                    <Card className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md shadow-[0_4px_12px_rgba(106,13,173,0.3)] border-l-4 border-l-[#6A0DAD]">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-[#6A0DAD]/70">Registry Items</p>
                                <p className="text-xl font-bold text-[#6A0DAD]">{registry.length}</p>
                            </div>
                            <Gift className="w-6 h-6 text-[#6A0DAD]" />
                        </CardContent>
                    </Card>

                    <Card className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md shadow-[0_4px_12px_rgba(106,13,173,0.3)] border-l-4 border-l-[#FFD700]">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-[#6A0DAD]/70">Total Value</p>
                                <p className="text-xl font-bold text-[#6A0DAD]">
                                    KSh {totalValue.toLocaleString()}
                                </p>
                            </div>
                            <DollarSign className="w-6 h-6 text-[#6A0DAD]" />
                        </CardContent>
                    </Card>

                    <Card className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md shadow-[0_4px_12px_rgba(106,13,173,0.3)] border-l-4 border-l-[#6A0DAD]">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-[#6A0DAD]/70">Confirmed</p>
                                <p className="text-xl font-bold text-[#6A0DAD]">{confirmedGifts}</p>
                            </div>
                            <Check className="w-6 h-6 text-[#6A0DAD]" />
                        </CardContent>
                    </Card>

                    <Card className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md shadow-[0_4px_12px_rgba(106,13,173,0.3)] border-l-4 border-l-[#FFD700]">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-[#6A0DAD]/70">Pending</p>
                                <p className="text-xl font-bold text-[#6A0DAD]">{pendingGifts}</p>
                            </div>
                            <Package className="w-6 h-6 text-[#6A0DAD]" />
                        </CardContent>
                    </Card>
                </motion.div>

                <Tabs defaultValue="gifts" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 bg-[#6A0DAD] text-white">
                        <TabsTrigger value="gifts" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#6A0DAD]">Received Gifts</TabsTrigger>
                        <TabsTrigger value="registry" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#6A0DAD]">Gift Registry</TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-[#6A0DAD]">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="gifts" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-[#6A0DAD]">Received Gifts</h2>
                            <Button onClick={exportGiftList} className="bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]">
                                <Download className="w-4 h-4 mr-2" />
                                Export List
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {receivedGifts.map((gift, index) => (
                                <motion.div
                                    key={gift.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    variants={formVariants}
                                >
                                    <Card className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md shadow-[0_4px_12px_rgba(106,13,173,0.3)]">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <img
                                                    src={gift.image}
                                                    alt={gift.giftName}
                                                    className="w-full md:w-24 h-24 object-cover rounded-lg"
                                                />
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-semibold text-[#6A0DAD]">{gift.giftName}</h3>
                                                            <p className="text-sm text-[#6A0DAD]/70">
                                                                From: {gift.isAnonymous ? "Anonymous Sender" : gift.senderName}
                                                            </p>
                                                            <p className="text-sm text-[#FFD700] font-semibold">
                                                                KSh {gift.amount.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <Badge className="bg-[#6A0DAD] text-white">
                                                            {gift.status}
                                                        </Badge>
                                                    </div>
                                                    {gift.message && (
                                                        <div className="bg-[#6A0DAD]/10 p-3 rounded-lg">
                                                            <p className="text-sm italic text-[#6A0DAD]">{gift.message}</p>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        {gift.status === "pending" && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleConfirmGift(gift.id)}
                                                                className="bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                                                            >
                                                                <Check className="w-4 h-4 mr-1" />
                                                                Confirm Received
                                                            </Button>
                                                        )}
                                                        {gift.status === "confirmed" && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleSendThankYou(gift.id)}
                                                                className="bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                                                            >
                                                                <Heart className="w-4 h-4 mr-1" />
                                                                Send Thank You
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDeleteGift(gift.id)}
                                                            className="bg-red-600 text-white hover:bg-red-700"
                                                        >
                                                            <Trash className="w-4 h-4 mr-1" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="registry" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-[#6A0DAD]">Gift Registry</h2>
                            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                                setIsAddDialogOpen(open);
                                if (!open) {
                                    setEditItemId(null);
                                    setNewItemName("");
                                    setNewItemDescription("");
                                    setNewItemPrice("");
                                    setNewItemLink("");
                                    setNewItemImage(null);
                                    setNewItemVendor("");
                                    setNewItemCategory("");
                                    setImagePreview("");
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button className="bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Item
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md shadow-[0_4px_12px_rgba(106,13,173,0.3)]">
                                    <DialogHeader>
                                        <DialogTitle className="text-[#6A0DAD]">
                                            {editItemId ? "Edit Registry Item" : "Add New Registry Item"}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <Input
                                            placeholder="Item name"
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            className="bg-white text-[#6A0DAD] border-[#6A0DAD]"
                                        />
                                        <Textarea
                                            placeholder="Description"
                                            value={newItemDescription}
                                            onChange={(e) => setNewItemDescription(e.target.value)}
                                            className="bg-white text-[#6A0DAD] border-[#6A0DAD]"
                                        />
                                        <Input
                                            placeholder="Price (KSh)"
                                            type="number"
                                            value={newItemPrice}
                                            onChange={(e) => setNewItemPrice(e.target.value)}
                                            className="bg-white text-[#6A0DAD] border-[#6A0DAD]"
                                        />
                                        <Input
                                            placeholder="Product link (optional)"
                                            value={newItemLink}
                                            onChange={(e) => setNewItemLink(e.target.value)}
                                            className="bg-white text-[#6A0DAD] border-[#6A0DAD]"
                                        />
                                        <div>
                                            <label className="text-sm text-[#6A0DAD] mb-1 block">Upload Image (optional)</label>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="bg-white text-[#6A0DAD] border-[#6A0DAD]"
                                            />
                                            {imagePreview && (
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="mt-2 w-32 h-32 object-cover rounded-md"
                                                />
                                            )}
                                        </div>
                                        <Input
                                            placeholder="Vendor (e.g., Amazon, HomeDepot)"
                                            value={newItemVendor}
                                            onChange={(e) => setNewItemVendor(e.target.value)}
                                            className="bg-white text-[#6A0DAD] border-[#6A0DAD]"
                                        />
                                        <Input
                                            placeholder="Category (e.g., Kitchen, Furniture)"
                                            value={newItemCategory}
                                            onChange={(e) => setNewItemCategory(e.target.value)}
                                            className="bg-white text-[#6A0DAD] border-[#6A0DAD]"
                                        />
                                        <Button
                                            onClick={handleAddToRegistry}
                                            className="w-full bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                                        >
                                            {editItemId ? "Update Item" : "Add to Registry"}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {registry.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    variants={formVariants}
                                >
                                    <Card className={`relative bg-[rgba(255,215,0,0.2)] backdrop-blur-md shadow-[0_4px_12px_rgba(106,13,173,0.3)] ${item.received ? 'opacity-75' : ''}`}>
                                        {item.received && (
                                            <div className="absolute top-2 right-2 z-10">
                                                <Badge className="bg-[#6A0DAD] text-white">
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Received
                                                </Badge>
                                            </div>
                                        )}
                                        <div className="aspect-square overflow-hidden rounded-t-lg">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold mb-2 text-[#6A0DAD]">{item.name}</h3>
                                            <p className="text-sm text-[#6A0DAD]/70 mb-2">{item.description}</p>
                                            <p className="text-sm text-[#6A0DAD]/70 mb-2">Category: {item.category}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-[#FFD700]">
                                                    KSh {item.price.toLocaleString()}
                                                </span>
                                                <Badge className="bg-[#6A0DAD] text-white">{item.vendor}</Badge>
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleEditRegistryItem(item)}
                                                    className="bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDeleteRegistryItem(item.id)}
                                                    className="bg-red-600 text-white hover:bg-red-700"
                                                >
                                                    <Trash className="w-4 h-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <Card className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md shadow-[0_4px_12px_rgba(106,13,173,0.3)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#6A0DAD]">
                                    <MapPin className="w-5 h-5" />
                                    Delivery Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-[#6A0DAD]">Preferred Delivery Location</label>
                                    <select
                                        value={deliveryLocation}
                                        onChange={(e) => setDeliveryLocation(e.target.value)}
                                        className="w-full p-2 border border-[#6A0DAD] rounded-md bg-white text-[#6A0DAD]"
                                    >
                                        <option value="event-venue">Event Venue</option>
                                        <option value="home">Home Address</option>
                                        <option value="office">Office Address</option>
                                    </select>
                                </div>
                                <Button className="bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]">
                                    Save Preferences
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default HostDashboard