import React, { useState, useEffect, useRef } from "react";
import { 
  Home, 
  Video, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star,
  Shield,
  Heart,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Stethoscope,
  Activity,
  TestTube,
  UserCheck
} from "lucide-react";
import bannerImage from "../assets/images/mockuuups-iphone-15-pro-in-hand-mockup.png";
import chatImage from "../assets/images/Start 1-left.png";
import { useNavigateWithUser } from "../App";

const PhysioCareLanding = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const navigateWithUser = useNavigateWithUser();
  
  const homeRef = useRef(null);
  const servicesRef = useRef(null);
  const aboutRef = useRef(null);
  const chatVideosRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsVisible(prev => ({
          ...prev,
          [entry.target.id]: entry.isIntersecting
        }));
      });
    }, observerOptions);

    const sections = [homeRef, servicesRef, aboutRef, chatVideosRef];
    sections.forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigate = (path) => {
    if (navigateWithUser) {
      navigateWithUser(path);
    } else {
      window.location.href = path;
    }
  };

  const stats = [
    { number: "10+", label: "Happy Patients", icon: <Users size={32} /> },
    { number: "24/7", label: "Support Available", icon: <Clock size={32} /> },
    { number: "1+", label: "Expert Doctors", icon: <Stethoscope size={32} /> },
    { number: "99%", label: "Satisfaction Rate", icon: <Star size={32} /> }
  ];

  const services = [
    {
      icon: <Video size={48} />,
      title: "Online Consultations",
      description: "Connect with our healthcare professionals through secure video calls from the comfort of your home.",
      features: ["24/7 Availability", "Secure Video Platform", "Digital Prescriptions", "Follow-up Support"],
      color: "primary"
    },
    {
      icon: <MapPin size={48} />,
      title: "Home Visits",
      description: "Our medical professionals come to your home for personalized healthcare services.",
      features: ["Personalized Care", "Convenient Scheduling", "Professional Staff", "Emergency Support"],
      color: "success"
    },
    {
      icon: <UserCheck size={48} />,
      title: "Home Nursing",
      description: "Professional nursing care in the comfort of your home with qualified healthcare professionals.",
      features: ["Qualified Nurses", "Medication Management", "Wound Care", "Post-operative Care"],
      color: "info"
    },
    {
      icon: <TestTube size={48} />,
      title: "Laboratory Services",
      description: "Complete laboratory testing services available at your home with professional sample collection.",
      features: ["Home Sample Collection", "Quick Results", "Accurate Testing", "Digital Reports"],
      color: "warning"
    },
    {
      icon: <Stethoscope size={48} />,
      title: "At Home Consultations",
      description: "Professional medical consultations and health assessments by experienced healthcare providers.",
      features: ["Expert Diagnosis", "Treatment Plans", "Health Advice", "Medical Records"],
      color: "dark"
    }
  ];

  return (
    <>
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      
      <style>
        {`
          .hero-section {
            background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 50%, #f0f4ff 100%);
            min-height: 100vh;
            position: relative;
            overflow: hidden;
          }
          
          .hero-decoration {
            position: absolute;
            top: 0;
            right: 0;
            width: 50%;
            height: 100%;
            opacity: 0.1;
            background: linear-gradient(to left, #007bff, transparent);
            transform: skewX(12deg);
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #007bff, #0056b3);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .stat-card {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            transition: all 0.3s ease;
          }
          
          .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          }
          
          .service-card {
            border-radius: 25px;
            transition: all 0.5s ease;
            border: none;
            overflow: hidden;
          }
          
          .service-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          }
          
          .service-icon {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }
          
          .hero-image, .chat-image, .video-image, .about-image {
            background: transparent;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            height: auto;
            object-fit: cover;
            border-radius: 20px;
          }
          
          .fade-in {
            opacity: 0;
            transform: translateY(30px);
            transition: all 1s ease;
          }
          
          .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
          }
          
          .slide-in-left {
            opacity: 0;
            transform: translateX(-50px);
            transition: all 1s ease;
          }
          
          .slide-in-left.visible {
            opacity: 1;
            transform: translateX(0);
          }
          
          .slide-in-right {
            opacity: 0;
            transform: translateX(50px);
            transition: all 1s ease;
          }
          
          .slide-in-right.visible {
            opacity: 1;
            transform: translateX(0);
          }
          
          .floating-animation {
            animation: float 6s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          .pulse-animation {
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.4; }
          }

          .section-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 80px 0;
          }

          .chat-videos-section {
            padding-bottom: 100px;
          }
        `}
      </style>

      <div className="min-vh-100">
        <section ref={homeRef} id="home" className="hero-section d-flex align-items-center">
          <div className="hero-decoration"></div>
          
          <div className="container position-relative" style={{zIndex: 10}}>
            <div className="row align-items-center g-5">
              <div className={`col-lg-6 fade-in ${isVisible.home ? 'visible' : ''}`}>
                <h1 className="display-1 fw-bold mb-4">
                  <span className="gradient-text">PhysioCare</span>
                </h1>
                <p className="lead text-muted mb-4 fs-4">
                  شريكك الموثوق في الرعاية الصحية - نقدم رعاية طبية متميزة في منزلك أو عبر الإنترنت مع خدمات حجز سهلة وشاملة
                </p>
                <p className="lead text-muted mb-5">
                  Your trusted healthcare partner delivering compassionate care at home or online with seamless booking and comprehensive medical services.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3 mb-5">
                  <button 
                    onClick={() => scrollToSection(servicesRef)}
                    className="btn btn-primary btn-lg rounded-pill px-4 py-3"
                  >
                    خدماتنا Our Services <ArrowRight className="ms-2" size={20} />
                  </button>
                  <button 
                    onClick={() => scrollToSection(aboutRef)}
                    className="btn btn-outline-primary btn-lg rounded-pill px-4 py-3"
                  >
                    عن PhysioCare About Us
                  </button>
                </div>
                
                <div className="row g-3">
                  {stats.map((stat, index) => (
                    <div key={index} className="col-6 col-lg-3">
                      <div className="stat-card p-3 text-center shadow">
                        <div className="text-primary mb-2 d-flex justify-content-center">{stat.icon}</div>
                        <div className="h4 fw-bold text-dark mb-1">{stat.number}</div>
                        <div className="small text-muted">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="col-lg-6">
                <div className="position-relative">
                  <div className="position-relative floating-animation">
                    <img 
                      src={bannerImage} 
                      alt="Healthcare Professional in Egypt" 
                      className="img-fluid rounded-4 hero-image mx-auto d-block"
                    />
                    <div className="position-absolute bottom-0 start-0 bg-white p-4 rounded-3 shadow-lg" style={{transform: 'translate(-20px, 20px)'}}>
                      <div className="d-flex align-items-center">
                        <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                          <CheckCircle className="text-success" size={24} />
                        </div>
                        <div>
                          <div className="fw-semibold text-dark">رعاية موثوقة</div>
                          <div className="small text-muted">منذ 2025</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="position-absolute top-0 end-0 bg-primary bg-opacity-20 rounded-circle pulse-animation" style={{width: '120px', height: '120px', transform: 'translate(20px, -20px)'}}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={servicesRef} id="services" className="section-wrapper bg-light">
          <div className="container">
            <div className={`text-center mb-5 fade-in ${isVisible.services ? 'visible' : ''}`}>
              <h2 className="display-4 fw-bold mb-4">
                <span className="gradient-text">خدماتنا Our Services</span>
              </h2>
              <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                خدمات رعاية صحية شاملة مصممة لتلبية جميع احتياجاتك الطبية بسهولة وتميز
              </p>
            </div>
            
            <div className="row g-4">
              {services.map((service, index) => (
                <div key={index} className="col-md-6 col-lg-4">
                  <div 
                    className={`card service-card h-100 shadow fade-in ${isVisible.services ? 'visible' : ''}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className="card-body p-4">
                      <div className={`service-icon bg-${service.color} mb-4 mx-auto`}>
                        {service.icon}
                      </div>
                      <h5 className="card-title fw-bold text-center mb-3">{service.title}</h5>
                      <p className="card-text text-muted mb-4">{service.description}</p>
                      <ul className="list-unstyled">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="d-flex align-items-center mb-2 text-muted">
                            <CheckCircle className="text-success me-2 flex-shrink-0" size={16} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={aboutRef} id="about" className="section-wrapper bg-white">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className={`col-lg-6 slide-in-left ${isVisible.about ? 'visible' : ''}`}>
                <h2 className="display-4 fw-bold mb-4">
                  <span className="gradient-text">عن PhysioCare About Us</span>
                </h2>
                <p className="lead text-muted mb-4">
                  نحن منصة رعاية صحية مقرها في قلب المنوفية، مصر، نسعى لتقديم خدمات طبية متميزة إلى عتبة منزلك باستخدام أحدث التقنيات.
                </p>
                <p className="lead text-muted mb-4">
                  Based in the heart of Menofia, Egypt, our healthcare platform is dedicated to bringing top-notch medical services to your doorstep with cutting-edge technology and unwavering compassion.
                </p>
                
                <div className="row g-4 mb-4">
                  {[
                    { icon: <Shield size={24} />, title: "رعاية موثوقة", desc: "متخصصون معتمدون" },
                    { icon: <Heart size={24} />, title: "Compassionate Care", desc: "Patient-centered approach" },
                    { icon: <Award size={24} />, title: "Excellence", desc: "High-quality standards" },
                    { icon: <Activity size={24} />, title: "24/7 Support", desc: "Always available" }
                  ].map((item, index) => (
                    <div key={index} className="col-sm-6">
                      <div className="d-flex align-items-start">
                        <div className="bg-primary bg-opacity-10 rounded-3 p-3 me-3 flex-shrink-0">
                          <div className="text-primary">{item.icon}</div>
                        </div>
                        <div>
                          <h6 className="fw-semibold text-dark mb-1">{item.title}</h6>
                          <p className="small text-muted mb-0">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={`col-lg-6 slide-in-right ${isVisible.about ? 'visible' : ''}`}>
                <img 
                  src={bannerImage} 
                  alt="About PhysioCare" 
                  className="img-fluid rounded-4 about-image mx-auto d-block"
                />
              </div>
            </div>
          </div>
        </section>

        <section ref={chatVideosRef} id="chat-videos" className="section-wrapper chat-videos-section bg-light">
          <div className="container">
            <div className={`text-center mb-5 fade-in ${isVisible['chat-videos'] ? 'visible' : ''}`}>
              <h2 className="display-4 fw-bold mb-4">
                <span className="gradient-text">خدمات تفاعلية Interactive Services</span>
              </h2>
              <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                استكشف نصائح الفيديو وتواصل معنا مباشرة عبر الدردشة.
              </p>
            </div>
            
            <div className="row g-4 justify-content-center">
              <div className="col-md-6 col-lg-5">
                <div className={`card service-card h-100 shadow fade-in ${isVisible['chat-videos'] ? 'visible' : ''}`}>
                  <div className="card-body p-4 text-center">
                    <div className="service-icon bg-info mb-4 mx-auto">
                      <Video size={48} />
                    </div>
                    <h5 className="card-title fw-bold text-center mb-3">نصائح فيديو Advice Videos</h5>
                    <p className="card-text text-muted mb-4">استكشف فيديوهات تعليمية للرعاية الذاتية والصحة العامة.</p>
                    <div className="mb-4">
                      <img 
                        src={chatImage} 
                        alt="Advice Videos" 
                        className="img-fluid rounded-4 video-image mx-auto d-block"
                      />
                    </div>
                    <button 
                      onClick={() => handleNavigate('/video-advices')}
                      className="btn btn-primary w-100 mt-3 rounded-pill"
                    >
                      شاهد الآن Watch Now <ArrowRight className="ms-2" size={20} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-5">
                <div className={`card service-card h-100 shadow fade-in ${isVisible['chat-videos'] ? 'visible' : ''}`} style={{ transitionDelay: '100ms' }}>
                  <div className="card-body p-4 text-center">
                    <div className="service-icon bg-primary mb-4 mx-auto">
                      <Phone size={48} />
                    </div>
                    <h5 className="card-title fw-bold text-center mb-3">دردشة فورية Real-Time Chat</h5>
                    <p className="card-text text-muted mb-4">تواصل مع مختصين للحصول على استشارات فورية.</p>
                    <div className="mb-4">
                      <img 
                        src={bannerImage} 
                        alt="Real-Time Chat" 
                        className="img-fluid rounded-4 chat-image mx-auto d-block"
                      />
                    </div>
                    <button 
                      onClick={() => handleNavigate('/Chat')}
                      className="btn btn-primary w-100 mt-3 rounded-pill"
                    >
                      ابدأ الدردشة Start Chat <ArrowRight className="ms-2" size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js"></script>
    </>
  );
};

export default PhysioCareLanding;