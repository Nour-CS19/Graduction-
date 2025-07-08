import React, { useState, useEffect } from 'react';
import { nurseService } from '../Services/NurseService';
import NurseTable from './NurseTable';
import NurseForm from './NurseForm';
import NurseDetailsModal from './NurseDetailsModal';

const Nurse = () => {
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchNurses();
  }, []);

  const fetchNurses = async () => {
    try {
      const data = await nurseService.getAllNurses();
      setNurses(data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching nurses');
      setLoading(false);
    }
  };

  return (
    <div className="nurse-container">
      <button className="add-button" onClick={() => setShowForm(true)}>
        Add New Nurse
      </button>

      {error && <div className="error">{error}</div>}

      <NurseTable
        nurses={nurses}
        onView={(nurse) => {
          setSelectedNurse(nurse);
          setShowDetails(true);
        }}
        onEdit={(nurse) => {
          setSelectedNurse(nurse);
          setShowForm(true);
        }}
        onDelete={fetchNurses}
      />

      {showForm && (
        <NurseForm
          nurse={selectedNurse}
          onSubmit={fetchNurses}
          onClose={() => {
            setShowForm(false);
            setSelectedNurse(null);
          }}
        />
      )}

      {showDetails && selectedNurse && (
        <NurseDetailsModal
          nurse={selectedNurse}
          onClose={() => {
            setShowDetails(false);
            setSelectedNurse(null);
          }}
        />
      )}
    </div>
  );
};

export default Nurse;