-- Enable leaked password protection for better security
ALTER ROLE authenticator SET app.settings.leaked_password_protection = 'true';