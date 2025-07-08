export const encodeId = (guid) => {
    return btoa(guid).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };
  
  export const decodeId = (encryptedId) => {
    try {
      const decoded = atob(encryptedId);
      return decoded;
    } catch (error) {
      throw new Error('Invalid ID format');
    }
  };