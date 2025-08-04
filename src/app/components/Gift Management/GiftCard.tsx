import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GiftCardProps } from '@/lib/types';
import { motion } from 'framer-motion';
import { Badge, Heart, ShoppingCart } from 'lucide-react';
import React, { useState } from 'react'

const GiftCard = ({ gift, onSelect, onWishlist, isWishlisted = false }: GiftCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <Card className="group relative overflow-hidden border-purple-light/20 hover:border-gold/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                <div className="relative">
                    <div className="aspect-square overflow-hidden">
                        <img
                            src={gift.image}
                            alt={gift.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>

                    {/* Overlay on hover */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        className="absolute inset-0 bg-primary/80 flex items-center justify-center"
                    >
                        <Button
                            onClick={() => onSelect(gift)}
                            className="bg-gold text-gold-foreground hover:bg-gold/90"
                            disabled={gift.received}
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {!gift.received ? "Select Gift" : "Unavailable"}
                        </Button>
                    </motion.div>

                    {/* Wishlist button */}
                    {onWishlist && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm hover:bg-card"
                            onClick={() => onWishlist(gift)}
                        >
                            <Heart
                                className={`w-4 h-4 ${isWishlisted ? "fill-destructive text-destructive" : ""
                                    }`}
                            />
                        </Button>
                    )}

                    {/* Vendor badge */}
                    <Badge
                        className="absolute top-2 left-2 bg-card/80 backdrop-blur-sm"
                    >
                        {gift.vendor}
                    </Badge>
                </div>

                <CardContent className="p-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-card-foreground line-clamp-1">
                            {gift.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {gift.description}
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gold">
                                KSh {gift.price.toLocaleString()}
                            </span>
                            <Badge className="text-xs">
                                {gift.category}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default GiftCard
