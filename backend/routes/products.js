const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// ── GET /api/products  — list with optional filters ──
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, limit = 50, hot, featured, status = 'active' } = req.query;
    let query = supabase.from('products').select('*, users!seller_id(username, avatar_url, rating)');
    if (status !== 'all') query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (hot === 'true') query = query.eq('hot', true);
    if (featured === 'true') query = query.eq('featured', true);
    if (search) query = query.ilike('title', `%${search}%`);
    // Sorting
    switch (sort) {
      case 'price_asc':  query = query.order('current_bid', { ascending: true });  break;
      case 'price_desc': query = query.order('current_bid', { ascending: false }); break;
      case 'ending':     query = query.order('end_time',    { ascending: true });  break;
      case 'popular':    query = query.order('total_bids',  { ascending: false }); break;
      default:           query = query.order('created_at',  { ascending: false }); break;
    }
    const { data, error } = await query.limit(parseInt(limit));
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/products/categories  — get unique categories ──
router.get('/categories', async (_req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('category').eq('status', 'active');
    if (error) throw error;
    const categories = [...new Set(data.map(p => p.category))].sort();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/products/:id  — single product ──
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, users!seller_id(id, username, full_name, avatar_url, rating, total_wins)')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    // Increment view count
    supabase.from('products').update({ views: (data.views || 0) + 1 }).eq('id', req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ error: 'Product not found' });
  }
});

// ── POST /api/products  — create a product (seller) ──
router.post('/', async (req, res) => {
  try {
    const {
      seller_id, title, description, category, image_url,
      starting_bid, reserve_price, buy_now_price, end_time, hot, featured
    } = req.body;
    if (!title || !category || !starting_bid || !end_time) {
      return res.status(400).json({ error: 'title, category, starting_bid, end_time are required' });
    }
    const { data, error } = await supabase
      .from('products')
      .insert([{
        seller_id, title, description, category, image_url,
        starting_bid, current_bid: starting_bid,
        reserve_price, buy_now_price,
        end_time, hot: !!hot, featured: !!featured,
        status: 'active',
      }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/products/:id  — update product (seller) ──
router.patch('/:id', async (req, res) => {
  try {
    const allowed = ['title', 'description', 'image_url', 'reserve_price', 'buy_now_price', 'status', 'hot', 'featured'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const { data, error } = await supabase.from('products').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/products/:id ──
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('products').update({ status: 'cancelled' }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Product cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
