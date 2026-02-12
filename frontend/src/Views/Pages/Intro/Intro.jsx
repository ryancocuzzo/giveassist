import React, { useEffect, useState } from 'react';
import styles from './Styling/styles.module.css';
import { Link } from 'react-router-dom';

function IntroContent({ user }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    window.history.pushState(null, '', '/');
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const heroParallax = scrollY * 0.5;



  return (
    <div className={styles.modernWrapper}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroGradient}></div>
          <div className={styles.heroPattern}></div>
        </div>
        
        <div className={styles.heroContent} style={{ transform: `translateY(${heroParallax}px)` }}>
          <div className={styles.heroText}>
            <div className={styles.heroLabel}>
              <span className="material-icons">eco</span>
              Simple. Transparent. Impactful.
            </div>
            <h1 className={styles.heroTitle}>
              Make every dollar <span className={styles.heroAccent}>count</span>
            </h1>
            <p className={styles.heroSubtitle}>
              A subscription-based donation platform that lets you vote on causes each month. Simple, affordable, and transparent giving.
            </p>
            <div className={styles.heroCTA}>
              <Link to={user ? "/app" : "/signup"}>
                <button className={styles.primaryButton}>
                  {user ? "Go to Dashboard" : "Start Giving"}
                  <span className="material-icons">{user ? "dashboard" : "arrow_forward"}</span>
                </button>
              </Link>
              {!user && (
                <Link to="/login">
                  <button className={styles.secondaryButton}>Sign In</button>
                </Link>
              )}
              {user && (
                <div className={styles.welcomeText}>
                  Welcome back, {user.displayName || user.email}!
                </div>
              )}
            </div>
            <div className={styles.heroTrust}>
              <div className={styles.trustItem}>
                <span className="material-icons">verified_user</span>
                <span>Secure payments</span>
              </div>
              <div className={styles.trustItem}>
                <span className="material-icons">visibility</span>
                <span>100% transparent</span>
              </div>
              <div className={styles.trustItem}>
                <span className="material-icons">speed</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
          
          <div className={styles.heroVisual}>
            <div className={styles.statsCard}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>Monthly</div>
                <div className={styles.statLabel}>Curated Causes</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>99.5%</div>
                <div className={styles.statLabel}>Goes to Causes</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>$2.99</div>
                <div className={styles.statLabel}>Starting Price</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>How it works</h2>
            <p>Three simple steps to make giving easier</p>
          </div>
          
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepIcon}>
                <span className="material-icons">how_to_reg</span>
              </div>
              <h3>Choose Your Plan</h3>
              <p>Start with as little as $2.99/month. Pick a subscription that fits your budget.</p>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepIcon}>
                <span className="material-icons">how_to_vote</span>
              </div>
              <h3>Vote Monthly</h3>
              <p>Review hand-picked causes each month and vote for the one that matters most to you.</p>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepIcon}>
                <span className="material-icons">trending_up</span>
              </div>
              <h3>Track Impact</h3>
              <p>See analytics on your giving and where your contributions go each month.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2>Why donors love GiveAssist</h2>
            <p>Everything you need to make informed, impactful donations</p>
          </div>
          
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <span className="material-icons">volunteer_activism</span>
              </div>
              <div className={styles.featureContent}>
                <h3>Curated Options</h3>
                <p>Our team vets and selects the most impactful causes each month, saving you research time.</p>
              </div>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <span className="material-icons">notifications_active</span>
              </div>
              <div className={styles.featureContent}>
                <h3>Stay Updated</h3>
                <p>Get timely reminders via text and email when it's time to cast your monthly vote.</p>
              </div>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <span className="material-icons">analytics</span>
              </div>
              <div className={styles.featureContent}>
                <h3>Track Impact</h3>
                <p>Clean dashboards show where your contributions go and help you stay informed.</p>
              </div>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <span className="material-icons">auto_awesome</span>
              </div>
              <div className={styles.featureContent}>
                <h3>Simple & Delightful</h3>
                <p>An intuitive, modern interface that makes charitable giving feel effortless.</p>
              </div>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <span className="material-icons">account_balance</span>
              </div>
              <div className={styles.featureContent}>
                <h3>Transparent Pricing</h3>
                <p>99.5% goes directly to causes. Only 0.5% covers operating costs.</p>
              </div>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <span className="material-icons">groups</span>
              </div>
              <div className={styles.featureContent}>
                <h3>Community Driven</h3>
                <p>Join our growing community collectively deciding which causes receive support.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className={styles.pricing}>
        <div className={styles.pricingContainer}>
          <div className={styles.pricingContent}>
            <h2>Start making a difference today</h2>
            <p>Affordable plans that fit any budget. Cancel anytime, no questions asked.</p>
            <div className={styles.priceTag}>
              <span className={styles.priceAmount}>$2.99</span>
              <span className={styles.pricePeriod}>/month</span>
            </div>
            <ul className={styles.pricingFeatures}>
              <li><span className="material-icons">check_circle</span>Vote on monthly causes</li>
              <li><span className="material-icons">check_circle</span>Full impact analytics</li>
              <li><span className="material-icons">check_circle</span>Email & SMS updates</li>
              <li><span className="material-icons">check_circle</span>Cancel anytime</li>
            </ul>
            <Link to="/signup">
              <button className={styles.pricingButton}>Get Started</button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ / Footer */}
      <section className={styles.footer}>
        <div className={styles.sectionContainer}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h3>Questions?</h3>
              <p>Reach our support team at <a href="mailto:admin@giveassist.org">admin@giveassist.org</a></p>
            </div>
            
            <div className={styles.footerSection}>
              <h3>Follow Us</h3>
              <div className={styles.socials}>
                <button className={styles.socialButton} onClick={() => window.open('https://www.instagram.com/giveassist/', '_blank')}>
                  <span className="material-icons">photo_camera</span>
                </button>
                <button className={styles.socialButton} onClick={() => window.open('https://twitter.com/give_assist/', '_blank')}>
                  <span className="material-icons">chat</span>
                </button>
                <button className={styles.socialButton} onClick={() => window.open('https://www.facebook.com/give.assist', '_blank')}>
                  <span className="material-icons">groups</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default IntroContent;
