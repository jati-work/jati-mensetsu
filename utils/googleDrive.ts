const CLIENT_ID = '699212224403-5epn7koolk09rkeqh164s2gf7ktlea6g.apps.googleusercontent.com';
const API_KEY = ''; // Kosongkan aja, nggak perlu API key
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient: any;
let accessToken: string | null = null;

export const initGoogleDrive = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.access_token) {
            accessToken = response.access_token;
            resolve(true);
          }
        },
      });
      resolve(true);
    };
    document.head.appendChild(script);
  });
};

export const requestGoogleAuth = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (accessToken) {
      resolve(accessToken);
      return;
    }
    
    if (tokenClient) {
      tokenClient.callback = (response: any) => {
        if (response.access_token) {
          accessToken = response.access_token;
          resolve(accessToken);
        } else {
          reject('No access token');
        }
      };
      tokenClient.requestAccessToken();
    } else {
      reject('Token client not initialized');
    }
  });
};

export const uploadToDrive = async (file: File): Promise<{ fileId: string; webViewLink: string; name: string }> => {
  const token = await requestGoogleAuth();
  
  const metadata = {
    name: file.name,
    mimeType: file.type,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  
  // Make file publicly accessible
  await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone',
    }),
  });

  return {
    fileId: data.id,
    webViewLink: data.webViewLink,
    name: data.name,
  };
};
