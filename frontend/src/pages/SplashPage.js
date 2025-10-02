import React, { useState } from 'react';

import Header from '../components/Header';
import SignUpForm from '../components/SignUpForm';
import LoginForm from '../components/LoginForm';
import Footer from '../components/Footer';

const SplashPage = () => {
  // 1. This state determines which form is visible. Defaults to 'true' (Login).
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <>
      <Header />
      <hr className="divider" />
      <main className="main-content">
        <section className="how-it-works">
          <h2>How it works</h2>
          <div className="step"><h3>Step 1: Report a bugged build</h3><p>Drop your glitchy code into BugBox and give it a name. Broken? Perfect.</p></div>
          <div className="step"><h3>Step 2: Crowdsource Hotfixes</h3><p>Fellow devs jump in to patch, rewrite, or debug. Track their fixes in real time.</p></div>
          <div className="step"><h3>Step 3: Roll Back or Ship It</h3><p>Review changes, roll back bad fixes, or publish your bug-free build to the world.</p></div>
        </section>
        <aside className="registration-container">
          {/* 2. This logic conditionally renders the correct form AND passes the correct function as a prop. */}
          {isLoginView ? (
            <LoginForm onSwitchToSignUp={() => setIsLoginView(false)} />
          ) : (
            <SignUpForm onSwitchToLogin={() => setIsLoginView(true)} />
          )}
        </aside>
      </main>
      <hr className="divider" />
      <Footer />
    </>
  );
};

export default SplashPage;