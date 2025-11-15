-- Clean up expired seasonal challenges
DELETE FROM seasonal_challenges 
WHERE end_date < NOW();