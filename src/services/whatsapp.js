export async function sendWhatsApp(to, message) {
  const res = await fetch('/api/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, message }),
  });
  return res.json();
}
