import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #1a1a1a 2%, transparent 2%)',
          backgroundSize: '50px 50px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '20px',
            border: '2px solid #3b82f6',
            boxShadow: '0 20px 50px rgba(59, 130, 246, 0.5)',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: '0',
              textAlign: 'center',
              lineHeight: '1.2',
            }}
          >
            NATO Phonetic Alphabet
          </h1>
          <p
            style={{
              fontSize: '32px',
              color: '#3b82f6',
              margin: '20px 0',
              textAlign: 'center',
            }}
          >
            Alpha • Bravo • Charlie • Delta • Echo
          </p>
          <p
            style={{
              fontSize: '24px',
              color: '#94a3b8',
              margin: '10px 0',
              textAlign: 'center',
            }}
          >
            Learn • Practice • Master
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '30px',
              gap: '10px',
            }}
          >
            <div
              style={{
                fontSize: '20px',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="#3b82f6"
                />
              </svg>
              phoneticalphabet.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}