/**
 * Background ambient orbs for depth and atmosphere
 * Absolutely positioned, heavily blurred circles
 */
export function OrbBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Blue orb - top left */}
      <div
        className="orb orb-blue"
        style={{
          width: '600px',
          height: '600px',
          top: '-10%',
          left: '-5%',
          opacity: 0.18,
        }}
      />
      {/* Purple orb - top right */}
      <div
        className="orb orb-purple"
        style={{
          width: '500px',
          height: '500px',
          top: '5%',
          right: '-8%',
          opacity: 0.14,
        }}
      />
      {/* Cyan orb - bottom center */}
      <div
        className="orb orb-cyan"
        style={{
          width: '700px',
          height: '700px',
          bottom: '-15%',
          left: '30%',
          opacity: 0.1,
        }}
      />
      {/* Small blue accent - center */}
      <div
        className="orb orb-blue"
        style={{
          width: '300px',
          height: '300px',
          top: '45%',
          left: '60%',
          opacity: 0.08,
        }}
      />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
