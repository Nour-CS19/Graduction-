import React from 'react';
import { useForm, ValidationError } from '@formspree/react';
import Navigation from './Nav';
import Footer from './Footer';

const ContactUs11 = () => {
  const [state, handleSubmit] = useForm("xdkzlvrb"); // Replace with your Formspree form ID

  const styles = {
    section: {
      backgroundColor: 'rgb(0, 157, 165)',
      minHeight: '100vh',
      padding: '60px 0',
      backgroundImage: 'linear-gradient(135deg, rgb(0, 157, 165) 0%, rgb(0, 120, 125) 100%)',
      marginTop: '5em',
      marginBottom: '5em'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1rem'
    },
    row: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '2rem',
      padding: '2rem 0'
    },
    leftCol: {
      flex: '1',
      minWidth: '300px',
      marginBottom: '2rem'
    },
    rightCol: {
      flex: '1',
      minWidth: '400px'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1rem',
      lineHeight: '1.2'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: 'rgba(255,255,255,0.9)',
      lineHeight: '1.5'
    },
    card: {
      backgroundColor: '#f4f7fd',
      borderRadius: '15px',
      padding: '25px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    },
    cardBody: {
      backgroundColor: 'white',
      borderRadius: '15px',
      padding: '2rem'
    },
    cardTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#000',
      marginBottom: '1rem'
    },
    cardSubtitle: {
      fontSize: '1rem',
      color: '#666',
      marginBottom: '2rem'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    formControl: {
      width: '100%',
      minHeight: '48px',
      padding: '12px 16px',
      border: 'none',
      backgroundColor: 'rgba(163, 190, 241, 0.14)',
      borderRadius: '10px',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box'
    },
    textarea: {
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit'
    },
    submitBtn: {
      padding: '12px 30px',
      backgroundColor: '#0d6efd',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      opacity: state.submitting ? 0.7 : 1
    },
    successMessage: {
      backgroundColor: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb',
      padding: '15px',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '1.1rem',
      fontWeight: '500'
    },
    errorMessage: {
      color: '#dc3545',
      fontSize: '0.875rem',
      marginTop: '5px'
    }
  };

  // Success state
  if (state.succeeded) {
    return (
      <div>
        <Navigation />
        
        <section style={styles.section}>
          <div style={styles.container}>
            <div style={styles.row}>
              <div style={styles.leftCol}>
                <h2 style={styles.title}>
                  PhysioCare Contact Us
                </h2>
                <p style={styles.subtitle}>
                  Connect with PhysioCare for personalized physical therapy solutions. 
                  Our expert team is here to help you on your journey to recovery and wellness.
                </p>
              </div>
              
              <div style={styles.rightCol}>
                <div style={styles.card}>
                  <div style={styles.cardBody}>
                    <div style={styles.successMessage}>
                      🎉 Thank you for contacting PhysioCare! 
                      <br />
                      We have received your message and will get back to you as soon as possible.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.row}>
            <div style={styles.leftCol}>
              <h2 style={styles.title}>
                PhysioCare Contact Us
              </h2>
              <p style={styles.subtitle}>
                Connect with PhysioCare for personalized physical therapy solutions. 
                Our expert team is here to help you on your journey to recovery and wellness.
              </p>
            </div>
            
            <div style={styles.rightCol}>
              <div style={styles.card}>
                <div style={styles.cardBody}>
                  <h2 style={styles.cardTitle}>Contact Us</h2>
                  <p style={styles.cardSubtitle}>
                    Send us a message and we'll get back to you as soon as possible.
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Enter Your Name"
                        style={styles.formControl}
                        required
                      />
                      <ValidationError 
                        prefix="Name" 
                        field="name"
                        errors={state.errors}
                        style={styles.errorMessage}
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Enter Your Email"
                        style={styles.formControl}
                        required
                      />
                      <ValidationError 
                        prefix="Email" 
                        field="email"
                        errors={state.errors}
                        style={styles.errorMessage}
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <textarea
                        id="message"
                        name="message"
                        placeholder="Enter Your Message"
                        style={{...styles.formControl, ...styles.textarea}}
                        required
                      />
                      <ValidationError 
                        prefix="Message" 
                        field="message"
                        errors={state.errors}
                        style={styles.errorMessage}
                      />
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <button
                        type="submit"
                        style={styles.submitBtn}
                        disabled={state.submitting}
                        onMouseOver={(e) => !state.submitting && (e.target.style.backgroundColor = '#0056b3')}
                        onMouseOut={(e) => !state.submitting && (e.target.style.backgroundColor = '#0d6efd')}
                      >
                        {state.submitting ? 'Sending...' : 'Submit'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs11;