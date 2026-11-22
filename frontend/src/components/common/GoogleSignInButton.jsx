import React, { useEffect, useRef } from 'react';
import { GOOGLE_CLIENT_ID } from '../../config/env';

export const GoogleSignInButton = ({ onGoogleResponse, text = 'signin_with' }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (window.google && GOOGLE_CLIENT_ID) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response && response.credential) {
              onGoogleResponse(response.credential);
            }
          }
        });

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text
          });
        }
      } catch (err) {
        console.error('Google button initialization failed:', err);
      }
    }
  }, [onGoogleResponse, text]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div data-testid="google-signin-container" className="w-full flex justify-center my-3">
      <div ref={buttonRef} data-testid="google-signin-button" className="w-full flex justify-center"></div>
    </div>
  );
};
