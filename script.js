document.getElementById('action').addEventListener('click', function(){
  const now = new Date().toLocaleTimeString();
  alert('Hello — you clicked the button!\nTime: ' + now);
});
