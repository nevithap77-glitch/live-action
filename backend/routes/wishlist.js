const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// ── GET /api/wishlist/:userId  — get user's wishlist ──
router.get('/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('id, created_at, products(id, title, image_url, category, current_bid, hot, status, end_time)')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/wishlist  — add to wishlist ──
router.post('/', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) return res.status(400).json({ error: 'userId and productId required' });
    const { data, error } = await supabase
      .from('wishlist')
      .insert([{ user_id: userId, product_id: productId }])
      .select()
      .single();
    if (error) {
      // unique constraint = already in wishlist
      if (error.code === '23505') return res.status(409).json({ error: 'Already in wishlist' });
      throw error;
    }
    res.status(201).json({ success: true, data, message: 'Added to wishlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/wishlist/:userId/:productId  — remove from wishlist ──
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', req.params.userId)
      .eq('product_id', req.params.productId);
    if (error) throw error;
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/wishlist/check/:userId/:productId ──
router.get('/check/:userId/:productId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', req.params.userId)
      .eq('product_id', req.params.productId)
      .maybeSingle();
    if (error) throw error;
    res.json({ success: true, inWishlist: !!data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
