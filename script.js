if (sessionStorage.getItem('isLoggedIn') !== 'true' && window.location.pathname.includes('bidzz.html')) {
  window.location.href = 'index.html';
}

function decryptString(encrypted, key) {
  if (!encrypted || !key) throw new Error('String and key cannot be empty');
  const keyChars = key.split('');
  const hexArray = encrypted.match(/.{1,2}/g);
  if (!hexArray) throw new Error('Invalid encrypted string');
  const result = Array(hexArray.length).fill('');
  
  let seed = key.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const random = (max) => {
    seed = (seed * 9301 + 49297) % 233280;
    return Math.floor((seed / 233280) * max);
  };
  
  const indices = [...Array(hexArray.length).keys()];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  for (let i = 0; i < hexArray.length; i++) {
    result[indices[i]] = hexArray[i];
  }
  
  return result
    .map((hex, i) => String.fromCharCode(parseInt(hex, 16) ^ keyChars[i % keyChars.length].charCodeAt(0)))
    .join('');
}

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const usernameInput = document.getElementById('username').value.trim();
  const passwordInput = document.getElementById('password').value.trim();
  const loginBtn = document.getElementById('loginBtn');
  const dialogModal = document.getElementById('dialogModal');
  const dialogTitle = document.getElementById('dialogTitle');
  const dialogMessage = document.getElementById('dialogMessage');
  const closeModal = document.getElementById('closeModal');
  
  loginBtn.disabled = true;
  const sanitizeInput = (input) => input.replace(/[<>"'&]/g, '');
  const encryptedUrl = "770c2f1930371b0a1a10233417174605531c6d2e692a1c0206105a5f151f551201";
  const key = "FuckYouBitch";
  
  let decryptedUrl;
  try {
    decryptedUrl = decryptString(encryptedUrl, key);
    if (!decryptedUrl || !decryptedUrl.startsWith('https://pastebin.com/raw/g04EXevY')) throw new Error('Failed to decrypt URL');
  } catch (error) {
    console.error('Decryption Error:', error);
    $(loginBtn).addClass('animate-failure');
    setTimeout(() => {
      dialogTitle.textContent = 'Error';
      dialogMessage.textContent = 'An error occurred while processing the request. Please try again later.';
      dialogModal.style.display = 'flex';
      closeModal.addEventListener('click', () => dialogModal.style.display = 'none', { once: true });
      $(loginBtn).removeClass('animate-failure');
      loginBtn.disabled = false;
    }, 10000);
    return;
  }
  
  try {
    const response = await fetch(decryptedUrl);
    if (!response.ok) throw new Error('Failed to fetch user data');
    const data = await response.text();
    
    const users = [];
    const lines = data.split('\n');
    let currentUser = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('username :')) {
        currentUser = { username: trimmedLine.replace('username :', '').replace(/"/g, '').trim() };
      } else if (trimmedLine.startsWith('password :') && currentUser) {
        currentUser.password = trimmedLine.replace('password :', '').replace(/"/g, '').trim();
        users.push(currentUser);
        currentUser = null;
      }
    }
    
    const user = users.find(
      (u) => u.username === sanitizeInput(usernameInput) && u.password === sanitizeInput(passwordInput)
    );
    
    if (user) {
      $(loginBtn).addClass('animate-success');
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('username', sanitizeInput(usernameInput));
      setTimeout(() => {
        dialogTitle.textContent = 'Success';
        dialogMessage.textContent = `Welcome, ${usernameInput}! You have successfully logged in.`;
        dialogModal.style.display = 'flex';
        closeModal.addEventListener('click', () => {
          dialogModal.style.display = 'none';
          window.location.href = 'https://t.me/bidzz7';
        }, { once: true });
        $(loginBtn).removeClass('animate-success');
      }, 10000);
    } else {
      $(loginBtn).addClass('animate-failure');
      setTimeout(() => {
        dialogTitle.textContent = 'Error';
        dialogMessage.textContent = 'Invalid username or password. Please try again.';
        dialogModal.style.display = 'flex';
        closeModal.addEventListener('click', () => dialogModal.style.display = 'none', { once: true });
        $(loginBtn).removeClass('animate-failure');
      }, 10000);
    }
  } catch (error) {
    console.error('Error:', error);
    $(loginBtn).addClass('animate-failure');
    setTimeout(() => {
      dialogTitle.textContent = 'Error';
      dialogMessage.textContent = 'An error occurred while trying to log in. Please try again later.';
      dialogModal.style.display = 'flex';
      closeModal.addEventListener('click', () => dialogModal.style.display = 'none', { once: true });
      $(loginBtn).removeClass('animate-failure');
    }, 10000);
  } finally {
    setTimeout(() => loginBtn.disabled = false, 10000);
  }
});
