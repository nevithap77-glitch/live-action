const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// ── GET /api/bids/:productId  — bid history for a product ──
router.get('/:productId', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const { data, error } = await supabase
      .from('bids')
      .select('*, users!user_id(username, avatar_url)')
      .eq('product_id', req.params.productId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/bids/user/:userId  — all bids by a user ──
router.get('/user/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('*, products(id, title, image_url, category, current_bid, status, end_time)')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/bids  — place a new bid ──
router.post('/', async (req, res) => {
  try {
    const { productId, userId, amount, isAutoBid = false, maxAuto } = req.body;
    if (!productId || !userId || !amount) {
      return res.status(400).json({ error: 'productId, userId, and amount are required' });
    }

    // 1. Fetch current product state
    const { data: product, error: pErr } = await supabase
      .from('products')
      .select('id, title, current_bid, status, end_time, seller_id')
      .eq('id', productId)
      .single();

    if (pErr || !product) return res.status(404).json({ error: 'Product not found' });
    if (product.status !== 'active') return res.status(400).json({ error: `Auction is ${product.status}. Bidding closed.` });
    if (new Date(product.end_time) < new Date()) return res.status(400).json({ error: 'This auction has ended.' });
    if (product.seller_id === userId) return res.status(400).json({ error: 'You cannot bid on your own item.' });

    const bidAmount = parseFloat(amount);
    const currentBid = parseFloat(product.current_bid);
    if (bidAmount <= currentBid) {
      return res.status(400).json({ error: `Bid must be higher than current bid of $${currentBid.toLocaleString()}` });
    }

    // 2. Insert the new bid
    const { data: bid, error: bErr } = await supabase
      .from('bids')
      .insert([{
        product_id: productId,
        user_id: userId,
        amount: bidAmount,
        status: 'active',
        is_auto_bid: isAutoBid,
        max_auto: maxAuto || null,
      }])
      .select()
      .single();
    if (bErr) throw bErr;

    // 3. Update product's current_bid (trigger handles total_bids + outbid)
    const { error: uErr } = await supabase
      .from('products')
      .update({ current_bid: bidAmount })
      .eq('id', productId);
    if (uErr) throw uErr;

    // 4. Get previous leading bidder to notify them (non-blocking)
    supabase
      .from('bids')
      .select('user_id')
      .eq('product_id', productId)
      .eq('status', 'outbid')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data: prev }) => {
        if (prev?.[0]?.user_id && prev[0].user_id !== userId) {
          supabase.from('notifications').insert([{
            user_id: prev[0].user_id,
            type: 'outbid',
            title: 'You\'ve been outbid!',
            message: `Someone bid $${bidAmount.toLocaleString()} on "${product.title}". Place a higher bid!`,
            product_id: productId,
          }]);
        }
      });

    // 5. Update user's total_bids count
    supabase.rpc('increment_user_bids', { uid: userId }).catch(() => {});

    res.status(201).json({
      success: true,
      message: `Bid of $${bidAmount.toLocaleString()} placed successfully!`,
      data: bid,
    });
  } catch (err) {
    console.error('Bid error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/bids/stats/:productId  — bid statistics ──
router.get('/stats/:productId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('amount, created_at')
      .eq('product_id', req.params.productId)
      .order('created_at', { ascending: true });
    if (error) throw error;

    const amounts = data.map(b => parseFloat(b.amount));
    const stats = {
      count: data.length,
      min: amounts.length ? Math.min(...amounts) : 0,
      max: amounts.length ? Math.max(...amounts) : 0,
      avg: amounts.length ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0,
      history: data,
    };
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
