// controllers/paymentController.js
const Razorpay = require('razorpay');
require('dotenv').config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
    console.log("Payment start from here");
    
    const { amount } = req.body; 
console.log("amount",req.body);

    if (!amount) {
        return res.status(400).json({ error: 'Amount is required' }); 
    }

    const options = {
        amount: amount * 100, 
        currency: 'INR',
        receipt: `receipt_${Math.random()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};
