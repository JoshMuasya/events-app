"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { VendorCatalogProps, VendorProduct } from '@/lib/types';
import { motion } from 'framer-motion';
import { Badge, Search, Shield, ShoppingCart, Star, Truck } from 'lucide-react';
import React, { useState } from 'react'

const VendorCatalog = ({ onAddToRegistry }: VendorCatalogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState("all");

  // Mock vendor products data
  const vendorProducts: VendorProduct[] = [
    {
      id: "v1",
      name: "Professional Kitchen Stand Mixer",
      description: "High-performance stand mixer with 6-quart bowl and multiple attachments",
      price: 28500,
      originalPrice: 32000,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
      vendor: {
        name: "KitchenPro Kenya",
        logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
        rating: 4.8,
        deliveryTime: "2-3 days"
      },
      category: "Kitchen",
      inStock: true,
      rating: 4.7,
      reviewCount: 234,
      features: ["6Qt Bowl", "10 Speeds", "Dishwasher Safe", "2 Year Warranty"]
    },
    {
      id: "v2", 
      name: "Elegant Crystal Dinnerware Set",
      description: "24-piece crystal dinnerware set perfect for special occasions",
      price: 15750,
      originalPrice: 18000,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      vendor: {
        name: "HomeElegance",
        logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
        rating: 4.6,
        deliveryTime: "1-2 days"
      },
      category: "Dining",
      inStock: true,
      rating: 4.5,
      reviewCount: 89,
      features: ["24 Pieces", "Crystal Glass", "Dishwasher Safe", "Gift Box Included"]
    },
    {
      id: "v3",
      name: "Premium Bedsheet Set",
      description: "Luxury 100% cotton bedsheet set with pillowcases",
      price: 8900,
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop",
      vendor: {
        name: "ComfortLiving",
        logo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop",
        rating: 4.9,
        deliveryTime: "1-2 days"
      },
      category: "Home",
      inStock: true,
      rating: 4.8,
      reviewCount: 156,
      features: ["100% Cotton", "Queen Size", "4 Piece Set", "Machine Washable"]
    },
    {
      id: "v4",
      name: "Smart Coffee Maker",
      description: "WiFi-enabled coffee maker with programmable settings",
      price: 22000,
      originalPrice: 25000,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
      vendor: {
        name: "TechHome",
        logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop",
        rating: 4.7,
        deliveryTime: "2-4 days"
      },
      category: "Kitchen",
      inStock: true,
      rating: 4.6,
      reviewCount: 178,
      features: ["WiFi Enabled", "Programmable", "12 Cup Capacity", "Auto Shutdown"]
    }
  ];

  const categories = ["all", ...Array.from(new Set(vendorProducts.map(p => p.category)))];
  const vendors = ["all", ...Array.from(new Set(vendorProducts.map(p => p.vendor.name)))];

  const filteredProducts = vendorProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesVendor = selectedVendor === "all" || product.vendor.name === selectedVendor;
    return matchesSearch && matchesCategory && matchesVendor;
  });

  const topVendors = Array.from(new Set(vendorProducts.map(p => p.vendor)))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Vendor Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold" />
            Trusted Partner Vendors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topVendors.map((vendor, index) => (
              <motion.div
                key={vendor.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-4 border border-purple-light/30 rounded-lg hover:border-gold/50 transition-colors"
              >
                <img
                  src={vendor.logo}
                  alt={vendor.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{vendor.name}</h4>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{vendor.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Truck className="w-3 h-3" />
                    {vendor.deliveryTime}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search vendor products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {vendors.map(vendor => (
                  <option key={vendor} value={vendor}>
                    {vendor === "all" ? "All Vendors" : vendor}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-gold/50">
              <div className="relative">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                
                {/* Discount badge */}
                {product.originalPrice && (
                  <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </Badge>
                )}

                {/* Stock status */}
                <Badge
                  className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm"
                >
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </Badge>

                {/* Quick actions overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onAddToRegistry(product)}
                      className="bg-gold text-gold-foreground hover:bg-gold/90"
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Registry
                    </Button>
                  </div>
                </motion.div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Vendor info */}
                <div className="flex items-center gap-2">
                  <img
                    src={product.vendor.logo}
                    alt={product.vendor.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs text-muted-foreground">{product.vendor.name}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{product.vendor.rating}</span>
                  </div>
                </div>

                {/* Product details */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-1">
                    {product.features.slice(0, 2).map((feature, idx) => (
                      <Badge key={idx} className="text-xs px-2 py-0">
                        {feature}
                      </Badge>
                    ))}
                    {product.features.length > 2 && (
                      <Badge className="text-xs px-2 py-0">
                        +{product.features.length - 2} more
                      </Badge>
                    )}
                  </div>

                  {/* Price and rating */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gold">
                          KSh {product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            KSh {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[1,2,3,4,5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= product.rating 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({product.reviewCount})
                        </span>
                      </div>
                    </div>
                    <Badge className="text-xs">
                      {product.category}
                    </Badge>
                  </div>

                  {/* Delivery info */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Truck className="w-3 h-3" />
                    <span>Delivery: {product.vendor.deliveryTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-muted-foreground">
            No products found matching your criteria.
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default VendorCatalog
