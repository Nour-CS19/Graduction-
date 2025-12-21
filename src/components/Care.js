import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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

const getPatientLabel = (gender, language) => {
  if (language === "arabic") {
    return gender === "male" ? "مريض" : "مريضة";
  }
  return "Patient";
};

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

const RatingInput = ({ rating, setRating, language }) => {
  return (
    <div className="rating-input-container">
      <label className="rating-label">
        {language === "arabic" ? "التقييم:" : "Rating:"}
      </label>
      <div className="rating-stars-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star-input ${star <= rating ? "filled" : "empty"}`}
            onClick={() => setRating(star)}
            style={{ cursor: "pointer" }}
          >
            {star <= rating ? "★" : "☆"}
          </span>
        ))}
      </div>
    </div>
  );
};

const TestimonialCard = ({ testimonial, language, isUserReview, onEdit, onDelete, userName }) => {
  const isOwnReview = isUserReview && testimonial.author.fullName === userName;

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
              "{testimonial.description[language] || testimonial.description[language === "english" ? "arabic" : "english"] || "No description available"}"
            </p>
          </div>
          {isOwnReview && (
            <div className="review-actions">
              <button className="action-btn edit-btn" onClick={onEdit}>
                {language === "arabic" ? "✏️ تعديل" : "✏️ Edit"}
              </button>
              <button className="action-btn delete-btn" onClick={onDelete}>
                {language === "arabic" ? "🗑️ حذف" : "🗑️ Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Toast = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const getIcon = (type) => {
    if (type === "success") return "✅";
    if (type === "error") return "❌";
    if (type === "info") return "ℹ️";
    return "ℹ️";
  };

  return (
    <div className={`toast-notification ${type}`} role="alert">
      <div className="toast-icon">{getIcon(type)}</div>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={() => onClose(id)}>&times;</button>
      </div>
      <div className="toast-progress"></div>
    </div>
  );
};

const Testimonials = () => {
  const [language, setLanguage] = useState("english");
  const [userReviews, setUserReviews] = useState([]);
  const [newReviewEnglish, setNewReviewEnglish] = useState("");
  const [newReviewArabic, setNewReviewArabic] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [userName, setUserName] = useState("");
  const [userGender, setUserGender] = useState("male");
  const [visibleCards, setVisibleCards] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage, setReviewsPerPage] = useState(6);
  const [toasts, setToasts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Add toast function
  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  // Remove toast function
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Get username and gender from localStorage on mount
  useEffect(() => {
    const possibleKeys = ["username", "user", "patient", "authUser", "currentUser"];
    let storedUsername = "";
    let storedGender = "male";
    for (const key of possibleKeys) {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          storedUsername = parsedData.name || parsedData.fullName || parsedData.username || parsedData.email || "";
          storedGender = parsedData.gender || "male";
          break;
        } catch (e) {
          storedUsername = storedData;
          break;
        }
      }
    }
    setUserName(storedUsername);
    setUserGender(storedGender);
  }, []);

  // Load reviews from localStorage on mount
  useEffect(() => {
    const savedReviews = localStorage.getItem("userReviews");
    if (savedReviews) {
      setUserReviews(JSON.parse(savedReviews));
    }
  }, []);

  // Save reviews to localStorage whenever userReviews changes
  useEffect(() => {
    localStorage.setItem("userReviews", JSON.stringify(userReviews));
  }, [userReviews]);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setVisibleCards(1);
        setReviewsPerPage(4);
      } else if (width <= 992) {
        setVisibleCards(2);
        setReviewsPerPage(6);
      } else {
        setVisibleCards(3);
        setReviewsPerPage(9);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset to page 1 when reviews change
  useEffect(() => {
    setCurrentPage(1);
  }, [userReviews]);

  const handleSubmitReview = (e) => {
    e.preventDefault();

    if (!userName) {
      addToast(
        language === "arabic"
          ? "يرجى تسجيل الدخول أولاً لإضافة تقييم"
          : "Please login first to add a review",
        "error"
      );
      return;
    }

    if (newReviewEnglish.trim() || newReviewArabic.trim()) {
      if (editingIndex !== null) {
        // Update existing review
        const updatedReviews = [...userReviews];
        updatedReviews[editingIndex] = {
          ...updatedReviews[editingIndex],
          rating: userRating,
          description: {
            english: newReviewEnglish,
            arabic: newReviewArabic,
          },
        };
        setUserReviews(updatedReviews);
        setEditingIndex(null);
        addToast(
          language === "arabic"
            ? "تم تحديث تقييمك بنجاح!"
            : "Your review has been updated successfully!",
          "success"
        );
      } else {
        // Add new review
        const newTestimonial = {
          author: {
            fullName: userName,
            gender: userGender,
          },
          rating: userRating,
          description: {
            english: newReviewEnglish,
            arabic: newReviewArabic,
          },
        };
        setUserReviews([...userReviews, newTestimonial]);
        addToast(
          language === "arabic"
            ? "تم إضافة تقييمك بنجاح!"
            : "Your review has been submitted successfully!",
          "success"
        );
      }
      setNewReviewEnglish("");
      setNewReviewArabic("");
      setUserRating(5);
    }
  };

  const handleEditReview = (index) => {
    const review = userReviews[index];
    setNewReviewEnglish(review.description.english || "");
    setNewReviewArabic(review.description.arabic || "");
    setUserRating(review.rating);
    setEditingIndex(index);
    addToast(
      language === "arabic"
        ? "يمكنك الآن تعديل تقييمك"
        : "You can now edit your review",
      "info"
    );
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReview = (index) => {
    const updatedReviews = userReviews.filter((_, i) => i !== index);
    setUserReviews(updatedReviews);
    addToast(
      language === "arabic"
        ? "تم حذف تقييمك بنجاح"
        : "Your review has been deleted successfully",
      "success"
    );
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewReviewEnglish("");
    setNewReviewArabic("");
    setUserRating(5);
    addToast(
      language === "arabic"
        ? "تم إلغاء التعديل"
        : "Edit cancelled",
      "info"
    );
  };

  const allTestimonials = [...testimonialList, ...userReviews];
  const totalPages = Math.ceil(allTestimonials.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const paginatedReviews = allTestimonials.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const currentReviewText = language === "english" ? newReviewEnglish : newReviewArabic;
  const setCurrentReviewText = (value) => {
    if (language === "english") {
      setNewReviewEnglish(value);
    } else {
      setNewReviewArabic(value);
    }
  };

  const hasReviewText = newReviewEnglish.trim() || newReviewArabic.trim();

  return (
    <>
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
                {userName ? (
                  <>
                    <div className="user-info-display">
                      <div className="user-info-row">
                        <p className="user-name-display">
                          {language === "arabic" ? "الاسم:" : "Name:"}{" "}
                          <strong>{userName}</strong>
                        </p>
                        {language !== "arabic" && (
                          <p className="user-role-display">
                            {language === "arabic" ? "الدور:" : "Role:"}{" "}
                            <strong>{getPatientLabel(userGender, language)}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                    {editingIndex !== null && (
                      <div className="edit-mode-banner">
                        <span>
                          {language === "arabic"
                            ? "🔄 وضع التعديل"
                            : "🔄 Edit Mode"}
                        </span>
                        <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                          {language === "arabic" ? "إلغاء" : "Cancel"}
                        </button>
                      </div>
                    )}
                    <RatingInput
                      rating={userRating}
                      setRating={setUserRating}
                      language={language}
                    />
                    <textarea
                      className="form-control mb-2"
                      value={currentReviewText}
                      onChange={(e) => setCurrentReviewText(e.target.value)}
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
                      disabled={!hasReviewText}
                    >
                      {editingIndex !== null
                        ? (language === "arabic" ? "تحديث" : "Update")
                        : (language === "arabic" ? "إرسال" : "Submit")
                      }
                    </button>
                  </>
                ) : (
                  <div className="login-required-message">
                    <p>
                      {language === "arabic"
                        ? "يرجى تسجيل الدخول لإضافة تقييم"
                        : "Please login to add a review"}
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate("/login", { state: { from: location.pathname } })}
                    >
                      {language === "arabic" ? "تسجيل الدخول" : "Login"}
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Toast Notifications - Positioned below header */}
            <div className="toast-container">
              {toasts.map((toast) => (
                <Toast
                  key={toast.id}
                  id={toast.id}
                  message={toast.message}
                  type={toast.type}
                  onClose={removeToast}
                />
              ))}
            </div>
            {/* Reviews Grid */}
            <div className={`testimonials-grid ${visibleCards === 1 ? 'single-column' : visibleCards === 2 ? 'two-columns' : 'three-columns'}`}>
              {paginatedReviews.map((testimonial, index) => {
                const actualIndex = startIndex + index;
                const isUserReview = actualIndex >= testimonialList.length;
                const userReviewIndex = actualIndex - testimonialList.length;
              
                return (
                  <TestimonialCard
                    key={actualIndex}
                    testimonial={testimonial}
                    language={language}
                    isUserReview={isUserReview}
                    userName={userName}
                    onEdit={() => handleEditReview(userReviewIndex)}
                    onDelete={() => handleDeleteReview(userReviewIndex)}
                  />
                );
              })}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn prev-btn"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  {language === "arabic" ? "السابق" : "Previous"}
                </button>
                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className="pagination-btn next-btn"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  {language === "arabic" ? "التالي" : "Next"}
                </button>
              </div>
            )}
            {/* Total Reviews Indicator */}
            <div className="position-indicator">
              <small>
                Showing {startIndex + 1}-{Math.min(endIndex, allTestimonials.length)} of {allTestimonials.length} {language === "arabic" ? "تقييمات" : "reviews"} (Page {currentPage} of {totalPages})
              </small>
            </div>
          </div>
        </section>
        <style>{`
          .testimonials-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            position: relative;
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
            margin-bottom: 40px;
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
          .login-required-message {
            background: #fff3cd;
            padding: 30px;
            border-radius: 12px;
            border: 2px solid #ffc107;
            text-align: center;
          }
          .login-required-message p {
            font-size: 1.1rem;
            color: #856404;
            margin-bottom: 20px;
            font-weight: 600;
          }
          .login-required-message .btn-primary {
            background-color: #ffc107;
            color: #212529;
            font-weight: 700;
          }
          .login-required-message .btn-primary:hover {
            background-color: #e0a800;
          }
          .review-form {
            max-width: 600px;
            margin: 0 auto 40px;
          }
          .user-info-display {
            background: #f8f9fa;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: left;
          }
          .user-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
          }
          .user-name-display,
          .user-role-display {
            margin: 0;
            font-size: 1rem;
            color: #495057;
            flex: 1;
            min-width: 150px;
          }
          .user-name-display strong,
          .user-role-display strong {
            color: #007bff;
          }
          .edit-mode-banner {
            background: linear-gradient(135deg, #17a2b8, #138496);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            animation: slideDown 0.3s ease-out;
          }
          .edit-mode-banner span {
            font-weight: 600;
            font-size: 1rem;
          }
          .cancel-edit-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 6px 16px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
          }
          .cancel-edit-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.05);
          }
          .rating-input-container {
            margin-bottom: 20px;
            text-align: left;
          }
          .rating-label {
            display: block;
            font-weight: 600;
            margin-bottom: 10px;
            color: #495057;
            font-size: 1rem;
          }
          .rating-stars-input {
            display: flex;
            gap: 8px;
            font-size: 2rem;
          }
          .star-input {
            transition: all 0.2s ease;
          }
          .star-input.filled {
            color: #ffc107;
          }
          .star-input.empty {
            color: #999;
          }
          .star-input:hover {
            transform: scale(1.2);
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
            transition: all 0.3s ease;
            width: 100%;
            font-weight: 600;
          }
          .review-form .btn-primary:hover:not(:disabled) {
            background-color: #0056b3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          }
          .review-form .btn-primary:disabled {
            background-color: #ccc;
            cursor: not-allowed;
            transform: none;
          }
          .testimonials-grid {
            display: grid;
            gap: 30px;
            margin-bottom: 40px;
          }
          .testimonials-grid.three-columns {
            grid-template-columns: repeat(3, 1fr);
          }
          .testimonials-grid.two-columns {
            grid-template-columns: repeat(2, 1fr);
          }
          .testimonials-grid.single-column {
            grid-template-columns: 1fr;
          }
          .testimonial-card {
            padding: 0 15px;
            animation: fadeInUp 0.5s ease-out;
          }
          .card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            min-height: 300px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
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
            color: #999;
          }
          .testimonial-text {
            flex-grow: 1;
            display: flex;
            align-items: center;
            margin-bottom: 15px;
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
          .review-actions {
            display: flex;
            gap: 10px;
            margin-top: auto;
            padding-top: 15px;
            border-top: 1px solid #e9ecef;
          }
          .action-btn {
            flex: 1;
            padding: 8px 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.3s ease;
          }
          .edit-btn {
            background: linear-gradient(135deg, #17a2b8, #138496);
            color: white;
          }
          .edit-btn:hover {
            background: linear-gradient(135deg, #138496, #117a8b);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
          }
          .delete-btn {
            background: linear-gradient(135deg, #dc3545, #c82333);
            color: white;
          }
          .delete-btn:hover {
            background: linear-gradient(135deg, #c82333, #bd2130);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
          }
          /* Pagination Styles */
          .pagination-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin-bottom: 40px;
            flex-wrap: wrap;
          }
          .pagination-btn {
            padding: 8px 12px;
            border: 2px solid #007bff;
            background: white;
            color: #007bff;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
          }
          .pagination-btn:hover:not(:disabled) {
            background: #007bff;
            color: white;
            transform: translateY(-2px);
          }
          .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            color: #6c757d;
            border-color: #6c757d;
          }
          .page-btn.active {
            background: #007bff;
            color: white;
          }
          .pagination-numbers {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
            justify-content: center;
          }
          .position-indicator {
            text-align: center;
          }
          .position-indicator small {
            color: #6c757d;
            font-size: 0.85rem;
          }
          /* Toast Notification Styles - Below Header */
          .toast-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
            margin-bottom: 30px;
            z-index: 1000;
          }
          .toast-notification {
            animation: slideInDown 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border-radius: 12px;
            padding: 16px 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
            color: white;
            font-weight: 500;
            min-width: 320px;
            max-width: 400px;
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
          }
          .toast-notification.success {
            background: linear-gradient(135deg, #10b981, #34d399);
            border-left: 4px solid #059669;
          }
          .toast-notification.error {
            background: linear-gradient(135deg, #ef4444, #f87171);
            border-left: 4px solid #dc2626;
          }
          .toast-notification.info {
            background: linear-gradient(135deg, #3b82f6, #60a5fa);
            border-left: 4px solid #2563eb;
          }
          .toast-icon {
            font-size: 1.2rem;
            margin-right: 12px;
            flex-shrink: 0;
            animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          .toast-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex: 1;
          }
          .toast-message {
            flex-grow: 1;
            margin-right: 10px;
            line-height: 1.4;
          }
          .toast-close {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.8);
            font-size: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            opacity: 0.7;
          }
          .toast-close:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.1);
            transform: scale(1.1) rotate(90deg);
          }
          .toast-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: rgba(255, 255, 255, 0.3);
            animation: progress 5s linear forwards;
          }
          .toast-notification.success .toast-progress {
            background: rgba(255, 255, 255, 0.5);
          }
          .toast-notification.error .toast-progress {
            background: rgba(255, 255, 255, 0.5);
          }
          .toast-notification.info .toast-progress {
            background: rgba(255, 255, 255, 0.5);
          }
          @keyframes slideInDown {
            from {
              transform: translateY(-120%) scale(0.8);
              opacity: 0;
            }
            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          @keyframes slideOutDown {
            from {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
            to {
              transform: translateY(120%) scale(0.8);
              opacity: 0;
            }
          }
          @keyframes bounceIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes progress {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
          .toast-notification.exit {
            animation: slideOutDown 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
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
            .testimonials-grid.three-columns {
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
              min-height: 280px;
            }
            .card-body {
              padding: 25px;
            }
            .pagination-container {
              gap: 8px;
            }
            .pagination-btn {
              padding: 6px 10px;
              font-size: 0.9rem;
            }
            .toast-container {
              gap: 10px;
            }
            .toast-notification {
              min-width: 280px;
            }
          }
          @media (max-width: 768px) {
            .testimonials-section {
              padding: 40px 0;
            }
            .header-section {
              margin-bottom: 30px;
            }
            .testimonials-grid {
              grid-template-columns: 1fr !important;
            }
            .card {
              min-height: 260px;
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
            .user-info-display {
              padding: 12px 15px;
            }
            .user-info-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 10px;
            }
            .user-name-display,
            .user-role-display {
              font-size: 0.95rem;
              min-width: auto;
            }
            .rating-stars-input {
              font-size: 1.8rem;
            }
            .login-required-message {
              padding: 25px;
            }
            .login-required-message p {
              font-size: 1rem;
            }
            .pagination-container {
              flex-direction: column;
              gap: 10px;
            }
            .pagination-numbers {
              order: 3;
            }
            .action-btn {
              font-size: 0.85rem;
              padding: 6px 10px;
            }
            .edit-mode-banner {
              padding: 10px 15px;
            }
            .edit-mode-banner span {
              font-size: 0.9rem;
            }
            .cancel-edit-btn {
              padding: 5px 12px;
              font-size: 0.85rem;
            }
            .toast-container {
              align-items: stretch;
              margin-bottom: 20px;
            }
            .toast-notification {
              min-width: auto;
              max-width: none;
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
              margin-bottom: 20px;
            }
            .language-toggle {
              margin-bottom: 25px;
            }
            .card {
              min-height: 240px;
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
            .user-info-display {
              padding: 10px 12px;
            }
            .user-name-display,
            .user-role-display {
              font-size: 0.9rem;
              min-width: auto;
            }
            .rating-stars-input {
              font-size: 1.6rem;
            }
            .login-required-message {
              padding: 20px;
            }
            .login-required-message p {
              font-size: 0.95rem;
              margin-bottom: 15px;
            }
            .pagination-btn {
              padding: 6px 8px;
              font-size: 0.85rem;
            }
            .action-btn {
              font-size: 0.8rem;
              padding: 5px 8px;
            }
            .edit-mode-banner {
              padding: 8px 12px;
            }
            .edit-mode-banner span {
              font-size: 0.85rem;
            }
            .cancel-edit-btn {
              padding: 4px 10px;
              font-size: 0.8rem;
            }
            .toast-notification {
              font-size: 0.95rem;
              padding: 14px 18px;
            }
            .toast-icon {
              margin-right: 10px;
              font-size: 1.1rem;
            }
          }
          @media (max-width: 480px) {
            .card {
              min-height: 220px;
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
            .user-info-display {
              padding: 8px 10px;
            }
            .user-name-display,
            .user-role-display {
              font-size: 0.85rem;
              min-width: auto;
            }
            .rating-stars-input {
              font-size: 1.4rem;
            }
            .rating-label {
              font-size: 0.9rem;
            }
            .login-required-message {
              padding: 18px;
            }
            .login-required-message p {
              font-size: 0.9rem;
              margin-bottom: 12px;
            }
            .pagination-btn {
              padding: 5px 7px;
              font-size: 0.8rem;
            }
            .pagination-numbers {
              gap: 3px;
            }
            .action-btn {
              font-size: 0.8rem;
              padding: 5px 8px;
            }
            .edit-mode-banner {
              padding: 8px 12px;
            }
            .edit-mode-banner span {
              font-size: 0.85rem;
            }
            .cancel-edit-btn {
              padding: 4px 10px;
              font-size: 0.8rem;
            }
            .toast-notification {
              font-size: 0.9rem;
              padding: 12px 16px;
            }
            .toast-icon {
              margin-right: 8px;
              font-size: 1rem;
            }
            .toast-close {
              font-size: 18px;
            }
          }
          @media (max-width: 360px) {
            .testimonials-section {
              padding: 25px 0;
            }
            .card {
              min-height: 200px;
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
            .user-info-display {
              padding: 6px 8px;
            }
            .user-name-display,
            .user-role-display {
              font-size: 0.8rem;
              min-width: auto;
            }
            .rating-stars-input {
              font-size: 1.2rem;
            }
            .rating-label {
              font-size: 0.85rem;
            }
            .login-required-message {
              padding: 15px;
            }
            .login-required-message p {
              font-size: 0.85rem;
              margin-bottom: 10px;
            }
            .pagination-btn {
              padding: 4px 6px;
              font-size: 0.75rem;
            }
            .action-btn {
              font-size: 0.8rem;
              padding: 5px 8px;
            }
            .edit-mode-banner {
              padding: 8px 12px;
            }
            .edit-mode-banner span {
              font-size: 0.85rem;
            }
            .cancel-edit-btn {
              padding: 4px 10px;
              font-size: 0.8rem;
            }
            .toast-notification {
              font-size: 0.8rem;
              padding: 8px 12px;
            }
            .toast-icon {
              margin-right: 6px;
              font-size: 0.9rem;
            }
            .toast-close {
              font-size: 16px;
            }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default Testimonials;