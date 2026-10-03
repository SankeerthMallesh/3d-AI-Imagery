let attachedImageBase64 = null;

// Trigger hidden file picker
$('#chatImgBtn').onclick = () => $('#chatImgInput').click();

$('#chatImgInput').onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = () => {
    attachedImageBase64 = reader.result;
    log("Image attached! Ready to process.");
  };
  reader.readAsDataURL(file);
};