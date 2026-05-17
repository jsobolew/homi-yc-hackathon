export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await req.json().catch(() => ({}));
  const confirmationNumber = `BX-${Math.floor(Math.random() * 90000 + 10000)}`;
  return Response.json({
    confirmationNumber,
    vendorName: "Ricky's Heating & Air",
  });
}
