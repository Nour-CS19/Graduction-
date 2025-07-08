const BASE_URL = "https://physiocareapp.runasp.net";


export async function fetchAllCities() {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/Citys/GetAll`);
    if (!response.ok) {
      throw new Error(`Error fetching cities: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching cities:", error);
    throw error;
  }
}

/**
 * GET /api/v1/Nursings/GetAll
 * Retrieves an array of nursing services.
 */
export async function fetchAllNursingServices() {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/Nursings/GetAll`);
    if (!response.ok) {
      throw new Error(`Error fetching nursing services: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching nursing services:", error);
    throw error;
  }
}

/**
 * POST /api/v1/PatientBookNurse/AddNewBooking
 * Creates a new booking.
 * Expected Request Body:
 * {
 *   "nurseID": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
 *   "patientID": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
 *   "appNurseID": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
 *   "medicalCondition": "string"
 * }
 */
export async function createNurseBooking(payload) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/PatientBookNurse/AddNewBooking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Error creating booking: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

/**
 * DELETE /api/v1/PatientBookNurse/DeleteBooking
 * Deletes a booking using its ID.
 * Request Body:
 * {
 *   "id": "booking-guid"
 * }
 */
export async function deleteNurseBooking(bookingId) {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/PatientBookNurse/DeleteBooking`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId }),
    });
    if (!response.ok) {
      throw new Error(`Error deleting booking: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
}

export default {
  fetchAllCities,
  fetchAllNursingServices,
  createNurseBooking,
  deleteNurseBooking,
};
