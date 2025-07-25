import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await params;
  const size = parseInt(sizeParam);
  
  if (![16, 32, 180, 192, 512].includes(size)) {
    return new Response('Invalid size', { status: 400 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: size * 0.6,
          background: '#3b82f6',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          borderRadius: size >= 180 ? '20%' : '0',
        }}
      >
        {size >= 180 ? 'Pɑ' : 'P'}
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}