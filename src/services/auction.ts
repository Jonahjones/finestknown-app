import { supabase } from '../lib/supabase';

export type AuctionStatus = 'scheduled' | 'live' | 'ended';

export type Auction = {
  id: string;
  productId: string;
  title: string;
  imageUrl: string;
  endAt: string;
  status: AuctionStatus;
  currentCents: number;
  minIncrementCents?: number;
};

export type Bid = {
  id: string;
  auctionId: string;
  userId: string;
  userDisplay: string;
  amountCents: number;
  createdAt: string;
};

// Update auction statuses based on current time
async function updateAuctionStatuses() {
  await supabase.rpc('update_auction_status');
}

export async function listAuctions(): Promise<Auction[]> {
  // Update statuses first
  await updateAuctionStatuses();

  // Get auctions from auctions table
  const { data: auctionData, error: auctionError } = await supabase
    .from('auctions')
    .select('*')
    .order('end_at', { ascending: true });

  if (auctionError) throw auctionError;

  const auctions = (auctionData || []).map((row: any) => ({
    id: row.id,
    productId: row.product_id,
    title: row.title,
    imageUrl: row.image_url,
    endAt: row.end_at,
    status: row.status as AuctionStatus,
    currentCents: row.current_bid_cents,
    minIncrementCents: row.min_increment_cents,
  }));

  // Also get products marked as auctions
  const { data: productData, error: productError } = await supabase
    .from('products')
    .select('id, title, photos, price_cents, auction_end_at, is_auction')
    .eq('is_auction', true);

  if (productError) {
    console.error('Error fetching auction products:', productError);
  }

  // Get current bids for all auction products
  const productIds = (productData || []).map((p: any) => p.id);
  const { data: bidsData } = await supabase
    .from('bids')
    .select('auction_id, amount_cents')
    .in('auction_id', productIds)
    .order('amount_cents', { ascending: false });

  // Create a map of product_id -> max bid
  const maxBidsMap = new Map<string, number>();
  (bidsData || []).forEach((bid: any) => {
    if (!maxBidsMap.has(bid.auction_id)) {
      maxBidsMap.set(bid.auction_id, bid.amount_cents);
    }
  });

  // Convert products to auction format
  const productAuctions = (productData || []).map((product: any) => {
    const now = new Date();
    
    // If no end date, default to 7 days from now
    const endAt = product.auction_end_at 
      ? new Date(product.auction_end_at)
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    let status: AuctionStatus = 'live';
    
    if (endAt <= now) {
      status = 'ended';
    } else if (!product.auction_end_at) {
      status = 'scheduled'; // No end date set yet
    }

    // Use the max bid if available, otherwise use starting price
    const currentCents = maxBidsMap.get(product.id) || product.price_cents;

    return {
      id: product.id,
      productId: product.id,
      title: product.title,
      imageUrl: product.photos?.[0] || null,
      endAt: endAt.toISOString(),
      status,
      currentCents,
      minIncrementCents: 100,
    };
  });

  // Combine both sources and remove duplicates
  const allAuctions = [...auctions, ...productAuctions];
  const uniqueAuctions = Array.from(
    new Map(allAuctions.map(item => [item.productId, item])).values()
  );

  return uniqueAuctions.sort((a, b) => 
    new Date(a.endAt).getTime() - new Date(b.endAt).getTime()
  );
}

export async function getAuction(id: string): Promise<Auction> {
  console.log('🔍 getAuction called with ID:', id);
  
  // Update statuses first
  await updateAuctionStatuses();

  // Try auctions table first
  const { data: auctionData, error: auctionError } = await supabase
    .from('auctions')
    .select('*')
    .eq('id', id)
    .single();

  if (!auctionError && auctionData) {
    console.log('✅ Found in auctions table:', auctionData);
    return {
      id: auctionData.id,
      productId: auctionData.product_id,
      title: auctionData.title,
      imageUrl: auctionData.image_url,
      endAt: auctionData.end_at,
      status: auctionData.status as AuctionStatus,
      currentCents: auctionData.current_bid_cents,
      minIncrementCents: auctionData.min_increment_cents,
    };
  }

  console.log('🔍 Not in auctions table, checking products...');

  // Try products table (for is_auction products)
  const { data: productData, error: productError } = await supabase
    .from('products')
    .select('id, title, photos, price_cents, auction_end_at, is_auction')
    .eq('id', id)
    .eq('is_auction', true)
    .single();

  if (productError) {
    console.error('❌ Product fetch error:', productError);
    throw new Error(`Auction not found: ${productError.message}`);
  }

  console.log('✅ Found in products table:', productData);

  const now = new Date();
  const endAt = productData.auction_end_at 
    ? new Date(productData.auction_end_at)
    : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  let status: AuctionStatus = 'live';
  if (endAt <= now) {
    status = 'ended';
  } else if (!productData.auction_end_at) {
    status = 'scheduled';
  }

  return {
    id: productData.id,
    productId: productData.id,
    title: productData.title,
    imageUrl: productData.photos?.[0] || null,
    endAt: endAt.toISOString(),
    status,
    currentCents: productData.price_cents,
    minIncrementCents: 100,
  };
}

