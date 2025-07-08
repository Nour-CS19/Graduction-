import { useState } from 'react';
import './CompactMedicalForm.css'; // Assuming you'll add the CSS in a separate file

function CompactMedicalForm() {
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [forSelf, setForSelf] = useState(true);
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('');
  const [showForm, setShowForm] = useState(false); // State to toggle form visibility

  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const specialties = [
    { name: 'Cardiology', icon: '❤️' },
    { name: 'Dermatology', icon: '🧴' },
    { name: 'Gastroenterology', icon: '🥪' },
    { name: 'Neurology', icon: '🧠' },
    { name: 'Oncology', icon: '🩺' },
    { name: 'Pediatrics', icon: '👶' },
    { name: 'Psychology', icon: '🧠' },
    { name: 'General Practice', icon: '🩺' }
  ];

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });

    // Validate the specific field
    const newErrors = { ...errors };

    if (field === 'specialty' && !specialty) {
      newErrors.specialty = 'Please select a specialty';
    } else if (field === 'specialty' && specialty) {
      delete newErrors.specialty;
    }

    if (field === 'question' && !question.trim()) {
      newErrors.question = 'Please enter your question';
    } else if (field === 'question' && question.trim()) {
      delete newErrors.question;
    }

    if (field === 'description' && !description.trim()) {
      newErrors.description = 'Please provide a description';
    } else if (field === 'description' && description.trim()) {
      delete newErrors.description;
    }

    if (field === 'age' && !age) {
      newErrors.age = 'Please enter your age';
    } else if (field === 'age' && age) {
      delete newErrors.age;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!specialty) newErrors.specialty = 'Please select a specialty';
    if (!question.trim()) newErrors.question = 'Please enter your question';
    if (!description.trim()) newErrors.description = 'Please provide a description';
    if (!age) newErrors.age = 'Please enter your age';

    setErrors(newErrors);
    setTouched({
      specialty: true,
      question: true,
      description: true,
      age: true
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      alert('Your question has been submitted!');
      // Reset form
      setQuestion('');
      setDescription('');
      setSpecialty('');
      setForSelf(true);
      setGender('male');
      setAge('');
      setErrors({});
      setTouched({});
      setShowForm(false); // Hide form after submission
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 form-container">
          {/* Banner with "Ask now" button */}
          <div className="banner-container">
            <div className="banner-text">
              Have a medical question?
            </div>
            <div className="banner-subtext">
              Submit your medical question and receive an answer from a specialized doctor
            </div>
            <button 
              className="ask-now-btn" 
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Hide Form' : 'Ask now'}
            </button>
          </div>

          {/* Form content (shown/hidden based on state) */}
          {showForm && (
            <div className="card shadow-sm mb-3 mt-3">
              <div className="card-body p-3">
                {/* Specialty dropdown */}
                <div className="mb-2 position-relative">
                  <button 
                    className={`form-control text-start d-flex justify-content-between align-items-center ${touched.specialty && errors.specialty ? 'border-danger' : ''}`}
                    onClick={() => setShowSpecialtyDropdown(!showSpecialtyDropdown)}
                    onBlur={() => {
                      setTimeout(() => handleBlur('specialty'), 200);
                    }}
                  >
                    <span className={specialty ? 'text-dark' : 'text-muted'}>
                      {specialty || 'Choose a specialty'}
                    </span>
                    <span>▼</span>
                  </button>
                  
                  {touched.specialty && errors.specialty && (
                    <div className="text-danger error-text">
                      {errors.specialty}
                    </div>
                  )}
                  
                  {showSpecialtyDropdown && (
                    <div className="position-absolute w-100 bg-white border rounded shadow-sm specialty-dropdown">
                      {specialties.map((item) => (
                        <div 
                          key={item.name} 
                          className="specialty-item hover-bg-light"
                          onClick={() => {
                            setSpecialty(item.name);
                            setShowSpecialtyDropdown(false);
                          }}
                        >
                          <span className="me-2">{item.icon}</span>
                          <span>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Question field */}
                <div className="mb-2">
                  <label className="form-label form-label-custom">
                    Your question <span className="text-muted">(Your identity will be anonymous)</span>
                  </label>
                  <input 
                    type="text" 
                    className={`form-control form-control-custom ${touched.question && errors.question ? 'border-danger' : ''}`}
                    placeholder="Example: What are the causes of acne?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onBlur={() => handleBlur('question')}
                    maxLength={50}
                  />
                  <div className="d-flex justify-content-between mt-1">
                    {touched.question && errors.question ? (
                      <div className="text-danger error-text">
                        {errors.question}
                      </div>
                    ) : <div></div>}
                    <span className="char-count">
                      {question.length}/50 characters
                    </span>
                  </div>
                </div>

                {/* Description field */}
                <div className="mb-2">
                  <label className="form-label form-label-custom">
                    Question Description (Explanation of symptoms)
                  </label>
                  <textarea 
                    className={`form-control form-control-custom textarea-custom ${touched.description && errors.description ? 'border-danger' : ''}`}
                    rows="3"
                    placeholder="Provide details about your symptoms or concerns"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => handleBlur('description')}
                    maxLength={250}
                  />
                  <div className="d-flex justify-content-between mt-1">
                    {touched.description && errors.description ? (
                      <div className="text-danger error-text">
                        {errors.description}
                      </div>
                    ) : <div></div>}
                    <span className="char-count">
                      {description.length}/250 characters
                    </span>
                  </div>
                </div>

                {/* Stacked layout for "The question is for" and "Select gender" */}
                <div className="mb-2">
                  {/* Who is it for */}
                  <div className="mb-2">
                    <label className="form-label form-label-custom">
                      The question is for
                    </label>
                    <div className="d-flex">
                      <button 
                        type="button" 
                        className={`selector-btn rounded-start ${forSelf ? 'selector-btn-active' : ''}`}
                        onClick={() => setForSelf(true)}
                      >
                        For myself
                      </button>
                      <button 
                        type="button" 
                        className={`selector-btn rounded-end ${!forSelf ? 'selector-btn-active' : ''}`}
                        onClick={() => setForSelf(false)}
                      >
                        For another
                      </button>
                    </div>
                  </div>

                  {/* Gender selection */}
                  <div>
                    <label className="form-label form-label-custom">
                      Select gender
                    </label>
                    <div className="d-flex">
                      <button 
                        type="button" 
                        className={`selector-btn rounded-start ${gender === 'male' ? 'selector-btn-active' : ''}`}
                        onClick={() => setGender('male')}
                      >
                        Male
                      </button>
                      <button 
                        type="button" 
                        className={`selector-btn rounded-end ${gender === 'female' ? 'selector-btn-active' : ''}`}
                        onClick={() => setGender('female')}
                      >
                        Female
                      </button>
                    </div>
                  </div>
                </div>

                {/* Age field */}
                <div className="mb-2">
                  <label className="form-label form-label-custom">
                    How old are you? <span className="text-muted">(years old)</span>
                  </label>
                  <input 
                    type="number" 
                    className={`form-control form-control-custom ${touched.age && errors.age ? 'border-danger' : ''}`}
                    placeholder="Add age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    onBlur={() => handleBlur('age')}
                  />
                  {touched.age && errors.age && (
                    <div className="text-danger error-text mt-1">
                      {errors.age}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button 
                  type="button" 
                  className="btn w-100 mb-2 submit-btn"
                  onClick={handleSubmit}
                >
                  Submit
                </button>

                {/* Disclaimer */}
                <p className="disclaimer">
                  Text answers on Vezeeta are not intended for individual diagnosis, treatment or prescription.
                  For these, please consult a doctor.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompactMedicalForm;