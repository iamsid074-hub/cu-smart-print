const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xzzjmhfsmdnpzegfzrvo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6emptaGZzbWRucHplZ2Z6cnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MDg3MTcsImV4cCI6MjA4NzE4NDcxN30.qLCqiu2x2r9_qvPzMNhpiM4SSpN5ZpENxgbytjUiOUE'
);

async function run() {
  const { data: latestOrder } = await supabase
    .from('orders')
    .select('*')
    .eq('total_price', 849)
    .order('created_at', { ascending: false })
    .limit(1);

  if (latestOrder && latestOrder.length > 0) {
    console.log("LAST ORDER with 849 total:");
    console.dir(latestOrder[0], { depth: null });
  } else {
    console.log("No order found with total 849. Trying last 3 orders.");
    const { data: fallback } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(3);
    console.dir(fallback, { depth: null });
  }
}

run();
