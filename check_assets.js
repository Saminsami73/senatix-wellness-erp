async function checkAssets() {
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();
  const cssMatches = [...html.matchAll(/href="(\/_next\/static\/[^"]+\.css[^"]*)"/g)].map(m => m[1]);
  const jsMatches = [...html.matchAll(/src="(\/_next\/static\/[^"]+\.js[^"]*)"/g)].map(m => m[1]);
  console.log(`Found CSS assets: ${cssMatches.length}, JS chunks: ${jsMatches.length}`);
  
  let allOk = true;
  for (const url of [...cssMatches, ...jsMatches]) {
    const aRes = await fetch('http://localhost:3000' + url);
    const ok = aRes.status === 200;
    console.log(`${ok ? '✅' : '❌'} ${url.padEnd(65)} Status: ${aRes.status}`);
    if (!ok) allOk = false;
  }
  
  console.log('\nAsset Check Result:', allOk ? 'ALL CSS & JS CHUNKS LOADED WITH 200 OK! 🚀' : 'Some assets failed.');
  process.exit(allOk ? 0 : 1);
}

checkAssets();
