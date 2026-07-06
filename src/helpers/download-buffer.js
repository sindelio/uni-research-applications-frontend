function downloadBuffer(bufferObj, fileName) {
  const bytes = new Uint8Array(bufferObj.data.data);
  const blob = new Blob([bytes], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'arquivo-projeto';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export default downloadBuffer;