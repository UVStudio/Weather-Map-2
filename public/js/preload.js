window.addEventListener('load', () => {
  const loader = document.querySelector('.loader')
  setTimeout(() => {
    loader.className += ' hiddenLoader' }, 2000);
})