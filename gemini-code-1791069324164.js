async function send() {
  const text = $('#ci').value.trim();
  if (!text && !attachedImageBase64) return;

  // Display user prompt in chat
  msg(text, 'u');

  // Request AI generation (3D Parts + Generated Image)
  const response = await fetch('/api/generate-cad', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: text, userImageBase64: attachedImageBase64 })
  });

  const { 3dData, imageUrl } = await response.json();

  // A. Build 3D primitives on bed grid
  const newlyMadeMeshes = buildParts(3dData.parts);

  // B. Render generated image directly inside the chat window
  const chatMsg = msg(3dData.reply, 'a');
  const imgElement = document.createElement('img');
  imgElement.className = 'fig';
  imgElement.src = imageUrl;
  chatMsg.appendChild(imgElement);

  // C. Project image onto a 3D plate in the diagram
  const imageTexture = new Image();
  imageTexture.onload = () => {
    // Uses WebCAD3D's existing primitive builder to place image plate on bed
    const plate = addMesh(weld(new THREE.BoxGeometry(80, 80, 2)), "AI Diagram Plate");
    applyImg(plate, imageTexture);
  };
  imageTexture.src = imageUrl;

  // Reset image attachment state
  attachedImageBase64 = null;
}