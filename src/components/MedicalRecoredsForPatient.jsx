
import React, { useState, useEffect } from "react";
import Nav from "./Nav"; // Import Nav component
import Footer from "./Footer"; // Import Footer component

// Mock Patient Auth hook
const useAuth = () => ({
  user: {
    name: "مريض جديد",
    email: "patient@email.com",
    patientId: "EG001",
    dateOfBirth: "",
    nationalId: "",
  },
});

const PatientMedicalRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newRecord, setNewRecord] = useState({
    type: "symptom",
    title: "",
    description: "",
    date: "",
    severity: "mild",
    location: "",
    duration: "",
    triggers: "",
    medications: "",
    dosage: "",
    frequency: "",
    sideEffects: "",
    doctorName: "",
    hospital: "",
    diagnosis: "",
    treatment: "",
    followUp: "",
    notes: "",
    attachments: [],
  });

  // Initialize with empty records
  useEffect(() => {
    setRecords([]);
  }, []);

  const handleAddRecord = () => {
    if (!newRecord.title.trim()) {
      alert("من فضلك أدخل عنوان للسجل الطبي");
      return;
    }

    const id = records.length > 0 ? Math.max(...records.map((r) => r.id), 0) + 1 : 1;
    const recordWithId = {
      ...newRecord,
      id,
      date: newRecord.date || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };
    setRecords([recordWithId, ...records]);
    setNewRecord({
      type: "symptom",
      title: "",
      description: "",
      date: "",
      severity: "mild",
      location: "",
      duration: "",
      triggers: "",
      medications: "",
      dosage: "",
      frequency: "",
      sideEffects: "",
      doctorName: "",
      hospital: "",
      diagnosis: "",
      treatment: "",
      followUp: "",
      notes: "",
      attachments: [],
    });
    setShowAddModal(false);
  };

  const handleEditRecord = () => {
    if (!selectedRecord.title.trim()) {
      alert("من فضلك أدخل عنوان للسجل الطبي");
      return;
    }

    setRecords(records.map((record) => (record.id === selectedRecord.id ? selectedRecord : record)));
    setShowEditModal(false);
    setSelectedRecord(null);
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      setRecords(records.filter((record) => record.id !== id));
    }
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.doctorName && record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === "all" || record.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case "symptom":
        return <i className="bi bi-exclamation-circle text-danger me-2"></i>;
      case "medication":
        return <i className="bi bi-capsule text-primary me-2"></i>;
      case "appointment":
        return <i className="bi bi-calendar text-success me-2"></i>;
      case "test":
        return <i className="bi bi-heart-pulse text-purple me-2"></i>;
      default:
        return <i className="bi bi-file-text text-secondary me-2"></i>;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "symptom":
        return "bg-danger-subtle text-danger";
      case "medication":
        return "bg-primary-subtle text-primary";
      case "appointment":
        return "bg-success-subtle text-success";
      case "test":
        return "bg-purple-subtle text-purple";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "symptom":
        return "أعراض";
      case "medication":
        return "دواء";
      case "appointment":
        return "موعد طبي";
      case "test":
        return "تحليل";
      default:
        return "أخرى";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "mild":
        return "bg-warning-subtle text-warning";
      case "moderate":
        return "bg-orange-subtle text-orange";
      case "severe":
        return "bg-danger-subtle text-danger";
      default:
        return "bg-secondary-subtle text-secondary";
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case "mild":
        return "خفيف";
      case "moderate":
        return "متوسط";
      case "severe":
        return "شديد";
      default:
        return "";
    }
  };

  const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;

    return (
      <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} dir="rtl">
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header d-flex flex-row-reverse align-items-center">
              <button type="button" className="btn-close ms-auto" onClick={onClose} aria-label="إغلاق"></button>
              <h5 className="modal-title flex-grow-1 text-center">{title}</h5>
            </div>
            <div className="modal-body">{children}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderFormFields = (record, setRecord) => {
    const recordType = record.type;

    return (
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">نوع السجل</label>
          <select
            value={record.type}
            onChange={(e) => setRecord({ ...record, type: e.target.value })}
            className="form-select"
          >
            <option value="symptom">أعراض/شكوى</option>
            <option value="medication">دواء</option>
            <option value="appointment">موعد طبي</option>
            <option value="test">تحليل/فحص</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">التاريخ</label>
          <input
            type="date"
            value={record.date}
            onChange={(e) => setRecord({ ...record, date: e.target.value })}
            className="form-control"
          />
        </div>

        <div className="col-12">
          <label className="form-label">العنوان *</label>
          <input
            type="text"
            value={record.title}
            onChange={(e) => setRecord({ ...record, title: e.target.value })}
            className="form-control"
            placeholder="أدخل عنوان مختصر للسجل"
          />
        </div>

        <div className="col-12">
          <label className="form-label">الوصف</label>
          <textarea
            value={record.description}
            onChange={(e) => setRecord({ ...record, description: e.target.value })}
            className="form-control"
            rows="3"
            placeholder="اكتب وصف تفصيلي"
          />
        </div>

        {recordType === "symptom" && (
          <>
            <div className="col-md-6">
              <label className="form-label">شدة الأعراض</label>
              <select
                value={record.severity}
                onChange={(e) => setRecord({ ...record, severity: e.target.value })}
                className="form-select"
              >
                <option value="mild">خفيف</option>
                <option value="moderate">متوسط</option>
                <option value="severe">شديد</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">المكان</label>
              <input
                type="text"
                value={record.location}
                onChange={(e) => setRecord({ ...record, location: e.target.value })}
                className="form-control"
                placeholder="أين تشعر بالأعراض؟"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">المدة</label>
              <input
                type="text"
                value={record.duration}
                onChange={(e) => setRecord({ ...record, duration: e.target.value })}
                className="form-control"
                placeholder="منذ متى تشعر بهذه الأعراض؟"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">المسببات</label>
              <input
                type="text"
                value={record.triggers}
                onChange={(e) => setRecord({ ...record, triggers: e.target.value })}
                className="form-control"
                placeholder="ما الذي قد يكون سبب هذه الأعراض؟"
              />
            </div>
          </>
        )}

        {recordType === "medication" && (
          <>
            <div className="col-md-6">
              <label className="form-label">اسم الدواء</label>
              <input
                type="text"
                value={record.medications}
                onChange={(e) => setRecord({ ...record, medications: e.target.value })}
                className="form-control"
                placeholder="اسم الدواء"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">الجرعة</label>
              <input
                type="text"
                value={record.dosage}
                onChange={(e) => setRecord({ ...record, dosage: e.target.value })}
                className="form-control"
                placeholder="مثال: 500 ملجم"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">عدد المرات</label>
              <input
                type="text"
                value={record.frequency}
                onChange={(e) => setRecord({ ...record, frequency: e.target.value })}
                className="form-control"
                placeholder="مثال: مرتين يومياً"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">الأعراض الجانبية</label>
              <input
                type="text"
                value={record.sideEffects}
                onChange={(e) => setRecord({ ...record, sideEffects: e.target.value })}
                className="form-control"
                placeholder="أي أعراض جانبية لاحظتها"
              />
            </div>
          </>
        )}

        {(recordType === "appointment" || recordType === "test") && (
          <>
            <div className="col-md-6">
              <label className="form-label">اسم الطبيب</label>
              <input
                type="text"
                value={record.doctorName}
                onChange={(e) => setRecord({ ...record, doctorName: e.target.value })}
                className="form-control"
                placeholder="اسم الطبيب"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">المستشفى/العيادة</label>
              <input
                type="text"
                value={record.hospital}
                onChange={(e) => setRecord({ ...record, hospital: e.target.value })}
                className="form-control"
                placeholder="اسم المستشفى أو العيادة"
              />
            </div>
            {recordType === "appointment" && (
              <>
                <div className="col-md-6">
                  <label className="form-label">التشخيص</label>
                  <input
                    type="text"
                    value={record.diagnosis}
                    onChange={(e) => setRecord({ ...record, diagnosis: e.target.value })}
                    className="form-control"
                    placeholder="ما قاله الطبيب؟"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">العلاج</label>
                  <input
                    type="text"
                    value={record.treatment}
                    onChange={(e) => setRecord({ ...record, treatment: e.target.value })}
                    className="form-control"
                    placeholder="العلاج الموصى به"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">المتابعة</label>
                  <input
                    type="text"
                    value={record.followUp}
                    onChange={(e) => setRecord({ ...record, followUp: e.target.value })}
                    className="form-control"
                    placeholder="موعد المتابعة أو تعليمات إضافية"
                  />
                </div>
              </>
            )}
          </>
        )}

        <div className="col-12">
          <label className="form-label">ملاحظات إضافية</label>
          <textarea
            value={record.notes}
            onChange={(e) => setRecord({ ...record, notes: e.target.value })}
            className="form-control"
            rows="3"
            placeholder="أي معلومات إضافية تريد تسجيلها"
          />
        </div>
      </div>
    );
  };

  return (
    <div dir="rtl">
      <Nav />

      <div className="container py-4">
        {/* Header */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 fw-bold">سجلاتي الطبية</h1>
              <p className="text-muted">تتبع أعراضك ومواعيدك الطبية</p>
              <p className="small text-muted">
                المريض: {user?.name} | الرقم: {user?.patientId}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary d-flex align-items-center gap-2"
            >
              <i className="bi bi-plus"></i>
              إضافة سجل طبي
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-8">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    placeholder="ابحث في سجلاتك..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="form-select"
                >
                  <option value="all">جميع السجلات</option>
                  <option value="symptom">الأعراض</option>
                  <option value="medication">الأدوية</option>
                  <option value="appointment">المواعيد</option>
                  <option value="test">التحاليل</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="row g-3">
          {filteredRecords.map((record) => (
            <div key={record.id} className="col-12">
              <div className="card h-100">
                <div className="card-body d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      {getTypeIcon(record.type)}
                      <h5 className="card-title mb-0">{record.title}</h5>
                      <span className={`badge ${getTypeColor(record.type)}`}>{getTypeLabel(record.type)}</span>
                      {record.severity && (
                        <span className={`badge ${getSeverityColor(record.severity)}`}>
                          {getSeverityLabel(record.severity)}
                        </span>
                      )}
                    </div>
                    <p className="card-text text-muted">{record.description}</p>
                    <div className="d-flex gap-3 small text-muted">
                      <span className="d-flex align-items-center gap-1">
                        <i className="bi bi-calendar"></i>
                        {new Date(record.date).toLocaleDateString("ar-EG")}
                      </span>
                      {record.doctorName && (
                        <span className="d-flex align-items-center gap-1">
                          <i className="bi bi-person"></i>
                          {record.doctorName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowViewModal(true);
                      }}
                      className="btn btn-outline-primary btn-sm"
                      title="عرض التفاصيل"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowEditModal(true);
                      }}
                      className="btn btn-outline-success btn-sm"
                      title="تعديل السجل"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="btn btn-outline-danger btn-sm"
                      title="حذف السجل"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRecords.length === 0 && (
          <div className="card text-center py-5">
            <i className="bi bi-heart text-muted" style={{ fontSize: "3rem" }}></i>
            <h5 className="mt-2">
              {records.length === 0 ? "لم تقم بإضافة أي سجلات طبية بعد" : "لا توجد سجلات مطابقة للبحث"}
            </h5>
            <p className="text-muted">
              {records.length === 0
                ? "ابدأ بتتبع صحتك عن طريق إضافة أول سجل طبي لك"
                : searchTerm || filterType !== "all"
                ? "جرب تعديل كلمات البحث أو الفلتر"
                : "لا توجد سجلات للعرض"}
            </p>
            {records.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary mt-3 d-flex align-items-center gap-2 mx-auto"
              >
                <i className="bi bi-plus"></i>
                إضافة أول سجل طبي
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      <Modal show={showAddModal} onClose={() => setShowAddModal(false)} title="إضافة سجل طبي جديد">
        {renderFormFields(newRecord, setNewRecord)}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button onClick={() => setShowAddModal(false)} className="btn btn-secondary">
            إلغاء
          </button>
          <button onClick={handleAddRecord} className="btn btn-primary">
            إضافة السجل
          </button>
        </div>
      </Modal>

      {/* Edit Record Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} title="تعديل السجل الطبي">
        {selectedRecord && renderFormFields(selectedRecord, setSelectedRecord)}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button onClick={() => setShowEditModal(false)} className="btn btn-secondary">
            إلغاء
          </button>
          <button onClick={handleEditRecord} className="btn btn-primary">
            حفظ التغييرات
          </button>
        </div>
      </Modal>

      {/* View Record Modal */}
      <Modal show={showViewModal} onClose={() => setShowViewModal(false)} title="تفاصيل السجل الطبي">
        {selectedRecord && (
          <div>
            <div className="d-flex align-items-center gap-2 mb-4">
              {getTypeIcon(selectedRecord.type)}
              <h5 className="mb-0">{selectedRecord.title}</h5>
              <span className={`badge ${getTypeColor(selectedRecord.type)}`}>
                {getTypeLabel(selectedRecord.type)}
              </span>
              {selectedRecord.severity && (
                <span className={`badge ${getSeverityColor(selectedRecord.severity)}`}>
                  {getSeverityLabel(selectedRecord.severity)}
                </span>
              )}
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <h6 className="fw-bold">التاريخ</h6>
                <p>{new Date(selectedRecord.date).toLocaleDateString("ar-EG")}</p>
              </div>

              {selectedRecord.description && (
                <div className="col-12">
                  <h6 className="fw-bold">الوصف</h6>
                  <p>{selectedRecord.description}</p>
                </div>
              )}

              {selectedRecord.location && (
                <div className="col-md-6">
                  <h6 className="fw-bold">المكان</h6>
                  <p>{selectedRecord.location}</p>
                </div>
              )}

              {selectedRecord.duration && (
                <div className="col-md-6">
                  <h6 className="fw-bold">المدة</h6>
                  <p>{selectedRecord.duration}</p>
                </div>
              )}

              {selectedRecord.triggers && (
                <div className="col-12">
                  <h6 className="fw-bold">المسببات</h6>
                  <p>{selectedRecord.triggers}</p>
                </div>
              )}

              {selectedRecord.medications && (
                <div className="col-md-6">
                  <h6 className="fw-bold">الدواء</h6>
                  <p>{selectedRecord.medications}</p>
                </div>
              )}

              {selectedRecord.dosage && (
                <div className="col-md-6">
                  <h6 className="fw-bold">الجرعة</h6>
                  <p>{selectedRecord.dosage}</p>
                </div>
              )}

              {selectedRecord.frequency && (
                <div className="col-md-6">
                  <h6 className="fw-bold">عدد المرات</h6>
                  <p>{selectedRecord.frequency}</p>
                </div>
              )}

              {selectedRecord.sideEffects && (
                <div className="col-md-6">
                  <h6 className="fw-bold">الأعراض الجانبية</h6>
                  <p>{selectedRecord.sideEffects}</p>
                </div>
              )}

              {selectedRecord.doctorName && (
                <div className="col-md-6">
                  <h6 className="fw-bold">اسم الطبيب</h6>
                  <p>{selectedRecord.doctorName}</p>
                </div>
              )}

              {selectedRecord.hospital && (
                <div className="col-md-6">
                  <h6 className="fw-bold">المستشفى/العيادة</h6>
                  <p>{selectedRecord.hospital}</p>
                </div>
              )}

              {selectedRecord.diagnosis && (
                <div className="col-12">
                  <h6 className="fw-bold">التشخيص</h6>
                  <p>{selectedRecord.diagnosis}</p>
                </div>
              )}

              {selectedRecord.treatment && (
                <div className="col-12">
                  <h6 className="fw-bold">العلاج</h6>
                  <p>{selectedRecord.treatment}</p>
                </div>
              )}

              {selectedRecord.followUp && (
                <div className="col-12">
                  <h6 className="fw-bold">المتابعة</h6>
                  <p>{selectedRecord.followUp}</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div className="col-12">
                  <h6 className="fw-bold">ملاحظات إضافية</h6>
                  <p>{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
};

export default PatientMedicalRecords;
