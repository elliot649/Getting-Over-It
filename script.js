async function loadSite() {
  const input = document.getElementById('address');
  const iframe = document.getElementById('view');
  const status = document.getElementById('status');

  let target = input.value.trim();
  if (!target.startsWith("http")) target = "https://" + target;

  try {
    status.textContent = "Loading " + target + "...";
    const res = await fetch("/api/fetch?u=" + encodeURIComponent(target));

    if (!res.ok) {
      status.textContent = "Error: " + res.status + " " + res.statusText;
      return;
    }

    const text = await res.text();
    // Load into iframe
    iframe.srcdoc = text;
    status.textContent = "Loaded: " + target;
  } catch (e) {
    status.textContent = "Error: " + e;
  }
}
