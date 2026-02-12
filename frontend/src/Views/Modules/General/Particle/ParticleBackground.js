import React, { useCallback } from 'react';
import Particles from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import cssstyles from './Styles/styles.module.css';

const defaultParticleOptions = {
  particles: {
    number: { value: 30, density: { enable: true, area: 800 } },
    color: { value: '#ffffff' },
    shape: { type: 'circle' },
    opacity: { value: 0.5 },
    size: { value: { min: 1, max: 3 } },
    links: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
    move: { enable: true, speed: 1, direction: 'none', outModes: { default: 'bounce' } }
  },
  interactivity: {
    events: { onHover: { enable: false }, onClick: { enable: false } }
  },
  detectRetina: true
};

function valid_check(x) {
  return x !== null && x !== undefined && x !== false;
}

/**
 * Wraps content with a particle background effect.
 * @param {JSX.Element} content - The content to overlay on particles
 * @param {Object} styles - Style object with height, backgroundColor, etc.
 * @param {Object} params - Layout params (vertCenter, horCenter, centered, etc.)
 */
export default function PerfParticledContent(content, styles, params) {
  if (styles == null || styles.height == null) {
    throw new Error('Particled Content: styles must include a height');
  }
  if (params == null) {
    throw new Error('Particled Content: params must define centering values');
  }

  const padding_constrained_height = styles.height;

  const pinned = {
    position: 'relative',
    top: '-' + styles.height,
    left: 0,
    height: styles.height,
    padding: '0px'
  };

  const options = { ...defaultParticleOptions };
  if (styles.color) {
    options.particles = {
      ...options.particles,
      color: { value: styles.color },
      links: { ...options.particles.links, color: styles.color }
    };
  }

  if (window.innerWidth < 550) {
    options.particles = { ...options.particles, number: { ...options.particles.number, value: 12 } };
  }

  const vcentered = params && valid_check(params.vertCenter);
  const hcentered = params && valid_check(params.horCenter);
  const view_h_centered = params && valid_check(params.centered);

  if (params.particleMargin) styles.padding = params.particleMargin;

  return (
    <div>
      <div style={styles} className={view_h_centered ? cssstyles.grd : ''}>
        <div style={{ backgroundColor: styles.backgroundColor }}>
          <ParticleWrapper height={styles.height} options={options} />
        </div>
        <div style={pinned} className={cssstyles.pinned}>
          <div
            className={cssstyles.gridded_centered}
            style={{
              height: padding_constrained_height,
              minWidth: styles.minWidth,
              maxWidth: styles.maxWidth,
              alignContent: vcentered ? 'center' : null,
              justifyContent: hcentered ? 'center' : 'left'
            }}
          >
            <div
              className={cssstyles.content_box}
              style={{
                maxWidth: params.content_max_width,
                minWidth: styles.min_width
              }}
            >
              {content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParticleWrapper({ height, options }) {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={options}
      style={{ height }}
    />
  );
}
