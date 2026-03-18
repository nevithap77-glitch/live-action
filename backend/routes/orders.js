const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// ── GET /api/orders  — all orders (buyer or seller) ──
router.get('/', async (req, res) => {
  try {
    const { userId, role = 'buyer', status } = req.query;
    const field = role === 'seller' ? 'seller_id' : 'buyer_id';
    let query = supabase
      .from('orders')
      .select(`
        id, final_price, status, payment_method, tracking_no,
        paid_at, shipped_at, delivered_at, created_at,
        products(id, title, image_url, category),
        users!buyer_id(username, avatar_url),
        users!seller_id(username, avatar_url)
      `)
      .order('created_at', { ascending: false });
    if (userId) query = query.eq(field, userId);
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/orders/:id  — single order ──
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(*), users!buyer_id(*), users!seller_id(*)')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ error: 'Order not found' });
  }
});

// ── POST /api/orders  — create an order (auction win) ──
router.post('/', async (req, res) => {
  try {
    const { productId, buyerId, sellerId, finalPrice, paymentMethod = 'card', shippingAddr } = req.body;
    if (!productId || !buyerId || !finalPrice) {
      return res.status(400).json({ error: 'productId, buyerId, finalPrice required' });
    }
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        product_id: productId,
        buyer_id: buyerId,
        seller_id: sellerId,
        final_price: parseFloat(finalPrice),
        payment_method: paymentMethod,
        shipping_addr: shippingAddr,
        status: 'pending',
      }])
      .select()
      .single();
    if (error) throw error;

    // Mark product as sold
    await supabase.from('products').update({ status: 'sold', winner_id: buyerId }).eq('id', productId);

    // Notify seller
    if (sellerId) {
      supabase.from('notifications').insert([{
        user_id: sellerId,
        type: 'system',
        title: 'Your item was sold!',
        message: `Your auction item sold for $${parseFloat(finalPrice).toLocaleString()}. Please prepare for shipping.`,
        product_id: productId,
      }]);
    }

    res.status(201).json({ success: true, data, message: 'Order created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/orders/:id  — update order status ──
router.patch('/:id', async (req, res) => {
  try {
    const { status, trackingNo, notes } = req.body;
    const updates = { status };
    if (trackingNo) updates.tracking_no = trackingNo;
    if (notes) updates.notes = notes;
    if (status === 'paid')      updates.paid_at = new Date().toISOString();
    if (status === 'shipped')   updates.shipped_at = new Date().toISOString();
    if (status === 'delivered') updates.delivered_at = new Date().toISOString();

    const { data, error } = await supabase.from('orders').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;

    // Notify buyer on status change
    if (['shipped', 'delivered'].includes(status) && data.buyer_id) {
      const msgs = {
        shipped:   { title: 'Your order has shipped! 📦', message: `Tracking: ${trackingNo || 'N/A'}` },
        delivered: { title: 'Order delivered! 🎉', message: 'Your auction win has been delivered. Enjoy!' },
      };
      supabase.from('notifications').insert([{
        user_id: data.buyer_id, type: 'shipped', ...msgs[status], product_id: data.product_id,
      }]);
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/orders/summary/:userId  — buyer summary stats ──
router.get('/summary/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase.from('orders').select('id, final_price, status').eq('buyer_id', req.params.userId);
    if (error) throw error;
    const summary = {
      total: data.length,
      totalSpent: data.reduce((s, o) => s + parseFloat(o.final_price || 0), 0),
      byStatus: data.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {}),
    };
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
