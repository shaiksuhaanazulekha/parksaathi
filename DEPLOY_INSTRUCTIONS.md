# How to Deploy ParkSaathi to Vercel (Live Website)

Your code is on GitHub. To make it a live website like `https://parksaathi.vercel.app/`, follow these simple steps:

1.  **Go to Vercel**: [https://vercel.com/new](https://vercel.com/new)
2.  **Import Repository**: You will see `parksaathi` in the list from GitHub. Click **Import**.
3.  **Configure Project**:
    *   **Framework Preset**: Select `Vite`.
    *   **Root Directory**: Click `Edit` and select `client`. **(Crucial Step!)**
4.  **Environment Variables**:
    *   Add `VITE_GOOGLE_MAPS_API_KEY` if you have one (optional, since we switched to Leaflet).
5.  **Click Deploy**: Wait ~1 minute.

🎉 **Success!** You will get a live URL: `https://parksaathi.vercel.app`.
