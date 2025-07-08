import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  Home,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  ChevronDown,
  Lock,
  Video,
  User,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function ArabicPaymentPage() {
  const navigate = () => {
    if (isCompleted) {
      setCurrentView("success");
    } else {
      // Simulate going back
      console.log("Navigating back");
    }
  };

  // States
  const [currentView, setCurrentView] = useState("payment"); // 'payment', 'processing', 'success'
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [vodafoneNumber, setVodafoneNumber] = useState("");
  const [vodafoneError, setVodafoneError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("vodafone");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [serviceType, setServiceType] = useState("clinic");
  const [expandedPanel, setExpandedPanel] = useState("payment");
  const [transactionCode, setTransactionCode] = useState("");
  const [bookingData, setBookingData] = useState(null);
  const [activeStep, setActiveStep] = useState(4);

  // Generate random transaction code
  useEffect(() => {
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    setTransactionCode(`VC${random}`);

    // Simulate fetching booking data
    setBookingData({
      doctor: {
        name: "د. نرمين عزيزة",
        specialty: "أخصائي باطنة",
        consultationFee: "٤٠٠",
        image: "/api/placeholder/40/40"
      },
      patient: {
        name: "نور محمد",
        phone: "01234567890",
        age: "35"
      },
      date: "2025-03-22",
      time: "١٠:٠٠",
      visitType: "كشف أولي",
      discount: "٠"
    });
  }, []);

  // Format date with Arabic locale
  const formatDate = (date) => {
    if (!date) return "";
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);

    // Clear Vodafone error when switching payment methods
    if (method !== "vodafone") {
      setVodafoneError("");
    }
  };

  // Handle service type change
  const handleServiceTypeChange = (type) => {
    setServiceType(type);
  };

  // Toggle panel expansion
  const togglePanel = (panel) => {
    setExpandedPanel(expandedPanel === panel ? "" : panel);
  };

  // Handle Vodafone number change with validation
  const handleVodafoneNumberChange = (e) => {
    const value = e.target.value;
    setVodafoneNumber(value);

    // Clear error on typing
    if (vodafoneError) {
      setVodafoneError("");
    }
  };

  // Handle terms agreement
  const handleTermsChange = (e) => {
    setAgreeToTerms(e.target.checked);

    // Clear error when accepting terms
    if (termsError) {
      setTermsError("");
    }
  };

  // Handle payment confirmation
  const handleConfirmPayment = () => {
    // Validate based on payment method
    if (paymentMethod === "vodafone") {
      // Validate Vodafone number
      if (!vodafoneNumber) {
        setVodafoneError("يرجى إدخال رقم فودافون كاش");
        return;
      } else if (!/^01[0-2]\d{8}$/.test(vodafoneNumber)) {
        setVodafoneError("رقم فودافون كاش غير صحيح");
        return;
      } else {
        setVodafoneError("");
      }
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      setTermsError("يجب الموافقة على الشروط والأحكام للمتابعة");
      return;
    } else {
      setTermsError("");
    }

    // Process payment simulation
    setIsProcessing(true);

    // Simulate API call with timeout
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentSuccess(true);

      // After showing success message, move to completed state
      setTimeout(() => {
        setShowPaymentSuccess(false);
        setIsCompleted(true);
        setCurrentView("success");
      }, 3000);
    }, 2000);
  };

  // Handle going home after successful booking
  const handleGoHome = () => {
    console.log("Navigating to home");
    setCurrentView("payment");
    setIsCompleted(false);
  };

  // If no booking data yet, show loading
  if (!bookingData && currentView === "payment") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-12 w-12 text-teal-500 mx-auto animate-spin" />
          <p className="mt-4 text-lg">جاري تحميل بيانات الحجز...</p>
        </div>
      </div>
    );
  }

  // Payment Success View
  if (currentView === "success") {
    return (
      <div dir="rtl" className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="bg-green-500 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-xl font-bold text-green-600">تم الحجز بنجاح</h1>
            <p className="text-gray-600 mt-1">تم استلام طلب الحجز وتأكيد الدفع</p>
          </div>

          <div className="bg-white rounded-lg border border-teal-100 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">تفاصيل الحجز</h2>
              <div
                className={`
                px-3 py-1 rounded-full text-sm font-medium flex items-center
                ${
                  serviceType === "clinic"
                    ? "bg-teal-50 text-teal-600"
                    : serviceType === "video"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-purple-50 text-purple-600"
                }
              `}
              >
                {serviceType === "clinic" ? (
                  <MapPin className="h-3 w-3 mr-1" />
                ) : serviceType === "video" ? (
                  <Video className="h-3 w-3 mr-1" />
                ) : (
                  <Home className="h-3 w-3 mr-1" />
                )}
                <span>
                  {serviceType === "clinic"
                    ? "زيارة العيادة"
                    : serviceType === "video"
                    ? "استشارة عن بعد"
                    : "زيارة منزلية"}
                </span>
              </div>
            </div>

            <hr className="my-3" />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">اسم المريض</span>
                <span className="font-medium">{bookingData.patient.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">موعد الزيارة</span>
                <span className="font-medium">
                  {formatDate(bookingData.date)} - {bookingData.time}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">الطبيب</span>
                <span className="font-medium">{bookingData.doctor.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">رقم المعاملة</span>
                <span className="font-medium">{transactionCode}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">طريقة الدفع</span>
                <span className="font-medium">
                  {paymentMethod === "vodafone"
                    ? "فودافون كاش"
                    : paymentMethod === "clinic"
                    ? "الدفع في العيادة"
                    : "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">المبلغ المدفوع</span>
                <span className="font-bold">
                  {bookingData.doctor.consultationFee} جنيه
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <div className="flex gap-2">
              <AlertCircle className="text-blue-500 h-5 w-5 mt-1 shrink-0" />
              <div>
                <p className="font-medium text-right">
                  سيتم إرسال تفاصيل الموعد على رقم الهاتف
                </p>
                <p className="font-medium text-right">
                  للاستفسار يرجى الاتصال على <strong>٠٢١٩١٢٣٠١</strong>
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGoHome}
            className="bg-teal-600 hover:bg-teal-700 text-white w-full py-3 rounded-lg font-medium transition duration-200"
          >
            العودة إلى الصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  // Payment Page View
  return (
    <div dir="rtl" className="bg-gray-50 min-h-screen py-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={navigate}
            className="p-2 mr-2 rounded-full bg-teal-50 text-teal-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg">إتمام الحجز</h1>
            <p className="text-gray-500 text-sm">الخطوة ٥/٥</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {["اختيار التخصص", "اختيار الطبيب", "اختيار الموعد", "بيانات المريض", "الدفع"].map(
              (step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`rounded-full h-8 w-8 flex items-center justify-center mb-1 ${
                      index <= activeStep
                        ? "bg-teal-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index < activeStep ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  {index === activeStep && (
                    <div className="h-1 w-1 rounded-full bg-teal-600"></div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Service Type Selection */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <h2 className="font-bold mb-3">نوع الخدمة</h2>

          <div className="flex gap-2">
            <button
              onClick={() => handleServiceTypeChange("clinic")}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition duration-200 ${
                serviceType === "clinic"
                  ? "bg-teal-600 text-white"
                  : "border border-teal-600 text-teal-600"
              }`}
            >
              <MapPin className="h-4 w-4 mr-1" />
              <span>في العيادة</span>
            </button>

            <button
              onClick={() => handleServiceTypeChange("video")}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition duration-200 ${
                serviceType === "video"
                  ? "bg-blue-600 text-white"
                  : "border border-blue-600 text-blue-600"
              }`}
            >
              <Video className="h-4 w-4 mr-1" />
              <span>استشارة عن بعد</span>
            </button>

            <button
              onClick={() => handleServiceTypeChange("home")}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition duration-200 ${
                serviceType === "home"
                  ? "bg-purple-600 text-white"
                  : "border border-purple-600 text-purple-600"
              }`}
            >
              <Home className="h-4 w-4 mr-1" />
              <span>زيارة منزلية</span>
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <div
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
            onClick={() => togglePanel("payment")}
          >
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-teal-600 mr-2" />
              <span className="font-bold">خيارات الدفع</span>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                expandedPanel === "payment" ? "transform rotate-180" : ""
              }`}
            />
          </div>

          {expandedPanel === "payment" && (
            <div className="p-4">
              {/* Payment Options */}
              <div className="space-y-3">
                {/* Vodafone Cash Option */}
                <div
                  className={`p-3 rounded-lg border ${
                    paymentMethod === "vodafone"
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-200"
                  } transition duration-200`}
                  onClick={() => handlePaymentMethodChange("vodafone")}
                >
                  <div className="flex items-center">
                    <div
                      className={`h-5 w-5 rounded-full border ${
                        paymentMethod === "vodafone"
                          ? "border-teal-600"
                          : "border-gray-400"
                      } flex items-center justify-center mr-2`}
                    >
                      {paymentMethod === "vodafone" && (
                        <div className="h-3 w-3 rounded-full bg-teal-600"></div>
                      )}
                    </div>
                    <span
                      className={`${
                        paymentMethod === "vodafone" ? "font-bold" : ""
                      }`}
                    >
                      فودافون كاش
                    </span>
                  </div>

                  {paymentMethod === "vodafone" && (
                    <div className="mt-3 pr-7">
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={vodafoneNumber}
                          onChange={handleVodafoneNumberChange}
                          placeholder="أدخل رقم فودافون كاش"
                          className={`w-full p-2 border ${
                            vodafoneError ? "border-red-500" : "border-gray-300"
                          } rounded-lg`}
                        />
                      </div>
                      {vodafoneError && (
                        <p className="text-red-500 text-sm mt-1">
                          {vodafoneError}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm mt-2">
                        سيتم إرسال رمز التحقق إلى هذا الرقم لتأكيد الدفع
                      </p>
                    </div>
                  )}
                </div>

                {/* Pay at Clinic Option (only for clinic visits) */}
                {serviceType === "clinic" && (
                  <div
                    className={`p-3 rounded-lg border ${
                      paymentMethod === "clinic"
                        ? "border-teal-600 bg-teal-50"
                        : "border-gray-200"
                    } transition duration-200`}
                    onClick={() => handlePaymentMethodChange("clinic")}
                  >
                    <div className="flex items-center">
                      <div
                        className={`h-5 w-5 rounded-full border ${
                          paymentMethod === "clinic"
                            ? "border-teal-600"
                            : "border-gray-400"
                        } flex items-center justify-center mr-2`}
                      >
                        {paymentMethod === "clinic" && (
                          <div className="h-3 w-3 rounded-full bg-teal-600"></div>
                        )}
                      </div>
                      <div>
                        <span
                          className={`block ${
                            paymentMethod === "clinic" ? "font-bold" : ""
                          }`}
                        >
                          الدفع في العيادة
                        </span>
                        <span className="text-sm text-gray-500">
                          يمكنك الدفع نقدًا أو باستخدام بطاقة الائتمان في
                          العيادة
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="mt-4">
                <div className="flex items-start">
                  <div
                    className={`h-5 w-5 rounded border mt-1 ${
                      agreeToTerms ? "bg-teal-600 border-teal-600" : "border-gray-400"
                    } flex items-center justify-center cursor-pointer`}
                    onClick={() =>
                      handleTermsChange({ target: { checked: !agreeToTerms } })
                    }
                  >
                    {agreeToTerms && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className="mr-2 text-sm">
                    أوافق على الشروط والأحكام وسياسة الخصوصية
                  </span>
                </div>
                {termsError && (
                  <p className="text-red-500 text-sm mt-1 mr-7">{termsError}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
          <div
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
            onClick={() => togglePanel("summary")}
          >
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-teal-600 mr-2" />
              <span className="font-bold">ملخص الحجز</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold text-teal-600 ml-2">
                {bookingData?.doctor?.consultationFee} جنيه
              </span>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                  expandedPanel === "summary" ? "transform rotate-180" : ""
                }`}
              />
            </div>
          </div>

          {expandedPanel === "summary" && (
            <div className="p-4">
              {/* Doctor Info */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-3">
                  <img
                    src="/api/placeholder/48/48"
                    alt={bookingData?.doctor?.name || ""}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold">{bookingData?.doctor?.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {bookingData?.doctor?.specialty}
                  </p>
                </div>
              </div>

              <hr className="my-3" />

              {/* Appointment Details */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <span>
                    {formatDate(bookingData?.date)} - {bookingData?.time}
                  </span>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                  <span>
                    {serviceType === "clinic"
                      ? "زيارة في العيادة"
                      : serviceType === "video"
                      ? "استشارة عن بعد"
                      : "زيارة منزلية"}
                  </span>
                </div>

                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-2" />
                  <span>{bookingData?.visitType}</span>
                </div>
              </div>

              <hr className="my-3" />

              {/* Patient Details */}
              <div>
                <h3 className="font-bold mb-2">تفاصيل المريض</h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">الاسم</span>
                    <span>{bookingData?.patient?.name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-500">
                      <Phone className="h-5 w-5 text-gray-500 mr-1" />
                      <span>رقم الهاتف</span>
                    </div>
                    <span>{bookingData?.patient?.phone}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">العمر</span>
                    <span>{bookingData?.patient?.age} سنة</span>
                  </div>
                </div>
              </div>

              <hr className="my-3" />

              {/* Payment Details */}
              <div>
                <h3 className="font-bold mb-2">تفاصيل الدفع</h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">سعر الكشف</span>
                    <span>{bookingData?.doctor?.consultationFee} جنيه</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">الخصم</span>
                    <span>{bookingData?.discount} جنيه</span>
                  </div>

                  <hr className="border-dashed" />

                  <div className="flex justify-between font-bold">
                    <span>الإجمالي</span>
                    <span className="text-teal-600">
                      {bookingData?.doctor?.consultationFee} جنيه
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="flex items-center justify-center gap-1 mb-4 text-gray-500">
          <Lock className="h-4 w-4" />
          <span className="text-xs">
            جميع المعاملات مؤمنة وتستخدم تشفير SSL/TLS
          </span>
        </div>

        {/* Payment Success Alert */}
        {showPaymentSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center animate-fade-in">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="font-medium">
              تمت عملية الدفع بنجاح! جاري تأكيد الحجز...
            </span>
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={handleConfirmPayment}
          disabled={isProcessing}
          className="bg-teal-600 hover:bg-teal-700 text-white w-full py-3 rounded-lg font-medium transition duration-200 disabled:bg-teal-300"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <Clock className="animate-spin mr-2 h-5 w-5" />
              <span>جاري معالجة الدفع...</span>
            </div>
          ) : (
            "تأكيد ودفع"
          )}
        </button>

        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
}
