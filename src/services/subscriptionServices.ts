import Stripe from "stripe";
import { Request, Response, NextFunction } from "express";
import to from "await-to-ts";
import User from "@models/userModel";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { SubscriptionPlanName, SubscriptionStatus } from "@shared/enums";
import SubscriptionPlan from "@models/subscriptionPlanModel";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const upgrade = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  const planId = req.body.planId;
  let error, user, plan, session, customer;

  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User not found"));

  [error, plan] = await to(SubscriptionPlan.findById(planId));
  if (error) return next(error);
  if (!plan) return next(createError(StatusCodes.NOT_FOUND, "Plan not found"));

  [error, customer] = await to(stripe.customers.create({ email: req.user.email }));
  if (error) return next(error);

  [error, session] = await to(
    stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customer.id,
      mode: "subscription",
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          plan: plan.name,
          fee: plan.unitAmount,
          userId: userId,
        },
      },
      success_url: `https://example.com/success`,
      cancel_url: `https://example.com/cancel`,
    })
  );
  if (error) return next(error);

  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: session.url });
};

const cancel = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const userId = req.user.userId;
  let error, user;

  [error, user] = await to(User.findById(userId));
  if (error) return next(error);
  if (!user) return next(createError(StatusCodes.NOT_FOUND, "User not found"));

  [error] = await to(
    stripe.subscriptions.update(user.subscription!.id!, {
      cancel_at_period_end: true,
    })
  );
  if (error) return next(error);

  user.subscription!.id = "";
  user.subscription!.plan = SubscriptionPlanName.LISTENER;
  user.subscription!.fee = "Free";
  user.subscription!.status = SubscriptionStatus.NONE;
  user.subscription!.startedAt = new Date();

  [error] = await to(user.save());
  if (error) return next(error);
  return res.status(StatusCodes.OK).json({ success: true, message: "Success", data: {} });
};

const SubscriptionServices = {
  upgrade,
  cancel,
};

export default SubscriptionServices;
