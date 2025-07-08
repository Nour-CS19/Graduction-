import React from 'react';
import { useNavigate } from 'react-router-dom';

const UpdatePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-5 text-center" style={{ width: "100%", maxWidth: "450px", borderRadius: "15px" }}>
        <h2 style={{ color: "#FF5722", fontWeight: "bold" }}>تحديث البيانات</h2>
        <p className="mt-3" style={{ fontSize: "16px", color: "#555" }}>
          يبدو أنك لم تقم بإدخال البريد الإلكتروني أو كلمة المرور بشكل صحيح. يرجى تحديث بياناتك والمحاولة مرة أخرى.
        </p>
        <button
          className="btn btn-primary mt-4 w-100"
          style={{ borderRadius: "10px", fontWeight: "bold" }}
          onClick={() => navigate('/forgot-password')}
        >
          إعادة تعيين كلمة المرور
        </button>
      </div>
    </div>
  );
};

export default UpdatePage;
