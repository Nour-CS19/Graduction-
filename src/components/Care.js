import React, { useState, useEffect } from "react";

const testimonialList = [
  {
    author: {
      fullName: "Abdullah Ali",
      gender: "male",
    },
    rating: 4.5,
    description: {
      english:
        "The medical service is excellent and the medical staff is very professional. I recommend everyone to this place for distinguished medical treatment.",
      arabic:
        "الخدمة الطبية ممتازة والطاقم الطبي محترف جداً. أنصح الجميع بهذا المكان للعلاج الطبي المتميز.",
    },
  },
  {
    author: {
      fullName: "Marwa Asker",
      gender: "female",
    },
    rating: 5.0,
    description: {
      english:
        "Amazing experience with the doctors and nurses. The treatment was very effective and I felt improvement quickly. Thank you for the wonderful care.",
      arabic:
        "تجربة رائعة مع الأطباء والممرضات. العلاج كان فعال جداً وشعرت بالتحسن سريعاً. شكراً لكم على العناية الرائعة.",
    },
  },
  {
    author: {
      fullName: "Nour Eddine Maher Mahmoud",
      gender: "male",
    },
    rating: 4.8,
    description: {
      english:
        "The clinic is clean and the service is fast. The doctors listen to patients carefully and provide the best treatment possible. Thank you for the excellent care.",
      arabic:
        "العيادة نظيفة والخدمة سريعة. الأطباء يستمعون للمرضى بعناية ويقدمون أفضل علاج ممكن. أشكركم على العناية الفائقة.",
    },
  },
  {
    author: {
      fullName: "Dr.Aya Zahra",
      gender: "female",
    },
    rating: 4.9,
    description: {
      english:
        "Excellent patient care and attention to detail. The medical staff made me feel comfortable throughout my treatment. Outstanding service quality.",
      arabic:
        "عناية ممتازة بالمرضى واهتمام بالتفاصيل. الطاقم الطبي جعلني أشعر بالراحة طوال فترة العلاج. جودة خدمة متميزة.",
    },
  },
];

const Rating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<span key={i} className="star filled">★</span>);
    } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
      stars.push(<span key={i} className="star half">★</span>);
    } else {
      stars.push(<span key={i} className="star empty">☆</span>);
    }
  }
  return <div className="rating mb-3">{stars}</div>;
};

