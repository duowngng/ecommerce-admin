import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase-config";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  console.log(session);
  const address = session?.customer_details?.address;

  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country
  ];

  const addressString = addressComponents.filter((c) => c !== null).join(', ');

  if (event.type === "checkout.session.completed") {
    const orderRef = doc(
      db,
      "stores",
      session?.metadata?.storeId || "",
      "orders",
      session?.metadata?.orderId || ""
    );
    const orderDoc = await getDoc(orderRef);
    const orderData = orderDoc.data();

    const order = await updateDoc(orderRef, {
      ...orderData, 
      isPaid: true,
      address: addressString,
      phone: session?.customer_details?.phone || "",
    });

    const productIds = orderData?.orderItems.map((orderItem: any) => orderItem.product.connect.id);

    for (const productId of productIds) {
      await updateDoc(doc(db, "stores", session?.metadata?.storeId || "", "products", productId), {
        isArchived: true,
      })
    };
  }

  return new NextResponse(null, { status: 200 });
}