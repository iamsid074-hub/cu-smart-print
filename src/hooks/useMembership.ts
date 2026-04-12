import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type MembershipPlan = "plus" | "prime" | "prime_plus" | null;

export interface MembershipData {
  plan: MembershipPlan;
  startDate: string | null;
  usedDeliveries: number;
  lastReset: string | null;
  pendingPlan: string | null;
}

export const getDeliveriesLimit = (plan: MembershipPlan) => {
  if (plan === "plus") return 5;
  if (plan === "prime") return 15;
  if (plan === "prime_plus") return 25;
  return 0;
};

export const useMembership = () => {
  const { user } = useAuth();
  const [data, setData] = useState<MembershipData>({
    plan: null,
    startDate: null,
    usedDeliveries: 0,
    lastReset: null,
    pendingPlan: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoaded(true);
      return;
    }

    const fetchAndSyncMembership = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "membership_plan, membership_start_date, free_deliveries_used, membership_last_reset"
        )
        .eq("id", user.id)
        .single();

      const { data: pendingOrders } = await supabase
        .from("orders")
        .select("delivery_location")
        .eq("buyer_id", user.id)
        .eq("status", "pending")
        .like("delivery_location", "%[SUBSCRIPTION]%")
        .order("created_at", { ascending: false })
        .limit(1);

      let currentPendingPlan = null;
      if (pendingOrders && pendingOrders.length > 0) {
        const planNameMatch = pendingOrders[0].delivery_location.split("] ")[1];
        currentPendingPlan = planNameMatch || "Membership";
      }

      let used = 0;
      let lastReset = null;

      if (profile && profile.membership_plan) {
        used = profile.free_deliveries_used || 0;
        const totalLimit = getDeliveriesLimit(profile.membership_plan as MembershipPlan);
        let shouldExpire = false;

        // Determine if exactly 7 days have passed since subscription started
        const startDate = profile.membership_start_date;
        if (startDate) {
          const sDate = new Date(startDate);
          const now = new Date();
          const daysSinceStart = (now.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24);

          if (daysSinceStart >= 7) {
            shouldExpire = true;
          }
        }

        // Determine if delivery limit has been reached
        if (used >= totalLimit) {
          shouldExpire = true;
        }

        // Expire subscription logic
        if (shouldExpire) {
          await supabase
            .from("profiles")
            .update({
              membership_plan: null,
              membership_start_date: null,
              membership_last_reset: null,
              free_deliveries_used: 0,
            })
            .eq("id", user.id);

          profile.membership_plan = null;
          used = 0;
          lastReset = null;
        } else {
          lastReset = profile.membership_last_reset || profile.membership_start_date;
        }
      }

      setData({
        plan: (profile?.membership_plan as MembershipPlan) || null,
        startDate: profile?.membership_start_date || null,
        usedDeliveries: used,
        lastReset: lastReset,
        pendingPlan: currentPendingPlan,
      });
      setIsLoaded(true);
    };

    fetchAndSyncMembership();
  }, [user]);

  const incrementUsage = async () => {
    if (!user || !data.plan) return;

    const newUsed = data.usedDeliveries + 1;
    setData((prev) => ({ ...prev, usedDeliveries: newUsed }));

    await supabase
      .from("profiles")
      .update({ free_deliveries_used: newUsed })
      .eq("id", user.id);
  };

  const totalDeliveriesLimit = getDeliveriesLimit(data.plan);
  const remainingDeliveries = Math.max(
    0,
    totalDeliveriesLimit - data.usedDeliveries
  );
  const isActive = data.plan !== null;
  const isPendingApproval = data.pendingPlan !== null;
  const hasFreeDelivery = isActive && remainingDeliveries > 0;

  return {
    ...data,
    isLoaded,
    totalDeliveriesLimit,
    remainingDeliveries,
    isActive,
    isPendingApproval,
    hasFreeDelivery,
    incrementUsage,
  };
};
