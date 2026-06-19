# Razorpay Payment Gateway Integration Setup Guide

This guide explains how to configure Razorpay successfully for **FruitDabba** in both development and production environments.

## Step 1: Create a Razorpay Account
1. Go to [Razorpay Sign Up](https://dashboard.razorpay.com/signup).
2. Complete your registration and verify your business details to activate your account.
3. Switch your dashboard toggle to **Test Mode** for local testing, or **Live Mode** for production.

## Step 2: Generate API Keys
1. In the Razorpay Dashboard, navigate to **Account & Settings** > **API Keys**.
2. Click **Generate Key** to generate a new key pair.
3. Copy the **Key ID** and **Key Secret** immediately (you won't be able to see the secret key again).

## Step 3: Configure Environment Variables
Locate or create the `.env.local` file in the root of your `fruitdabba` Next.js project and set the following values:

```env
# Razorpay Credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YourKeyIDHere
RAZORPAY_KEY_SECRET=YourKeySecretHere

# App Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> [!WARNING]
> Ensure `NEXT_PUBLIC_RAZORPAY_KEY_ID` starts with `rzp_test_` in test mode, or `rzp_live_` in production mode.
> Never prefix `RAZORPAY_KEY_SECRET` with `NEXT_PUBLIC_` to keep it private and secure on the server side.

## Step 4: Webhook Integration (Optional but Recommended)
To prevent orders from failing if a customer closes their browser during payment redirection:
1. In the Razorpay Dashboard, go to **Account & Settings** > **Webhooks**.
2. Add a new webhook with URL: `https://your-domain.com/api/razorpay/webhook`.
3. Set a webhook secret and add it to your `.env.local` as `RAZORPAY_WEBHOOK_SECRET`.
4. Subscribe to the event `payment.captured`.

## Step 5: Test the Integration
1. Restart your development server (`npm run dev`).
2. If keys are omitted or set to `'your_razorpay_key_id'`, FruitDabba will fallback to a **Mock Payment Flow** which allows you to complete checkouts without real keys.
3. Once valid test keys are supplied, clicking "Pay" on checkout will open the official **Razorpay Checkout modal**.
4. Use the test credentials provided by Razorpay (e.g. Card number: `4111 1111 1111 1111`, expiry `12/30`, CVV `123`, OTP `123456`) to complete a test subscription payment.
