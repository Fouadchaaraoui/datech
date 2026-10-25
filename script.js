const cards = document.querySelectorAll('.card');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.animate(
        [{opacity:0, transform:'translateY(20px)'},{opacity:1, transform:'translateY(0)'}],
        {duration:550, easing:'ease-out', fill:'forwards'}
      );
      observer.unobserve(entry.target);
    }
  });
},{threshold:.12});
cards.forEach(card => observer.observe(card));
