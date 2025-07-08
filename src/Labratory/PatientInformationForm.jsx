
import React from 'react';
import { User, Phone, MapPin, FileText, CreditCard } from 'lucide-react';

const PatientInformationForm = ({
  patientData,
  setPatientData,
  errors,
  setErrors,
  useSavedInfo,
  setUseSavedInfo,
  bookingLocation,
  calculateTotalPrice,
  paymentImage,
  handlePaymentImageUpload,
  termsChecked,
  setTermsChecked
}) => {
  return (
    <div className="mb-5">
      <h4 className="mb-3 text-center">Patient Details</h4>
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Patient Information</h5>
            <div className="form-check form-switch text-white">
              <input
                className="form-check-input"
                type="checkbox"
                id="useSavedInfo"
                checked={useSavedInfo}
                onChange={(e) => setUseSavedInfo(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="useSavedInfo">
                Use saved info
              </label>
            </div>
          </div>
        </div>
        <div className="card-body p-4">
          {/* Patient Name Input */}
          <div className="mb-3">
            <label htmlFor="patientName" className="form-label">
              <User size={18} className="me-2" />
              Full Name*
            </label>
            <input
              type="text"
              className={`form-control ${errors.patientName ? 'is-invalid' : ''}`}
              id="patientName"
              placeholder="Enter your full name"
              value={patientData.name}
              onChange={(e) => {
                const newValue = e.target.value;
                setPatientData((prev) => ({ ...prev, name: newValue }));
                if (errors.patientName) {
                  setErrors((prev) => ({ ...prev, patientName: undefined }));
                }
              }}
            />
            {errors.patientName && (
              <div className="invalid-feedback">{errors.patientName}</div>
            )}
          </div>
          
          {/* Patient Phone Input */}
          <div className="mb-3">
            <label htmlFor="patientPhone" className="form-label">
              <Phone size={18} className="me-2" />
              Phone Number*
            </label>
            <input
              type="tel"
              className={`form-control ${errors.patientPhone ? 'is-invalid' : ''}`}
              id="patientPhone"
              placeholder="e.g., 01012345678"
              value={patientData.phone}
              onChange={(e) => {
                const newValue = e.target.value;
                setPatientData((prev) => ({ ...prev, phone: newValue }));
                if (errors.patientPhone) {
                  setErrors((prev) => ({ ...prev, patientPhone: undefined }));
                }
              }}
            />
            {errors.patientPhone && (
              <div className="invalid-feedback">{errors.patientPhone}</div>
            )}
          </div>
          
          {/* Patient Address Input */}
          <div className="mb-3">
            <label htmlFor="patientAddress" className="form-label">
              <MapPin size={18} className="me-2" />
              Full Address*
            </label>
            <textarea
              className={`form-control ${errors.patientAddress ? 'is-invalid' : ''}`}
              id="patientAddress"
              rows="2"
              placeholder="Enter your complete address"
              value={patientData.address}
              onChange={(e) => {
                const newValue = e.target.value;
                setPatientData((prev) => ({ ...prev, address: newValue }));
                if (errors.patientAddress) {
                  setErrors((prev) => ({ ...prev, patientAddress: undefined }));
                }
              }}
            ></textarea>
            {errors.patientAddress && (
              <div className="invalid-feedback">{errors.patientAddress}</div>
            )}
          </div>
          
          {/* Patient Condition Input */}
          <div className="mb-3">
            <label htmlFor="patientCondition" className="form-label">
              <FileText size={18} className="me-2" />
              Medical Condition (optional)
            </label>
            <textarea
              className="form-control"
              id="patientCondition"
              rows="3"
              placeholder="Describe any medical conditions or special requirements"
              value={patientData.condition}
              onChange={(e) => {
                const newValue = e.target.value;
                setPatientData((prev) => ({ ...prev, condition: newValue }));
              }}
            ></textarea>
            <div className="form-text">
              This helps the laboratory prepare for your specific needs
            </div>
          </div>
          
          {/* Terms & Conditions Checkbox */}
          <div className="form-check mb-3">
            <input
              className={`form-check-input ${errors.terms ? 'is-invalid' : ''}`}
              type="checkbox"
              id="termsCheck"
              checked={termsChecked}
              onChange={(e) => {
                setTermsChecked(e.target.checked);
                if (errors.terms) {
                  setErrors((prev) => ({ ...prev, terms: undefined }));
                }
              }}
            />
            <label className="form-check-label" htmlFor="termsCheck">
              I agree to the terms and conditions
            </label>
            {errors.terms && (
              <div className="invalid-feedback">{errors.terms}</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Payment Section – Only for "At Home" bookings */}
      {bookingLocation === "At Home" && (
        <div className="mb-5">
          <h4 className="mb-3 text-center">Payment</h4>
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Payment Details</h5>
                <h5 className="mb-0">EGP {calculateTotalPrice()}</h5>
              </div>
            </div>
            <div className="card-body p-4">
              <div className="mb-4">
                <label htmlFor="paymentScreenshot" className="form-label d-flex align-items-center mb-2">
                  <CreditCard size={18} className="me-2" />
                  Upload Payment Screenshot*
                </label>
                <input
                  type="file"
                  className={`form-control ${errors.paymentImage ? 'is-invalid' : ''}`}
                  id="paymentScreenshot"
                  accept="image/*"
                  onChange={handlePaymentImageUpload}
                />
                {errors.paymentImage && (
                  <div className="invalid-feedback">{errors.paymentImage}</div>
                )}
              </div>
              
              {paymentImage && (
                <div className="text-center mt-3 border p-2 rounded">
                  <p className="mb-2 text-muted small">Preview:</p>
                  <img
                    src={paymentImage}
                    alt="Payment Screenshot"
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInformationForm;
