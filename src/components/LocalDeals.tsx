import { useState, useEffect } from 'react';
import { MapPin, Clock, Star, Gift } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useYogicData } from '@/hooks/use-yogic-data';
import { cn } from '@/lib/utils';

interface CouponData {
  id: string;
  title: string;
  description: string;
  discount_percent: number;
  min_steps_required: number;
  regions: string[];
  expiry_date: string;
  merchant_name: string;
  image_url?: string;
  terms?: string;
}

interface LocalDealsProps {
  className?: string;
}

export const LocalDeals = ({ className = "" }: LocalDealsProps) => {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponData | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');
  const { user } = useAuth();
  const yogicDataResult = useYogicData();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);

      // Get user's location preference (mock for now)
      const userLocation = {
        city: 'Hyderabad',
        district: 'Hyderabad', 
        state: 'Telangana',
        country: 'India'
      };

      const locationFilters = [
        userLocation.city,
        userLocation.district,
        userLocation.state,
        userLocation.country
      ].filter(Boolean);

      const { data: allCoupons, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching coupons:', error);
        return;
      }

      if (!allCoupons) {
        setIsLoading(false);
        return;
      }

      // Filter coupons by location
      const filteredCoupons = allCoupons.filter(coupon => {
        const couponRegions = coupon.regions || [];
        return locationFilters.some(location => 
          couponRegions.includes(location)
        );
      });

      // Sort by location specificity and min_steps
      const sortedCoupons = filteredCoupons.sort((a, b) => {
        const getLocationScore = (regions: string[]) => {
          if (regions.includes(userLocation.city)) return 4;
          if (regions.includes(userLocation.district)) return 3;
          if (regions.includes(userLocation.state)) return 2;
          if (regions.includes(userLocation.country)) return 1;
          return 0;
        };

        const scoreA = getLocationScore(a.regions);
        const scoreB = getLocationScore(b.regions);
        
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.min_steps_required - b.min_steps_required;
      });

      setCoupons(sortedCoupons);
    } catch (error) {
      console.error('Error in fetchCoupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemCoupon = async (coupon: CouponData) => {
    if (!user || !yogicDataResult) return;

    const userTotalSteps = yogicDataResult.user.totalLifetimeSteps || 0;

    if (userTotalSteps < coupon.min_steps_required) {
      return; // Button should be disabled, but extra safety check
    }

    setIsRedeeming(true);
    try {
      // Generate redemption code
      const code = `${coupon.merchant_name.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Insert redemption record
      const { error } = await supabase
        .from('coupon_redemptions')
        .insert({
          coupon_id: coupon.id,
          user_id: user.id,
          redemption_code: code,
          status: 'redeemed'
        });

      if (error) {
        console.error('Error redeeming coupon:', error);
        return;
      }

      setRedemptionCode(code);
      setSelectedCoupon(coupon);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error in handleRedeemCoupon:', error);
    } finally {
      setIsRedeeming(false);
    }
  };

  const canAffordCoupon = (coupon: CouponData): boolean => {
    const userTotalSteps = yogicDataResult.user.totalLifetimeSteps || 0;
    return userTotalSteps >= coupon.min_steps_required;
  };

  const getStepsNeeded = (coupon: CouponData): number => {
    const userTotalSteps = yogicDataResult.user.totalLifetimeSteps || 0;
    return Math.max(0, coupon.min_steps_required - userTotalSteps);
  };

  const formatExpiry = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center space-x-2 mb-4">
          <Gift className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">🏪 Local Deals & Coupons</h3>
        </div>
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-secondary/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No local offers today, keep walking for more rewards!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center space-x-2 mb-4">
          <Gift className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">🏪 Local Deals & Coupons</h3>
        </div>

        <div className="grid gap-3">
          {coupons.map((coupon) => {
            const canRedeem = canAffordCoupon(coupon);
            const stepsNeeded = getStepsNeeded(coupon);

            return (
              <Card 
                key={coupon.id} 
                className="transition-all duration-200 hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Merchant Logo */}
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg overflow-hidden">
                      {coupon.image_url ? (
                        <img 
                          src={coupon.image_url} 
                          alt={coupon.merchant_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {coupon.merchant_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Coupon Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm leading-tight">
                          {coupon.title}
                        </h4>
                        {coupon.discount_percent > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {coupon.discount_percent}% off
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {coupon.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{coupon.merchant_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Until {formatExpiry(coupon.expiry_date)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Step Requirement */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs">
                          {canRedeem ? (
                            <span className="text-green-600 font-medium">
                              ✓ Unlocked! {coupon.min_steps_required.toLocaleString()} steps
                            </span>
                          ) : (
                            <span className="text-orange-600">
                              Walk {stepsNeeded.toLocaleString()} more steps
                            </span>
                          )}
                        </div>

                        <Button 
                          size="sm"
                          disabled={!canRedeem || isRedeeming}
                          onClick={() => handleRedeemCoupon(coupon)}
                          className={cn(
                            "text-xs px-3 h-7",
                            canRedeem 
                              ? "bg-primary hover:bg-primary/90" 
                              : "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isRedeeming ? "..." : "Redeem"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Coupon Redeemed!</span>
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>
                Your <strong>{selectedCoupon?.title}</strong> coupon has been successfully redeemed.
              </p>
              
              <div className="bg-primary/10 p-3 rounded-lg">
                <p className="font-mono text-center text-lg font-bold">
                  {redemptionCode}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Show this code to the merchant
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Check SMS for code. Valid until {selectedCoupon && formatExpiry(selectedCoupon.expiry_date)}
              </p>

              {selectedCoupon?.terms && (
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium">Terms:</p>
                  <p>{selectedCoupon.terms}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};