export async function listBids(id: string, limit = 50): Promise<Bid[]> {
  console.log('🔍 listBids called for auction:', id);
  
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('id, auction_id, user_id, amount_cents, created_at')
      .eq('auction_id', id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ listBids error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('✅ No bids found');
      return [];
    }

    console.log(`✅ Found ${data.length} bids`);

    // Get user info separately to avoid join issues
    const userIds = [...new Set(data.map(b => b.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

    return data.map((row: any) => ({
      id: row.id,
      auctionId: row.auction_id,
      userId: row.user_id,
      userDisplay: profileMap.get(row.user_id) || 'Anonymous',
      amountCents: row.amount_cents,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('❌ listBids exception:', err);
    return [];
  }
}

export async function placeBid(id: string, amountCents: number): Promise<{ ok: true }> {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) {
    throw new Error('Must be logged in to place bid');
  }

  console.log('🎯 Placing bid for auction/product:', id, 'Amount:', amountCents);

  // Get current auction to validate bid
  const auction = await getAuction(id);
  const minBid = auction.currentCents + (auction.minIncrementCents || 100);

  if (amountCents < minBid) {
    throw new Error(`Minimum bid is $${(minBid / 100).toFixed(2)}`);
  }

  if (auction.status !== 'live') {
    throw new Error('Auction is not active');
  }

  // Check if auction record exists in auctions table
  const { data: existingAuction } = await supabase
    .from('auctions')
    .select('id')
    .eq('id', id)
    .single();

  let auctionId = id;

  // If no auction record exists, create one from the product
  if (!existingAuction) {
    console.log('📝 No auction record found, creating one from product...');
    
    const { data: product } = await supabase
      .from('products')
      .select('id, title, photos, price_cents, auction_end_at')
      .eq('id', id)
      .single();

    if (!product) {
      throw new Error('Product not found');
    }

    // First, try to create with specified ID (Postgres allows this if id is UUID type)
    const auctionData = {
      product_id: product.id,
      title: product.title,
      image_url: product.photos?.[0] || null,
      start_at: new Date().toISOString(),
      end_at: product.auction_end_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'live' as const,
      starting_bid_cents: product.price_cents,
      current_bid_cents: product.price_cents,
      min_increment_cents: 100,
    };

    // Try with manual ID first
    let { data: newAuction, error: insertError } = await supabase
      .from('auctions')
      .insert({ id: product.id, ...auctionData })
      .select()
      .single();

    // If that fails, try without specifying ID
    if (insertError) {
      console.log('⚠️ Failed with manual ID, trying auto-generated ID...');
      const result = await supabase
        .from('auctions')
        .insert(auctionData)
        .select()
        .single();
      
      newAuction = result.data;
      insertError = result.error;
    }

    if (insertError || !newAuction) {
      console.error('❌ Failed to create auction record:', insertError);
      throw new Error(`Failed to create auction record: ${insertError?.message || 'Unknown error'}`);
    }

    console.log('✅ Created auction record:', newAuction);
    auctionId = newAuction.id;
  }

  // Now insert the bid
  const { error } = await supabase.from('bids').insert({
    auction_id: auctionId,
    user_id: session.session.user.id,
    amount_cents: amountCents,
  });

  if (error) {
    console.error('❌ Bid insert error:', error);
    throw error;
  }

  console.log('✅ Bid placed successfully');

  // Broadcast update via Realtime
  const channel = supabase.channel(`auctions:${auctionId}`);
  await channel.send({
    type: 'broadcast',
    event: 'update',
    payload: {
      currentCents: amountCents,
      endsInMs: new Date(auction.endAt).getTime() - Date.now(),
    },
  });

  return { ok: true };
}

export async function createAuction(input: {
  productId: string;
  endAt: string;
  minIncrementCents?: number;
}): Promise<{ ok: true }> {
  console.log('🔍 createAuction called with:', input);
  
  // Get product details
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('title, photos, price_cents')
    .eq('id', input.productId)
    .single();

  if (productError) {
    console.error('❌ Product fetch error:', productError);
    throw new Error(`Product not found: ${productError.message}`);
  }

  console.log('📦 Product found:', { title: product.title, price: product.price_cents });

  const startAt = new Date();
  const endAt = new Date(input.endAt);
  
  // Determine initial status
  let status: AuctionStatus = 'scheduled';
  if (startAt >= new Date() && endAt > new Date()) {
    status = 'live';
  }

  console.log('📝 Inserting auction:', {
    product_id: input.productId,
    title: product.title,
    status,
    end_at: input.endAt,
  });

  const { data, error } = await supabase.from('auctions').insert({
    product_id: input.productId,
    title: product.title,
    image_url: product.photos?.[0] || null,
    start_at: startAt.toISOString(),
    end_at: input.endAt,
    status,
    starting_bid_cents: product.price_cents,
    current_bid_cents: product.price_cents,
    min_increment_cents: input.minIncrementCents || 100,
  }).select();

  if (error) {
    console.error('❌ Insert error:', error);
    throw new Error(`Failed to create auction: ${error.message}`);
  }

  console.log('✅ Auction created:', data);

  return { ok: true };
}

export async function endAuctionNow(id: string): Promise<{ ok: true }> {
  const { error } = await supabase.rpc('end_auction_now', {
    auction_id_param: id,
  });

  if (error) throw error;

  return { ok: true };
}

