This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


## Secure local checkout configuration

Requires Node.js 20 or later and npm. Use npm ci and npm test; the
previous Yarn lockfile was replaced with an npm lockfile during the
critical security update. Copy the following placeholders into
.env.local for local Stripe test mode only:

    STRIPE_SECRET_KEY=sk_test_REPLACE_WITH_YOUR_TEST_SECRET
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_REPLACE_WITH_YOUR_TEST_PUBLIC_KEY
    CHECKOUT_BASE_URL=http://localhost:3000

In production, CHECKOUT_BASE_URL must be the trusted public HTTPS
origin of this deployment. Do not use live payment keys in tests.
The server fixes the donation amount at US$999.00 per unit, accepts
1-20 units, and ignores price/name/image fields sent by the browser.
Do not offer browser-editable prices without a separately reviewed
server-side pricing policy.

For verification without real Stripe calls, run npm test, npm run build,
and use local HTTP smoke tests with the secret key unset. A passing build
does not prove an end-to-end payment transaction.
