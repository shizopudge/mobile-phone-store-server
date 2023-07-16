import { YooCheckout } from "@a2seven/yoo-checkout";

export const checkout = new YooCheckout({ shopId: process.env.SHOP_ID, secretKey: process.env.PAYMENT_SECRET_KEY });