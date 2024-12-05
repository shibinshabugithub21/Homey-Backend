// const stripe=require('stripe')('sk_test_51QHOmzAp6WccJ09Hp3wgbrwyZS1528mEf0WN1bfsHTeRCs7xJ1j1AyDvK2QC34NEB7HXUU7mdciZog1bDFUJUmzi00Odfgn2Xw')

// const createPaymentIntent = async (req, res) => {
//     const { amount, currency } = req.body; 

//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount,
//             currency,
//             metadata: { integration_check: 'accept_a_payment' },
//         });

//         res.status(200).json({ clientSecret: paymentIntent.client_secret });
//     } catch (error) {
//         console.error('Error creating payment intent:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// module.exports={createPaymentIntent}