import React, { useState, useEffect } from 'react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Star,
  User,
  FileText,
  CreditCard,
  MapPin,
  Phone,
  XCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function BookLaboratory() {
  // -----------------------------
  // الحالة العامة
  // -----------------------------
  const [bookingLocation, setBookingLocation] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // المدن (تم ترجمتها)
  const cities = [
    'جميع المناطق',
    'أشمون',
    'بركة السبع',
    'مدينة الشهداء',
    'منوف',
    'قوسنة',
    'مدينة السادات',
    'شبين الكوم'
  ];

  // المختبرات
  const laboratories = [
    {
      id: 1,
      name: 'المختبر المركزي',
      address: '12 شارع المختبر، القاهرة',
      rating: 4.5,
      image: 'https://via.placeholder.com/70',
      description: 'مختبر شامل مع تشخيصات متقدمة.'
    },
    {
      id: 2,
      name: 'تشخيص ألفا',
      address: '34 شارع الصحة، الإسكندرية',
      rating: 4.7,
      image: 'https://via.placeholder.com/70',
      description: 'مختبر عصري يقدم مجموعة واسعة من الاختبارات.'
    },
    {
      id: 3,
      name: 'مدلاب',
      address: '56 طريق العافية، الجيزة',
      rating: 4.6,
      image: 'https://via.placeholder.com/70',
      description: 'خدمات تحليل دقيقة وموثوقة.'
    }
  ];
  const [selectedLab, setSelectedLab] = useState(null);

  // التحاليل
  const analyses = [
    { id: 1, name: 'فحص الدم', price: 200 },
    { id: 2, name: 'فحص البول', price: 150 },
    { id: 3, name: 'الأشعة السينية', price: 300 },
    { id: 4, name: 'الرنين المغناطيسي', price: 1000 },
    { id: 5, name: 'التصوير المقطعي', price: 800 }
  ];
  const [selectedAnalyses, setSelectedAnalyses] = useState([]);

  // صورة الدفع (إذا كان الحجز "في المنزل")
  const [paymentImage, setPaymentImage] = useState(null);

  // بيانات المريض (الخطوة 6)
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [patientCondition, setPatientCondition] = useState('');
  const [useSavedInfo, setUseSavedInfo] = useState(false);

  // معالجة الأخطاء والتحكم بالخطوات
  const [errors, setErrors] = useState({});
  // "في المنزل": 7 خطوات، "في المركز": 6 خطوات.
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (useSavedInfo) {
      setPatientName('أحمد محمد');
      setPatientPhone('01012345678');
      setPatientAddress('14 شارع النصر، مدينة نصر، القاهرة');
    }
  }, [useSavedInfo]);

  // -----------------------------
  // منطق التحقق من الخطوة
  // -----------------------------
  const validateStep = () => {
    const newErrors = {};
    switch (currentStep) {
      case 1:
        if (!bookingLocation) newErrors.bookingLocation = 'يرجى اختيار موقع الحجز.';
        break;
      case 2:
        if (!selectedCity) newErrors.selectedCity = 'يرجى اختيار المدينة.';
        break;
      case 3:
        if (!selectedLab) newErrors.selectedLab = 'يرجى اختيار المختبر.';
        break;
      case 4:
        if (selectedAnalyses.length === 0) {
          newErrors.selectedAnalyses = 'يرجى اختيار تحليل واحد على الأقل.';
        }
        break;
      case 5:
        if (bookingLocation === 'في المنزل' && !paymentImage) {
          newErrors.paymentImage = 'يرجى تحميل لقطة شاشة للدفع.';
        }
        break;
      case 6:
        if (!patientName.trim()) newErrors.patientName = 'الاسم مطلوب';
        if (!patientPhone.trim()) {
          newErrors.patientPhone = 'رقم الهاتف مطلوب';
        } else if (!/^01[0-2|5]{1}[0-9]{8}$/.test(patientPhone)) {
          newErrors.patientPhone = 'أدخل رقم هاتف مصري صالح';
        }
        if (!patientAddress.trim()) newErrors.patientAddress = 'العنوان مطلوب';
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    // إذا كان الحجز "في المركز"، نتخطى خطوة الدفع (الخطوة 5)
    if (bookingLocation === 'في المركز' && currentStep === 4) {
      setCurrentStep(currentStep + 2);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (bookingLocation === 'في المركز' && currentStep === 6) {
      setCurrentStep(currentStep - 2);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // -----------------------------
  // رفض الحجز (إلغاء الحجز بالكامل)
  // -----------------------------
  const handleRejectBooking = () => {
    if (
      window.confirm(
        'هل أنت متأكد أنك تريد إلغاء الحجز بالكامل؟ سيتم فقدان جميع البيانات.'
      )
    ) {
      // إعادة تعيين كل القيم
      setCurrentStep(1);
      setBookingLocation(null);
      setSelectedCity(null);
      setSelectedLab(null);
      setSelectedAnalyses([]);
      setPaymentImage(null);
      setPatientName('');
      setPatientPhone('');
      setPatientAddress('');
      setPatientCondition('');
      setUseSavedInfo(false);
      setErrors({});
    }
  };

  // -----------------------------
  // معالجات الدفع والتحليل
  // -----------------------------
  const handlePaymentImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPaymentImage(URL.createObjectURL(file));
  };

  const handleToggleAnalysis = (analysis) => {
    if (selectedAnalyses.find((a) => a.id === analysis.id)) {
      setSelectedAnalyses(selectedAnalyses.filter((a) => a.id !== analysis.id));
    } else {
      setSelectedAnalyses([...selectedAnalyses, analysis]);
    }
    setErrors((prev) => ({ ...prev, selectedAnalyses: undefined }));
  };

  const handleRemoveAnalysis = (analysisId) => {
    setSelectedAnalyses(selectedAnalyses.filter((a) => a.id !== analysisId));
  };

  const calculateTotalPrice = () => {
    return selectedAnalyses.reduce((sum, analysis) => sum + analysis.price, 0);
  };

  const handleBookAnother = () => {
    setCurrentStep(1);
    setBookingLocation(null);
    setSelectedCity(null);
    setSelectedLab(null);
    setSelectedAnalyses([]);
    setPaymentImage(null);
    setPatientName('');
    setPatientPhone('');
    setPatientAddress('');
    setPatientCondition('');
    setUseSavedInfo(false);
    setErrors({});
  };

  const handleDownloadPDF = async () => {
    const body = document.body;
    const canvas = await html2canvas(body);
    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const imgProps = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('تأكيد_الحجز.pdf');
  };

  // -----------------------------
  // مكونات الخطوات
  // -----------------------------

  // الخطوة 1: موقع الحجز (أزرار في الوسط)
  const Step1_BookingLocation = () => (
    <div className="mb-5">
      <h4 className="mb-3 text-center">اختر موقع الحجز</h4>
      <div className="d-flex flex-column align-items-center">
        <button
          className={`btn btn-lg mb-3 ${
            bookingLocation === 'في المركز' ? 'btn-primary' : 'btn-outline-primary'
          }`}
          style={{ width: '300px' }}
          onClick={() => {
            setBookingLocation('في المركز');
            setErrors((prev) => ({ ...prev, bookingLocation: undefined }));
          }}
        >
          في المركز
        </button>
        <button
          className={`btn btn-lg ${
            bookingLocation === 'في المنزل' ? 'btn-primary' : 'btn-outline-primary'
          }`}
          style={{ width: '300px' }}
          onClick={() => {
            setBookingLocation('في المنزل');
            setErrors((prev) => ({ ...prev, bookingLocation: undefined }));
          }}
        >
          في المنزل
        </button>
      </div>
      {errors.bookingLocation && (
        <div className="text-danger mt-2 text-center">{errors.bookingLocation}</div>
      )}
    </div>
  );

  // الخطوة 2: اختيار المدينة (أزرار في الوسط)
  const Step2_City = () => (
    <div className="mb-5">
      <h4 className="mb-3 text-center">اختر مدينتك</h4>
      <div className="d-flex flex-column align-items-center">
        {cities.map((city, idx) => (
          <button
            key={idx}
            className={`btn btn-lg mb-3 ${
              selectedCity === city ? 'btn-primary' : 'btn-outline-primary'
            }`}
            style={{ width: '300px' }}
            onClick={() => {
              setSelectedCity(city);
              setErrors((prev) => ({ ...prev, selectedCity: undefined }));
            }}
          >
            {city}
          </button>
        ))}
      </div>
      {errors.selectedCity && (
        <div className="text-danger mt-2 text-center">{errors.selectedCity}</div>
      )}
    </div>
  );

  // الخطوة 3: اختيار المختبر (بطاقات)
  const Step3_Laboratory = () => (
    <div className="mb-5">
      <h4 className="mb-3">اختر المختبر</h4>
      <div className="row">
        {laboratories.map((lab) => (
          <div key={lab.id} className="col-12 mb-3">
            <div
              className={`card shadow-sm ${
                selectedLab?.id === lab.id ? 'border-primary' : 'border'
              }`}
            >
              <div className="card-body d-flex">
                <img
                  src={lab.image}
                  alt={lab.name}
                  className="rounded me-3"
                  style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <h5 className="card-title mb-1">{lab.name}</h5>
                  <p className="card-text mb-1">
                    <small className="text-muted">{lab.address}</small>
                  </p>
                  <p className="mb-0">
                    <Star size={14} className="text-warning me-1" fill="gold" />
                    <small>{lab.rating}</small>
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <button
                    className={`btn btn-lg ${
                      selectedLab?.id === lab.id ? 'btn-primary' : 'btn-outline-primary'
                    }`}
                    onClick={() => {
                      setSelectedLab(lab);
                      setErrors((prev) => ({ ...prev, selectedLab: undefined }));
                    }}
                  >
                    {selectedLab?.id === lab.id ? 'محدد' : 'اختر'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {errors.selectedLab && <div className="text-danger mt-2">{errors.selectedLab}</div>}
    </div>
  );

  // الخطوة 4: اختيار التحاليل (تحسين الحاوية مع خيار الرفض)
  const Step4_Analysis = () => (
    <div className="mb-5">
      <h4 className="mb-3">اختر تحاليل الاختبار</h4>

      {/* حاوية التحاليل المحددة */}
      {selectedAnalyses.length > 0 && (
        <div className="card shadow-sm mb-4 border-primary">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">التحاليل المحددة</h5>
          </div>
          <div className="card-body">
            {selectedAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="d-flex justify-content-between align-items-center mb-2"
              >
                <span>
                  <strong>{analysis.name}</strong> (ج.م {analysis.price})
                </span>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemoveAnalysis(analysis.id)}
                >
                  <XCircle size={16} className="me-1" />
                  رفض
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* قائمة جميع التحاليل */}
      <div className="row">
        {analyses.map((test) => {
          const isSelected = !!selectedAnalyses.find((a) => a.id === test.id);
          return (
            <div key={test.id} className="col-md-6 mb-3">
              <div
                className={`card shadow-sm ${isSelected ? 'border-primary' : 'border'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleToggleAnalysis(test)}
              >
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-title mb-1">{test.name}</h6>
                    <p className="mb-0">
                      <small>ج.م {test.price}</small>
                    </p>
                  </div>
                  {isSelected && <div className="badge bg-primary">محدد</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {errors.selectedAnalyses && (
        <div className="text-danger mt-2">{errors.selectedAnalyses}</div>
      )}
    </div>
  );

  // الخطوة 5: الدفع (فقط إذا كان الحجز "في المنزل")
  const Step5_Payment = () => (
    <div className="mb-5">
      <h4 className="mb-3">الدفع</h4>
      <div className="card shadow-sm mb-4 border-primary">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">تفاصيل الدفع</h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="mb-1">
                <span className="text-muted">السعر الإجمالي:</span>
              </p>
            </div>
            <div className="text-end">
              <h5 className="mb-0">ج.م {calculateTotalPrice()}</h5>
            </div>
          </div>
        </div>
      </div>
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">تحميل الدفع</h5>
          <p>يرجى تحميل لقطة شاشة للدفع.</p>
          <div className="mb-3">
            <label htmlFor="paymentScreenshot" className="form-label d-flex align-items-center">
              <CreditCard size={16} className="me-1" />
              صورة الدفع*
            </label>
            <input
              id="paymentScreenshot"
              type="file"
              className="form-control form-control-lg"
              accept="image/*"
              onChange={handlePaymentImageUpload}
            />
          </div>
          {paymentImage && (
            <div className="text-center">
              <img
                src={paymentImage}
                alt="صورة الدفع"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          )}
          {errors.paymentImage && <div className="text-danger mt-2">{errors.paymentImage}</div>}
        </div>
      </div>
    </div>
  );

  // الخطوة 6: بيانات المريض
  const Step6_PatientDetails = () => (
    <div className="mb-5">
      <h4 className="mb-3">تفاصيل المريض</h4>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">معلومات المريض</h5>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="useSavedInfo"
                checked={useSavedInfo}
                onChange={(e) => setUseSavedInfo(e.target.checked)}
              />
              <label className="form-check-label small" htmlFor="useSavedInfo">
                استخدام البيانات المحفوظة
              </label>
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="patientName" className="form-label d-flex align-items-center">
              <User size={16} className="me-1" /> اسم المريض*
            </label>
            <input
              id="patientName"
              type="text"
              className={`form-control form-control-lg ${errors.patientName ? 'is-invalid' : ''}`}
              placeholder="أدخل الاسم الكامل"
              value={patientName}
              onChange={(e) => {
                setPatientName(e.target.value);
                setErrors((prev) => ({ ...prev, patientName: undefined }));
              }}
            />
            {errors.patientName && <div className="invalid-feedback">{errors.patientName}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="patientPhone" className="form-label d-flex align-items-center">
              <Phone size={16} className="me-1" /> رقم الهاتف*
            </label>
            <input
              id="patientPhone"
              type="tel"
              className={`form-control form-control-lg ${errors.patientPhone ? 'is-invalid' : ''}`}
              placeholder="مثال: 01012345678"
              value={patientPhone}
              onChange={(e) => {
                setPatientPhone(e.target.value);
                setErrors((prev) => ({ ...prev, patientPhone: undefined }));
              }}
            />
            {errors.patientPhone && <div className="invalid-feedback">{errors.patientPhone}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="patientAddress" className="form-label d-flex align-items-center">
              <MapPin size={16} className="me-1" /> العنوان*
            </label>
            <textarea
              id="patientAddress"
              className={`form-control form-control-lg ${errors.patientAddress ? 'is-invalid' : ''}`}
              placeholder="أدخل عنوانك"
              rows="2"
              value={patientAddress}
              onChange={(e) => {
                setPatientAddress(e.target.value);
                setErrors((prev) => ({ ...prev, patientAddress: undefined }));
              }}
            ></textarea>
            {errors.patientAddress && (
              <div className="invalid-feedback">{errors.patientAddress}</div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="patientCondition" className="form-label d-flex align-items-center">
              <FileText size={16} className="me-1" /> الحالة الطبية
            </label>
            <textarea
              id="patientCondition"
              className="form-control form-control-lg"
              placeholder="صف الحالة أو المتطلبات"
              rows="3"
              value={patientCondition}
              onChange={(e) => setPatientCondition(e.target.value)}
            ></textarea>
            <small className="text-muted">
              هذه المعلومات تساعد المختبر على التحضير لاختباراتك.
            </small>
          </div>
        </div>
      </div>
    </div>
  );

  // الخطوة 7: تأكيد الحجز (يشمل زر "رفض الحجز")
  const Step7_Confirmation = () => (
    <div className="mb-5">
      <div className="text-center mb-4">
        <CheckCircle size={64} className="text-success mb-3" />
        <h3 className="fw-bold">تم تأكيد الحجز!</h3>
        <p className="text-muted">
          شكراً لك! تم معالجة حجز التحاليل المخبرية بنجاح.
        </p>
      </div>
      <div className="card shadow-sm border-success mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">تفاصيل الحجز</h5>
        </div>
        <div className="card-body">
          <div className="d-flex flex-wrap justify-content-between">
            <div className="w-50 pe-3">
              <p className="mb-1">
                <span className="text-muted">المريض:</span> {patientName}
              </p>
              <p className="mb-1">
                <span className="text-muted">الاتصال:</span> {patientPhone}
              </p>
              <p className="mb-1">
                <span className="text-muted">العنوان:</span> {patientAddress}
              </p>
            </div>
            <div className="w-50 text-end">
              <h5 className="mb-0">
                <span className="text-muted">السعر الإجمالي:</span> <span className="fw-bold">ج.م {calculateTotalPrice()}</span>
              </h5>
            </div>
          </div>
          <hr />
          <p className="mb-1">
            <span className="text-muted">موقع الحجز:</span> {bookingLocation}
          </p>
          <p className="mb-1">
            <span className="text-muted">المدينة:</span> {selectedCity}
          </p>
          <p className="mb-1">
            <span className="text-muted">المختبر:</span> {selectedLab?.name}
          </p>
          <p className="mb-1">
            <span className="text-muted">التحاليل:</span> {selectedAnalyses.map((a) => a.name).join(', ')}
          </p>
        </div>
      </div>
      <div className="text-center">
        <button className="btn btn-danger btn-lg me-2" onClick={handleRejectBooking}>
          <XCircle size={18} className="me-1" />
          رفض الحجز
        </button>
        <button className="btn btn-success btn-lg me-2" onClick={handleBookAnother}>
          حجز آخر
        </button>
        <button className="btn btn-outline-primary btn-lg" onClick={handleDownloadPDF}>
          تنزيل بصيغة PDF
        </button>
      </div>
    </div>
  );

  // -----------------------------
  // مؤشر الخطوات
  // -----------------------------
  const stepLabelsAtHome = ['الموقع', 'المدينة', 'المختبر', 'التحاليل', 'الدفع', 'المريض', 'تأكيد الحجز'];
  const stepLabelsAtCenter = ['الموقع', 'المدينة', 'المختبر', 'التحاليل', 'المريض', 'تأكيد الحجز'];
  const stepLabels = bookingLocation === 'في المنزل' ? stepLabelsAtHome : stepLabelsAtCenter;

  const StepIndicator = () => (
    <div className="d-flex align-items-center mb-4">
      {stepLabels.map((label, index) => (
        <React.Fragment key={index}>
          <div className="d-flex flex-column align-items-center">
            <div
              className={`rounded-circle d-flex justify-content-center align-items-center mb-1 ${
                currentStep > index + 1 ? 'bg-primary text-white' : 'bg-light border'
              }`}
              style={{
                width: '40px',
                height: '40px',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease'
              }}
            >
              {index + 1}
            </div>
            <small className={currentStep === index + 1 ? 'fw-bold' : ''}>{label}</small>
          </div>
          {index < stepLabels.length - 1 && (
            <div
              style={{
                flex: 1,
                height: '2px',
                backgroundColor: currentStep > index + 1 ? '#007bff' : '#ccc',
                margin: '0 10px'
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // -----------------------------
  // العرض الرئيسي: عرض الخطوة الحالية بناءً على الحالة
  // -----------------------------
  const renderCurrentStep = () => {
    if (bookingLocation === 'في المركز') {
      switch (currentStep) {
        case 1:
          return <Step1_BookingLocation />;
        case 2:
          return <Step2_City />;
        case 3:
          return <Step3_Laboratory />;
        case 4:
          return <Step4_Analysis />;
        case 5:
          return <Step6_PatientDetails />; // نتخطى خطوة الدفع لـ "في المركز"
        case 6:
          return <Step7_Confirmation />;
        default:
          return <Step1_BookingLocation />;
      }
    } else {
      switch (currentStep) {
        case 1:
          return <Step1_BookingLocation />;
        case 2:
          return <Step2_City />;
        case 3:
          return <Step3_Laboratory />;
        case 4:
          return <Step4_Analysis />;
        case 5:
          return <Step5_Payment />;
        case 6:
          return <Step6_PatientDetails />;
        case 7:
          return <Step7_Confirmation />;
        default:
          return <Step1_BookingLocation />;
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-light min-vh-100 pt-5 pb-5">
        {/* يمكنك إضافة dir="rtl" هنا أو في ملف CSS العالمي */}
        <div className="container" style={{ maxWidth: '900px' }} dir="rtl">
          <StepIndicator />
          {renderCurrentStep()}

          {/* أزرار التنقل (إذا لم تكن في صفحة التأكيد النهائية) */}
          {bookingLocation === 'في المنزل'
            ? currentStep < 7 && (
                <div
                  className={`d-flex ${
                    currentStep === 1 ? 'justify-content-end' : 'justify-content-between'
                  } mt-4 mb-5`}
                >
                  {currentStep > 1 && (
                    <button className="btn btn-outline-secondary btn-lg" onClick={goBack}>
                      <ArrowLeft size={18} className="me-1" />
                      السابق
                    </button>
                  )}
                  <button className="btn btn-primary btn-lg" onClick={goNext}>
                    {currentStep === 6 ? 'تأكيد الحجز' : 'التالي'}
                    <ChevronRight size={18} className="ms-1" />
                  </button>
                </div>
              )
            : currentStep < 6 && (
                <div
                  className={`d-flex ${
                    currentStep === 1 ? 'justify-content-end' : 'justify-content-between'
                  } mt-4 mb-5`}
                >
                  {currentStep > 1 && (
                    <button className="btn btn-outline-secondary btn-lg" onClick={goBack}>
                      <ArrowLeft size={18} className="me-1" />
                      السابق
                    </button>
                  )}
                  <button className="btn btn-primary btn-lg" onClick={goNext}>
                    {currentStep === 5 ? 'تأكيد الحجز' : 'التالي'}
                    <ChevronRight size={18} className="ms-1" />
                  </button>
                </div>
              )}
        </div>
      </div>
      <Footer />
    </>
  );
}
