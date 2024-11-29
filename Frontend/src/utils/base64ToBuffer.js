function base64ToBuffer(base64) {
  // Remove the 'data:image/*;base64,' prefix if it exists
  const base64String = base64.split(",")[1] || base64;

  // Decode the base64 string into byte characters
  const byteCharacters = atob(base64String);

  // Create a byte array from the decoded byte characters
  const byteArray = new Uint8Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }

  return byteArray; // Return as a buffer
}

export default base64ToBuffer;
