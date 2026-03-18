const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// ── GET /api/groups  — list all groups ──
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*, products(id, title, image_url, category, current_bid, end_time), users!creator_id(username, avatar_url), group_members(id, user_id, contribution, users(username, avatar_url))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/groups/:id  — single group ──
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*, products(*), users!creator_id(id, username), group_members(*, users(username, avatar_url))')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ error: 'Group not found' });
  }
});

// ── POST /api/groups  — create a group ──
router.post('/', async (req, res) => {
  try {
    const { name, productId, targetBid, creatorId, maxMembers = 10, endsAt } = req.body;
    if (!name || !productId || !targetBid || !creatorId) {
      return res.status(400).json({ error: 'name, productId, targetBid, creatorId required' });
    }
    const { data: group, error: gErr } = await supabase
      .from('groups')
      .insert([{ name, product_id: productId, target_bid: parseFloat(targetBid), creator_id: creatorId, max_members: maxMembers, ends_at: endsAt }])
      .select()
      .single();
    if (gErr) throw gErr;

    // Add creator as first member
    await supabase.from('group_members').insert([{ group_id: group.id, user_id: creatorId, contribution: 0 }]);

    res.status(201).json({ success: true, data: group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/groups/contribute  — join and/or contribute ──
router.post('/contribute', async (req, res) => {
  try {
    const { groupId, userId, amount } = req.body;
    if (!groupId || !userId || !amount) {
      return res.status(400).json({ error: 'groupId, userId, amount required' });
    }
    const contrib = parseFloat(amount);

    // Fetch group
    const { data: group, error: gErr } = await supabase.from('groups').select('*').eq('id', groupId).single();
    if (gErr || !group) return res.status(404).json({ error: 'Group not found' });
    if (group.status !== 'open') return res.status(400).json({ error: 'Group is no longer accepting contributions' });

    // Upsert member record
    const { data: member, error: mErr } = await supabase
      .from('group_members')
      .upsert([{ group_id: groupId, user_id: userId }], { onConflict: 'group_id,user_id' })
      .select()
      .single();
    if (mErr) throw mErr;

    // Increment contribution via RPC
    const { error: rErr } = await supabase.rpc('increment_contribution', { row_id: member.id, amount: contrib });
    if (rErr) throw rErr;

    // Check if pool target reached — place group bid
    const newPool = parseFloat(group.current_pool) + contrib;
    if (newPool >= parseFloat(group.target_bid)) {
      await supabase.from('groups').update({ status: 'locked' }).eq('id', groupId);
      res.json({ success: true, message: 'Target reached! Group bid is being placed.', poolFull: true });
    } else {
      res.json({ success: true, message: `Contribution of $${contrib} added!`, poolFull: false, newPool });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/groups/:id  — update group status ──
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await supabase.from('groups').update({ status }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
