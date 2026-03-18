const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// ── GET /api/users/:id  — get user profile ──
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, username, full_name, role, avatar_url, bio, total_bids, total_wins, rating, created_at')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ error: 'User not found' });
  }
});

// ── GET /api/users/:id/stats  — user stats ──
router.get('/:id/stats', async (req, res) => {
  try {
    const uid = req.params.id;
    const [bidsRes, ordersRes, wishlistRes] = await Promise.all([
      supabase.from('bids').select('id, amount, status').eq('user_id', uid),
      supabase.from('orders').select('id, final_price, status').eq('buyer_id', uid),
      supabase.from('wishlist').select('id').eq('user_id', uid),
    ]);
    const bids = bidsRes.data || [];
    const orders = ordersRes.data || [];
    const stats = {
      totalBids: bids.length,
      totalSpent: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + parseFloat(o.final_price || 0), 0),
      totalWins: orders.filter(o => ['paid','shipped','delivered'].includes(o.status)).length,
      wishlistCount: (wishlistRes.data || []).length,
      activeBids: bids.filter(b => b.status === 'active').length,
    };
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/users  — create/upsert user profile ──
router.post('/', async (req, res) => {
  try {
    const { id, email, username, full_name, role = 'bidder', avatar_url } = req.body;
    if (!email || !username) return res.status(400).json({ error: 'email and username are required' });
    const payload = { email, username, full_name, role, avatar_url };
    if (id) payload.id = id;
    const { data, error } = await supabase.from('users').upsert([payload], { onConflict: 'email' }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/users/:id  — update user profile ──
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['username', 'full_name', 'avatar_url', 'bio'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const { data, error } = await supabase.from('users').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/users/:id/notifications  — user notifications ──
router.get('/:id/notifications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/users/:id/notifications/read  — mark all as read ──
router.patch('/:id/notifications/read', async (req, res) => {
  try {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', req.params.id).eq('read', false);
    if (error) throw error;
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
