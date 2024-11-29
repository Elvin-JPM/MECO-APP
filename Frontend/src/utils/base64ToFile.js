const base64ToFile = (base64, fileName) => {
  // Regex to detect MIME type prefix
  const regex = /^data:image\/(.*?);base64,/;
  let mimeType = "image/jpeg"; // Default MIME type
  let base64Data = base64;

  // Check for MIME type prefix
  const match = base64.match(regex);
  if (match) {
    mimeType = match[1]; // Extract MIME type
    base64Data = base64.split(",")[1]; // Extract base64 data after the comma
  } else {
    console.warn("No MIME type prefix detected. Assuming JPEG format.");
  }

  try {
    // Decode base64 string to binary data
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
      const slice = byteCharacters.slice(offset, offset + 1024);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    // Create a File object
    return new File(byteArrays, fileName, { type: mimeType });
  } catch (error) {
    console.error("Error decoding base64 string:", error);
    return null;
  }
};

export default base64ToFile;
