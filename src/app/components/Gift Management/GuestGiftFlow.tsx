"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GiftItem, GuestGiftFlowProps } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge, Building, CreditCard, Gift, MessageSquare, Search, Smartphone } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import GiftCard from './GiftCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from 'recharts';
import { Switch } from '@/components/ui/switch';

const GuestGiftFlow = ({ eventName, hostName, giftRegistry }: GuestGiftFlowProps) => {
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [currentStep, setCurrentStep] = useState<"browse" | "checkout" | "complete">("browse");
  const [wishlist, setWishlist] = useState<string[]>([]);

  const categories = ["all", ...Array.from(new Set(giftRegistry.map((gift: { category: any; }) => gift.category)))];

  const filteredGifts = giftRegistry.filter(gift => {
    const matchesSearch = gift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gift.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || gift.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGiftSelect = (gift: GiftItem) => {
    setSelectedGift(gift);
    setCurrentStep("checkout");
  };

  const toggleWishlist = (gift: GiftItem) => {
    setWishlist(prev => 
      prev.includes(gift.id) 
        ? prev.filter(id => id !== gift.id)
        : [...prev, gift.id]
    );
  };

  const handlePurchase = (paymentMethod: string) => {
    // Simulate purchase process
    setTimeout(() => {
      setCurrentStep("complete");
      toast(`Gift Purchase Successful! 🎁Your gift for ${hostName} has been purchased successfully.`,);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-light/5 to-gold/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            Gift Registry
          </h1>
          <p className="text-muted-foreground">
            Choose a perfect gift for <span className="text-gold font-semibold">{hostName}</span>'s {eventName}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentStep === "browse" && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search gifts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                      {categories.map((category) => (
                        <Badge
                          key={category}
                          className={`cursor-pointer whitespace-nowrap ${
                            selectedCategory === category 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-primary/10"
                          }`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gift Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGifts.map((gift) => (
                  <GiftCard
                    key={gift.id}
                    gift={gift}
                    onSelect={handleGiftSelect}
                    onWishlist={toggleWishlist}
                    isWishlisted={wishlist.includes(gift.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === "checkout" && selectedGift && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <Button
                variant="outline"
                onClick={() => setCurrentStep("browse")}
                className="mb-4"
              >
                ← Back to Registry
              </Button>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-gold" />
                    Gift Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <img
                      src={selectedGift.image}
                      alt={selectedGift.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{selectedGift.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedGift.description}</p>
                      <p className="text-lg font-bold text-gold">KSh {selectedGift.price.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gold" />
                    Personal Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Write a heartfelt message to the host..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                    />
                    <Label>Send gift anonymously</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-primary/10"
                      onClick={() => handlePurchase("mpesa")}
                    >
                      <Smartphone className="w-6 h-6 text-green-600" />
                      <span>M-Pesa</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-primary/10"
                      onClick={() => handlePurchase("card")}
                    >
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <span>Card</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-primary/10"
                      onClick={() => handlePurchase("bank")}
                    >
                      <Building className="w-6 h-6 text-purple-600" />
                      <span>Bank Transfer</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md mx-auto text-center"
            >
              <Card>
                <CardContent className="p-8 space-y-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto">
                      <Gift className="w-8 h-8 text-gold" />
                    </div>
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary mb-2">
                      Gift Sent Successfully! 🎉
                    </h2>
                    <p className="text-muted-foreground">
                      Your gift for {hostName} has been purchased and will be delivered to the event venue.
                    </p>
                  </div>
                  <Button
                    onClick={() => setCurrentStep("browse")}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Send Another Gift
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default GuestGiftFlow
