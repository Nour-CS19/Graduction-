/*

// src/components/TableList.js
import React from "react";
import { Table, Button } from "react-bootstrap";

const TableList = ({ data, onDelete, onEdit }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          {data.length > 0 &&
            Object.keys(data[0]).map((key) => <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>)}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            {Object.values(item).map((value, index) => (
              <td key={index}>{value}</td>
            ))}
            <td>
              <Button
                variant="warning"
                size="sm"
                className="me-2"
                onClick={() => onEdit(item)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(item.id)}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TableList;



*/

/*
import React from "react";

const TableList = ({ data, onDelete, onEdit }) => {
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <tr key={index}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.email}</td>
              <td>{item.phone}</td>
              <td>
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => onEdit(item)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm ml-2"
                  onClick={() => onDelete(item.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center">
              No records found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default TableList;


*/ 