const TestimonialCard = ({ testimonial, language }) => {
  const getPatientLabel = (gender, language) => {
    if (language === "arabic") {
      return gender === "male" ? "مريض" : "مريضة";
    }
    return "Patient";
  };

  return (
    <div className="testimonial-card">
      <div className="card">
        <div className="card-body">
          <div className="author-info">
            <h5 className="author-name">{testimonial.author.fullName}</h5>
            <small className="patient-label">
              {getPatientLabel(testimonial.author.gender, language)}
            </small>
          </div>

          <Rating rating={testimonial.rating} />

          <div className="testimonial-text">
            <p className={language === "arabic" ? "text-arabic" : ""}>
              "{testimonial.description[language]}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Testimonials = ({ name }) => {
  const [language, setLanguage] = useState("english");
  const [userReviews, setUserReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [visibleCards, setVisibleCards] = useState(3);

  // Load reviews from local storage on mount
  useEffect(() => {
    const savedReviews = localStorage.getItem("userReviews");
    if (savedReviews) {
      setUserReviews(JSON.parse(savedReviews));
    }
  }, []);

  // Save reviews to local storage whenever userReviews changes
  useEffect(() => {
    localStorage.setItem("userReviews", JSON.stringify(userReviews));
  }, [userReviews]);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setVisibleCards(1);
      } else if (window.innerWidth <= 992) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (newReview.trim()) {
      const newTestimonial = {
        author: {
          fullName: name || "Anonymous Patient",
          gender: "male", // Default gender, can be adjusted
        },
        rating: 4.5, // Default rating, can be enhanced with a rating input
        description: {
          english: newReview,
          arabic: newReview, // For simplicity, same text in both languages
        },
      };
      setUserReviews([...userReviews, newTestimonial]);
      setNewReview("");
    }
  };

  const allTestimonials = [...testimonialList, ...userReviews];

  return (
    <div className="testimonials-container">
      <section className="testimonials-section">
        <div className="container">
          {/* Header Section */}
          <div className="header-section">
            <div className="language-toggle">
              <button
                className={`lang-btn ${language === "english" ? "active" : ""}`}
                onClick={() => setLanguage("english")}
              >
                English
              </button>
              <button
                className={`lang-btn ${language === "arabic" ? "active" : ""}`}
                onClick={() => setLanguage("arabic")}
              >
                العربية
              </button>
            </div>

            <h2 className="main-title">
              {language === "arabic" ? "آراء المرضى" : "Patient Reviews"}
            </h2>
            <p className="subtitle">
              {language === "arabic"
                ? "نفتخر بثقة مرضانا وآرائهم الإيجابية حول خدماتنا الطبية المتميزة. اكتشف تجارب المرضى معنا!"
                : "We are proud of our patients' trust and their positive reviews about our distinguished medical services. Discover our patients' experiences with us!"}
            </p>

            {/* Review Submission Form */}
            <div className="review-form mt-4">
              <textarea
                className="form-control mb-2"
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder={
                  language === "arabic"
                    ? "أضف تقييمك هنا..."
                    : "Add your review here..."
                }
                rows="3"
              />
              <button
                className="btn btn-primary"
                onClick={handleSubmitReview}
                disabled={!newReview.trim()}
              >
                {language === "arabic" ? "إرسال" : "Submit"}
              </button>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="testimonials-grid">
            {allTestimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                testimonial={testimonial}
                language={language}
              />
            ))}
          </div>

          {/* Total Reviews Indicator */}
          <div className="position-indicator">
            <small>
              Showing {allTestimonials.length} {language === "arabic" ? "تقييمات" : "reviews"}
            </small>
          </div>
        </div>
      </section>

      <style>
        {`
          .testimonials-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
          }

          .testimonials-section {
            padding: 60px 0;
          }

          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .header-section {
            text-align: center;
            margin-bottom: 60px;
          }

          .language-toggle {
            display: flex;
            justify-content: center;
            gap: 0;
            margin-bottom: 30px;
          }

          .lang-btn {
            padding: 12px 30px;
            border: 2px solid #007bff;
            background: white;
            color: #007bff;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .lang-btn:first-child {
            border-radius: 25px 0 0 25px;
          }

          .lang-btn:last-child {
            border-radius: 0 25px 25px 0;
            border-left: none;
          }

          .lang-btn.active {
            background: #007bff;
            color: white;
          }

          .lang-btn:hover:not(.active) {
            background: #e3f2fd;
          }

          .main-title {
            font-size: 3.5rem;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 20px;
          }

          .subtitle {
            font-size: 1.2rem;
            color: #6c757d;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.6;
          }

          .review-form {
            max-width: 600px;
            margin: 0 auto 40px;
          }

          .review-form .form-control {
            border-radius: 8px;
            border: 2px solid #007bff;
            resize: vertical;
            padding: 10px;
            font-size: 1rem;
          }

          .review-form .btn-primary {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          .review-form .btn-primary:hover {
            background-color: #0056b3;
          }

          .review-form .btn-primary:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }

          .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(${visibleCards}, 1fr);
            gap: 30px;
            margin-bottom: 40px;
          }

          .testimonial-card {
            padding: 0 15px;
          }

          .card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            height: 300px;
            transition: all 0.3s ease;
          }

          .card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          }

          .card-body {
            padding: 30px;
            display: flex;
            flex-direction: column;
            height: 100%;
          }

          .author-info {
            text-align: center;
            margin-bottom: 20px;
          }

          .author-name {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
          }

          .patient-label {
            color: #6c757d;
            font-style: italic;
          }

          .rating {
            text-align: center;
            margin-bottom: 20px;
          }

          .star {
            font-size: 1.2rem;
            margin: 0 2px;
          }

          .star.filled {
            color: #ffc107;
          }

          .star.half {
            color: #ffc107;
            opacity: 0.5;
          }

          .star.empty {
            color: #ddd;
          }

          .testimonial-text {
            flex-grow: 1;
            display: flex;
            align-items: center;
          }

          .testimonial-text p {
            font-size: 1rem;
            line-height: 1.6;
            color: #555;
            margin: 0;
            font-style: italic;
          }

          .text-arabic {
            text-align: right;
            direction: rtl;
          }

          .position-indicator {
            text-align: center;
          }

          .position-indicator small {
            color: #6c757d;
            font-size: 0.85rem;
          }

          /* Responsive Design */
          @media (max-width: 1200px) {
            .container {
              max-width: 95%;
            }
            .main-title {
              font-size: 3rem;
            }
          }

          @media (max-width: 992px) {
            .testimonials-grid {
              grid-template-columns: repeat(2, 1fr);
            }
            .main-title {
              font-size: 2.5rem;
            }
            .subtitle {
              font-size: 1.1rem;
              padding: 0 20px;
            }
            .card {
              height: 280px;
            }
            .card-body {
              padding: 25px;
            }
          }

          @media (max-width: 768px) {
            .testimonials-section {
              padding: 40px 0;
            }
            .header-section {
              margin-bottom: 40px;
            }
            .testimonials-grid {
              grid-template-columns: 1fr;
            }
            .card {
              height: 260px;
            }
            .main-title {
              font-size: 2.2rem;
              margin-bottom: 15px;
            }
            .subtitle {
              font-size: 1rem;
              padding: 0 15px;
            }
            .lang-btn {
              padding: 10px 25px;
              font-size: 0.95rem;
            }
            .review-form {
              max-width: 100%;
            }
            .review-form .form-control {
              font-size: 0.95rem;
            }
            .review-form .btn-primary {
              padding: 8px 16px;
              font-size: 0.95rem;
            }
          }

          @media (max-width: 576px) {
            .testimonials-section {
              padding: 30px 0;
            }
            .container {
              padding: 0 10px;
            }
            .header-section {
              margin-bottom: 30px;
            }
            .language-toggle {
              margin-bottom: 25px;
            }
            .card {
              height: 240px;
            }
            .card-body {
              padding: 20px;
            }
            .main-title {
              font-size: 1.8rem;
              margin-bottom: 12px;
            }
            .subtitle {
              font-size: 0.9rem;
              padding: 0 10px;
              line-height: 1.5;
            }
            .lang-btn {
              padding: 8px 20px;
              font-size: 0.9rem;
            }
            .review-form .form-control {
              font-size: 0.9rem;
            }
            .review-form .btn-primary {
              padding: 6px 12px;
              font-size: 0.9rem;
            }
          }

          @media (max-width: 480px) {
            .card {
              height: 220px;
            }
            .card-body {
              padding: 18px;
            }
            .main-title {
              font-size: 1.6rem;
            }
            .subtitle {
              font-size: 0.85rem;
              padding: 0 5px;
            }
            .lang-btn {
              padding: 7px 18px;
              font-size: 0.85rem;
            }
            .review-form .form-control {
              font-size: 0.85rem;
            }
            .review-form .btn-primary {
              padding: 5px 10px;
              font-size: 0.85rem;
            }
          }

          @media (max-width: 360px) {
            .testimonials-section {
              padding: 25px 0;
            }
            .card {
              height: 200px;
            }
            .card-body {
              padding: 15px;
            }
            .main-title {
              font-size: 1.4rem;
            }
            .subtitle {
              font-size: 0.8rem;
            }
            .lang-btn {
              padding: 6px 15px;
              font-size: 0.8rem;
            }
            .review-form .form-control {
              font-size: 0.8rem;
            }
            .review-form .btn-primary {
              padding: 4px 8px;
              font-size: 0.8rem;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Testimonials;