'use client';

export function FamewallWidget() {
  return (
    <div className="w-full">
      <iframe
        id="famewall-collection-embed"
        src="https://page.famewall.io/www-lmah?widget-embed=1"
        allow="camera;microphone"
        frameBorder={0}
        width="100%"
        height="600"
        style={{
          width: '100%',
          height: '600px',
          border: 'none'
        }}
        title="Famewall Reviews"
      />
    </div>
  );
}

