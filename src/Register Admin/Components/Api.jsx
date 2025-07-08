const BASE_URL = "https://physiocareapp.runasp.net";

// Helper function to generate fetch options based on payload type.
const getRequestOptions = (payload) => {
  if (payload instanceof FormData) {
    // For FormData (e.g. when sending files), let the browser set the Content-Type.
    return {
      method: "POST",
      body: payload,
    };
  }
  // Otherwise, send as JSON.
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  };
};

// Helper function to safely parse the response.
const parseResponse = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.warn("Failed to parse JSON, returning raw text:", text);
    return text;
  }
};

// Register Admin
export const registerAdmin = async (payload) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/Account/RegisterAdmin`,
      getRequestOptions(payload)
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Registration failed for Admin");
    }
    return await parseResponse(response);
  } catch (err) {
    console.error("Error in registerAdmin:", err);
    throw err;
  }
};

// Register Doctor
export const registerDoctor = async (payload) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/Account/RegisterDoctor`,
      getRequestOptions(payload)
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Registration failed for Doctor");
    }
    return await parseResponse(response);
  } catch (err) {
    console.error("Error in registerDoctor:", err);
    throw err;
  }
};

// Register Nurse
export const registerNurse = async (payload) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/Account/RegisterNurse`,
      getRequestOptions(payload)
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Registration failed for Nurse");
    }
    return await parseResponse(response);
  } catch (err) {
    console.error("Error in registerNurse:", err);
    throw err;
  }
};

// Register Patient
export const registerPatient = async (payload) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/Account/RegisterPatient`,
      getRequestOptions(payload)
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Registration failed for Patient");
    }
    return await parseResponse(response);
  } catch (err) {
    console.error("Error in registerPatient:", err);
    throw err;
  }
};

// Register Laboratory
export const registerLaboratory = async (payload) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/Account/RegisterLaboratory`,
      getRequestOptions(payload)
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Registration failed for Laboratory");
    }
    return await parseResponse(response);
  } catch (err) {
    console.error("Error in registerLaboratory:", err);
    throw err;
  }
};

export default {
  registerAdmin,
  registerDoctor,
  registerNurse,
  registerPatient,
  registerLaboratory,
};
