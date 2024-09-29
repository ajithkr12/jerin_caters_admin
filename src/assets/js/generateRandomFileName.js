function generateRandomFileName(extension) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10); // Generate a random string
  return `${randomString}_${timestamp}${extension}`;
}
