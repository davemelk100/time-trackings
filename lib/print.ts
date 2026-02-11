export function handlePrint() {
  const html = document.documentElement;
  const wasDark = html.classList.contains("dark");

  if (wasDark) {
    html.classList.remove("dark");
  }

  // Let the browser repaint with light mode before opening the print dialog
  requestAnimationFrame(() => {
    window.print();

    if (wasDark) {
      html.classList.add("dark");
    }
  });
}
