import { useState, useEffect, useCallback } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Using same key usually works if enabled for both

export const useGoogleDrive = () => {
    const [tokenClient, setTokenClient] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [pickerApiLoaded, setPickerApiLoaded] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            window.gapi.load('picker', () => setPickerApiLoaded(true));
        };
        document.body.appendChild(script);

        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.onload = () => {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/drive.file',
                callback: (response) => {
                    if (response.error) {
                        console.error('GIS Error:', response);
                    } else {
                        setAccessToken(response.access_token);
                    }
                },
            });
            setTokenClient(client);
        };
        document.body.appendChild(gisScript);
    }, []);

    const openPicker = useCallback((onSelect) => {
        if (!accessToken) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
            return;
        }

        if (pickerApiLoaded && accessToken) {
            const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
            view.setMimeTypes('image/*');

            const picker = new window.google.picker.PickerBuilder()
                .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
                .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
                .setAppId(GOOGLE_CLIENT_ID)
                .setOAuthToken(accessToken)
                .addView(view)
                .setDeveloperKey(GOOGLE_API_KEY)
                .setCallback((data) => {
                    if (data.action === window.google.picker.Action.PICKED) {
                        onSelect(data.docs);
                    }
                })
                .build();
            picker.setVisible(true);
        }
    }, [accessToken, pickerApiLoaded, tokenClient]);

    return { openPicker, accessToken };
};
