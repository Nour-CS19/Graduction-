import React from 'react';

const Footer = () => {
  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const messageData = {
      role_id: "PHYSIOCARE_EGYPT_123",
      message: formData.get('message'),
    };

    try {
      const response = await fetch('https://your-backend-server.com/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      if (response.ok) {
        alert('Message sent successfully!');
        e.target.reset();
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <footer className="physiocare-footer">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-section footer-about">
            <div className="logo-container">
              <svg
                viewBox="0 0 97 76"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: 45, height: 35, marginRight: '10px' }}
              >
                <path
                  d="M1.91304 12L3.1087 12.2689L4.30435 13.6134L5.26087 16.5714L6.21739 25.4454L6.45652 28.4034L4.30435 30.5546L4.54348 32.7059L6.69565 35.9328L9.80435 40.7731L11.9565 43.4622L12.913 44L11.2391 41.8487L5.26087 32.437L5.02174 30.8235L6.93478 29.7479L8.36957 30.0168L11.4783 31.8992L13.6304 33.7815L15.7826 36.2017L18.413 39.9664L20.087 41.8487L21.7609 42.9244L27.5 43.7311L31.5652 45.0756L33.9565 46.4202L36.587 48.5714L39.4565 51.7983L41.6087 55.563L43.2826 59.5966L44 62.5546V66.8571L43.7609 68.7395L43.5217 75.7311L43.2826 76H28.2174L27.9783 75.7311L27.7391 68.4706L26.5435 65.7815V65.2437H26.0652V64.7059L25.1087 64.1681L18.8913 59.8655L13.3913 56.1008L10.0435 53.4118L7.8913 51.2605L5.02174 45.0756L1.91304 37.2773L0.23913 31.6303L0 30.0168V25.9832L0.717391 17.1092L1.43478 12.5378L1.91304 12Z"
                  fill="#009DA5"
                />
                <path
                  d="M94.788 12L95.7935 12.2689L96.3967 16.3025L97 25.9832V31.0924L95.5924 36.7395L94.1848 41.042L91.1685 49.1092L89.962 51.7983L88.3533 53.6807L84.1304 57.4454L79.7065 60.9412L76.288 63.8992L74.6793 65.7815L73.875 67.6639L73.6739 75.7311L73.4728 76H60.6033L60.4022 75.7311L60.2011 67.395L60 65.5126V63.3613L61.0054 58.2521L62.6141 54.2185L64.2228 51.5294L65.8315 49.1092L68.6467 46.1513L70.8587 44.8067L75.0815 43.4622L78.7011 42.9244L80.1087 41.8487L81.7174 39.9664L84.3315 35.395L86.3424 32.7059L89.5598 30.2857L90.163 30.0168H91.7717L92.9783 31.0924L92.1739 33.2437L89.5598 38.084L87.5489 41.8487L86.5435 43.4622L87.75 42.6555L89.1576 40.2353L91.7717 35.395L92.9783 33.2437L93.3804 31.8992L93.1793 30.2857L92.5761 29.479L91.5707 28.6723L91.7717 25.1765L92.5761 16.8403L93.3804 13.6134L94.3859 12.2689L94.788 12Z"
                  fill="#009DA5"
                />
                <path
                  d="M38.6 0L41.313 0.235577L44.2522 1.17788L47.8696 3.29808L48.3217 3.76923L49.6783 3.53365L52.6174 1.64904L55.7826 0.471154L57.8174 0H60.3043L64.8261 1.17788L68.4435 2.82692L70.7043 4.47596L72.7391 6.83173L74.3217 10.3654L75 14.3702V16.9615L74.3217 20.9663L73.1913 23.7933L71.1565 27.5625L68.6696 30.8606L66.6348 33.2163L65.0522 35.101L59.8522 40.5192L58.0435 42.1683L53.7478 46.6442L51.2609 48.5288L49.9043 49H47.8696L45.1565 47.5865L39.9565 42.1683L38.1478 40.5192L30.913 32.9808L29.3304 31.0962L27.0696 28.0337L25.0348 24.7356L23.6783 21.2019L23 18.1394V12.7212L24.1304 8.95192L25.713 6.125L27.9739 3.76923L30.2348 2.35577L33.8522 0.942308L38.6 0Z"
                  fill="#009DA5"
                />
              </svg>
              <span className="brand-name">PhysioCare</span>
            </div>
            
            <p className="tagline">
              Comprehensive services to enhance your quality of life.
            </p>
            
            <div className="social-icons">
              <a href="#" className="social-icon facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="social-icon instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="social-icon twitter">
                <i className="fab fa-twitter"></i>
              </a>
              
            </div>
          </div>

          <div className="footer-section footer-services">
            <h3>Our Services</h3>
            <ul className="services-list">
              <li>
                <a href="/servicedoctoronlineofflineathome">
                  <i className="fas fa-hand-holding-medical"></i>   Consultations
                </a>
              </li>
              <li>
                <a href="/lab1">
                  <i className="fas fa-microscope"></i> Medical Analysis
                </a>
              </li>
              <li>
                <a href="/nurse1">
                  <i className="fas fa-syringe"></i> Nursing Care
                </a>
              </li>
             
            </ul>
          </div>

          <div className="footer-section footer-contact">
            <h3>Contact us</h3>
            <div className="contact-info">
              <a href="https://wa.me/201223126694" className="whatsapp-button">
                <i className="fab fa-whatsapp"></i> Start WhatsApp Chat
              </a>
            </div>
          </div>

          <div className="footer-section footer-message">
            <h3>Send us a message</h3>
            <form className="message-form" onSubmit={handleMessageSubmit}>
              <textarea 
                name="message" 
                placeholder="Your message..." 
                required
                className="message-input"
              />
              <input type="hidden" name="role_id" value="PHYSIOCARE_EGYPT_123" />
              <button type="submit" className="send-button">
                <i className="fas fa-paper-plane"></i> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="copyright">
        <div className="copyright-container">
          <p>© 2025 PhysioCare. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

// CSS Styles
const styles = `
  .physiocare-footer {
    position: relative;
    font-family: 'Segoe UI', sans-serif;
    margin-top: 60px;
  }

  .footer-main {
    background: #f5f7fa;
    position: relative;
    padding: 4rem 2rem 3rem;
    box-shadow: none;
  }

  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2.5rem;
  }

  .footer-section {
    position: relative;
  }

  .footer-section h3 {
    color: #2a5caa;
    margin-bottom: 1.8rem;
    font-size: 1.2rem;
    font-weight: 600;
    position: relative;
    padding-bottom: 0.8rem;
  }

  .footer-section h3:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    width: 50px;
    background: linear-gradient(90deg, #009DA5, #2a5caa);
    border-radius: 3px;
  }

  /* Logo and About Section */
  .logo-container {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .brand-name {
    font-size: 1.8rem;
    font-weight: 700;
    color: #009DA5;
    text-shadow: 1px 1px 1px rgba(0,0,0,0.05);
  }

  .tagline {
    font-size: 0.95rem;
    line-height: 1.6;
    color: #4a5568;
    margin-bottom: 1.5rem;
  }

  .social-icons {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .social-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: white;
    color: #4a5568;
    font-size: 1.1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }

  .social-icon:hover {
    transform: translateY(-3px);
  }

  .social-icon.facebook:hover {
    background: #1877F2;
    color: white;
  }

  .social-icon.instagram:hover {
    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    color: white;
  }

  .social-icon.twitter:hover {
    background: #1DA1F2;
    color: white;
  }

  .social-icon.youtube:hover {
    background: #FF0000;
    color: white;
  }

  /* Services Section */
  .services-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .services-list li {
    margin-bottom: 1rem;
  }

  .services-list a {
    color: #4a5568;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    text-decoration: none;
    padding: 0.6rem 0;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .services-list a:before {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    height: 2px;
    width: 0;
    background: linear-gradient(90deg, #009DA5, transparent);
    transition: width 0.3s ease;
  }

  .services-list a:hover {
    color: #009DA5;
    transform: translateX(5px);
  }

  .services-list a:hover:before {
    width: 100%;
  }

  .services-list a i {
    color: #009DA5;
    font-size: 1.2rem;
  }

  /* Contact Section */
  .contact-info {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    align-items: center;
  }

  .whatsapp-button {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    background: #25D366;
    color: white !important;
    font-weight: 600;
    padding: 0.8rem 1.2rem;
    border-radius: 50px;
    text-decoration: none;
    margin-top: 0.5rem;
    box-shadow: 0 4px 10px rgba(37, 211, 102, 0.2);
    transition: all 0.3s ease;
  }

  .whatsapp-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(37, 211, 102, 0.25);
  }

  /* Message Form */
  .message-form {
    margin-top: 0.5rem;
  }

  .message-input {
    width: 100%;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 1rem;
    resize: vertical;
    min-height: 120px;
    background: white;
    font-family: 'Segoe UI', sans-serif;
    transition: all 0.3s ease;
  }

  .message-input:focus {
    outline: none;
    border-color: #009DA5;
    box-shadow: 0 0 0 3px rgba(0, 157, 165, 0.1);
  }

  .send-button {
    width: 100%;
    background: linear-gradient(135deg, #009DA5, #007a80);
    color: white;
    padding: 0.9rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.7rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .send-button:hover {
    background: linear-gradient(135deg, #007a80, #009DA5);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 157, 165, 0.2);
  }

  .send-button:active {
    transform: translateY(0);
    box-shadow: none;
  }

  /* Copyright Section */
  .copyright {
    background: #e9eef5;
    padding: 1.5rem;
  }

  .copyright-container {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
    color: #718096;
    font-size: 0.9rem;
  }

  @media (max-width: 992px) {
    .footer-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .footer-container {
      grid-template-columns: 1fr;
    }
    
    .footer-section {
      padding-bottom: 1.5rem;
    }
  }
`;

if (typeof document !== 'undefined') {
  document.head.insertAdjacentHTML('beforeend', `
    <style>${styles}</style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha384-SZXxX4whJ79/GFR30r5LW/rz1bboh2+QZTqR6qZr72DFq9mBl4Y60XbmU2P5E1bK" crossorigin="anonymous">
  `);
}

export default Footer;