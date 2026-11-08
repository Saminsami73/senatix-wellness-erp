const routes = [
  '/',
  '/dashboard',
  '/dashboard/field',
  '/dashboard/doctors',
  '/dashboard/billing',
  '/dashboard/orders',
  '/dashboard/inventory',
  '/dashboard/markets',
  '/dashboard/employees',
  '/dashboard/hr-payroll',
  '/dashboard/ledger',
  '/dashboard/expenses',
  '/dashboard/reports',
];

async function testAll() {
  console.log('Testing Senatix Wellness Web Routes on http://localhost:3000 ...\n');
  let allPass = true;

  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`);
      const text = await res.text();
      const isOk = res.status === 200;
      console.log(`${isOk ? '✅' : '❌'} ${route.padEnd(25)} Status: ${res.status} | Bytes: ${text.length}`);
      if (!isOk) allPass = false;
    } catch (err) {
      console.error(`❌ ${route.padEnd(25)} Error: ${err.message}`);
      allPass = false;
    }
  }

  console.log('\nResult:', allPass ? `ALL ${routes.length} ROUTES RETURNED 200 OK! 🎉` : 'Some routes failed.');
  process.exit(allPass ? 0 : 1);
}

testAll();
