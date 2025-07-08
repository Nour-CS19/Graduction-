import React from 'react';  // Add this line
import { Modal, Form, Button } from "react-bootstrap";
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import { labValidationSchema } from "../utils/validationSchemas"; // You should define this validation schema for lab data
const LabFormModal = ({ show, handleClose, handleSubmit, editData }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{editData ? "Edit Lab" : "Add New Lab"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Formik
          initialValues={{
            name: editData ? editData.name : "",
            location: editData ? editData.location : "",
          }}
          validationSchema={labValidationSchema}
          onSubmit={(values) => {
            handleSubmit(values); // Pass values back to parent
          }}
        >
          {() => (
            <FormikForm>
              <Form.Group controlId="name">
                <Form.Label>Lab Name</Form.Label>
                <Field type="text" name="name" className="form-control" />
                <ErrorMessage name="name" component="div" className="text-danger" />
              </Form.Group>

              <Form.Group controlId="location">
                <Form.Label>Location</Form.Label>
                <Field type="text" name="location" className="form-control" />
                <ErrorMessage name="location" component="div" className="text-danger" />
              </Form.Group>

              <Button variant="primary" type="submit">
                {editData ? "Update Lab" : "Add Lab"}
              </Button>
            </FormikForm>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default LabFormModal;
